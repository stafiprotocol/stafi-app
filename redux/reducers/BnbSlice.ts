import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getEthChainId } from "config/metaMask";
import { ChainId, TokenName, TokenStandard } from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import { sleep, stafiUuid } from "utils/common";
import {
  BLOCK_HASH_NOT_FOUND_MESSAGE,
  CANCELLED_MESSAGE,
} from "utils/constants";
import snackbarUtil from "utils/snackbarUtils";
import { createWeb3, getMetaMaskTxErrorMsg } from "utils/web3Utils";
import Web3 from "web3";
import {
  addNotice,
  resetStakeLoadingParams,
  setIsLoading,
  setRedeemLoadingParams,
  StakeLoadingProgressDetailItem,
  updateStakeLoadingParams,
} from "./AppSlice";
import CommonSlice from "./CommonSlice";
import {
  bond,
  fisUnbond,
  getMinting,
  getUnbondTransactionFees,
} from "./FisSlice";
import keyring from "servers/keyring";
import { u8aToHex } from "@polkadot/util";
import numberUtil from "utils/numberUtil";
import { getBnbStakePortalAbi, getBnbStakePortalAddress } from "config/bnb";
import { getBnbScanTxUrl, getEtherScanTxUrl } from "config/explorer";
import { LocalNotice } from "utils/notice";
import { addRTokenUnbondRecords } from "utils/storage";
import dayjs from "dayjs";
import { estimateUnbondDays } from "config/unbond";

const commonSlice = new CommonSlice();

export interface BnbState {
  balance: string;
  stakedAmount: string;
  validPools: any[];
  poolLimit: any;
  unbondFee: string;
  bondFee: string;
  relayFee: string | undefined;
  unbondCommision: string;
  unbondTxFees: string | undefined;
}

const initialState: BnbState = {
  balance: "--",
  stakedAmount: "--",
  validPools: [],
  poolLimit: 0,
  bondFee: "--",
  unbondFee: "--",
  unbondCommision: "--",
  relayFee: undefined,
  unbondTxFees: undefined,
};

export const bnbSlice = createSlice({
  name: "bnb",
  initialState,
  reducers: {
    setBalance: (state: BnbState, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setStakedAmount: (state: BnbState, action: PayloadAction<string>) => {
      state.stakedAmount = action.payload;
    },
    setValidPools: (state: BnbState, action: PayloadAction<any | null>) => {
      if (action.payload === null) {
        state.validPools = [];
      } else {
        state.validPools.push(action.payload);
      }
    },
    setPoolLimit: (state: BnbState, action: PayloadAction<any>) => {
      state.poolLimit = action.payload;
    },
    setBondFee: (state: BnbState, action: PayloadAction<string>) => {
      state.bondFee = action.payload;
    },
    setUnbondFee: (state: BnbState, action: PayloadAction<string>) => {
      state.unbondFee = action.payload;
    },
    setUnbondCommision: (state: BnbState, action: PayloadAction<string>) => {
      state.unbondCommision = action.payload;
    },
    setRelayFee: (state: BnbState, action: PayloadAction<string>) => {
      state.relayFee = action.payload;
    },
    setUnbondTxFee: (state: BnbState, action: PayloadAction<string>) => {
      state.unbondTxFees = action.payload;
    },
  },
});

export const {
  setBalance,
  setStakedAmount,
  setValidPools,
  setPoolLimit,
  setBondFee,
  setUnbondFee,
  setUnbondCommision,
  setRelayFee,
  setUnbondTxFee,
} = bnbSlice.actions;

declare const ethereum: any;

export default bnbSlice.reducer;

export const updateBnbBalance = (): AppThunk => async (dispatch, getState) => {
  const account = getState().wallet.metaMaskAccount;
  if (!account) return;

  try {
    const balance = await ethereum.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });
    dispatch(setBalance(Web3.utils.fromWei(balance.toString())));
  } catch (err) {
    console.error(err);
  }
};

/**
 * stake BNB
 */
export const handleBnbStake =
  (
    stakeAmount: string,
    willReceiveAmount: string,
    tokenStandard: TokenStandard | undefined,
    targetAddress: string,
    newTotalStakedAmount: string,
    txFee: string,
    isReTry: boolean,
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    let chainId = ChainId.STAFI;
    if (tokenStandard === TokenStandard.ERC20) {
      chainId = ChainId.ETH;
    } else if (tokenStandard === TokenStandard.BEP20) {
      chainId = ChainId.BSC;
    } else if (tokenStandard === TokenStandard.SPL) {
      chainId = ChainId.SOL;
    }

    const noticeUuid = isReTry
      ? getState().app.stakeLoadingParams?.noticeUuid
      : stafiUuid();
    const sendingParams = {
      amount: stakeAmount,
      willReceiveAmount,
      tokenStandard,
      newTotalStakedAmount,
      targetAddress,
      txFee,
    };

    dispatch(setIsLoading(true));

    try {
      let steps = ["staking", "minting"];
      if (tokenStandard !== TokenStandard.Native) {
        steps.push("swapping");
      }

      dispatch(
        resetStakeLoadingParams({
          modalVisible: true,
          noticeUuid,
          status: "loading",
          tokenName: TokenName.BNB,
          amount: stakeAmount,
          willReceiveAmount: willReceiveAmount,
          newTotalStakedAmount,
          targetAddress,
          tokenStandard,
          steps,
          progressDetail: {
            sending: {
              totalStatus: "loading",
            },
            sendingParams,
            staking: {},
            minting: {},
            swapping: {},
          },
        })
      );

      const web3 = createWeb3();
      const amount = web3.utils.toWei(stakeAmount, "ether");
      const msgValue = web3.utils.toWei(
        Number(stakeAmount) + Number(txFee) + "",
        "ether"
      );

      const validPools = getState().bnb.validPools;
      const poolLimit = getState().bnb.poolLimit;

      const metaMaskAccount = getState().wallet.metaMaskAccount;
      if (!metaMaskAccount) {
        throw new Error("Please connect MetaMask");
      }

      const selectedPool = commonSlice.getPool(amount, validPools, poolLimit);
      if (!selectedPool) {
        throw new Error("Invalid pool");
      }

      const polkadotAccount = getState().wallet.polkadotAccount;
      const stakePortalAddress = getBnbStakePortalAddress();
      const contractStakePortal = new web3.eth.Contract(
        getBnbStakePortalAbi(),
        stakePortalAddress,
        { from: metaMaskAccount }
      );
      const keyringInstance = keyring.init(Symbol.Fis);
      const polkadotPubKey = u8aToHex(
        keyringInstance.decodeAddress(polkadotAccount as string)
      );

      dispatch(
        updateStakeLoadingParams({
          progressDetail: {
            staking: {
              totalStatus: "loading",
              broadcastStatus: "loading",
            },
          },
          customMsg: `Please confirm the ${stakeAmount} BNB staking transaction in your MetaMask wallet`,
        })
      );

      const stakeResult = await contractStakePortal.methods
        .stake(
          selectedPool.poolPubKey,
          amount,
          chainId.toString(),
          polkadotPubKey,
          metaMaskAccount
        )
        .send({ value: msgValue });
      if (!stakeResult || !stakeResult.status) {
        throw new Error(getMetaMaskTxErrorMsg(stakeResult));
      }

      dispatch(
        updateStakeLoadingParams({
          customMsg: "Staking processing, please wait for a moment",
        })
      );

      const txHash = stakeResult.transactionHash;
      let txDetail;
      while (true) {
        await sleep(5000);
        txDetail = await ethereum
          .request({
            method: "eth_getTransactionByHash",
            params: [txHash],
          })
          .catch((err: any) => {
            throw new Error(BLOCK_HASH_NOT_FOUND_MESSAGE);
          });

        if (txDetail.blockHash || !txDetail) {
          break;
        }
      }
      const blockHash = txDetail && txDetail.blockHash;
      if (!blockHash) {
        throw new Error(BLOCK_HASH_NOT_FOUND_MESSAGE);
      }

      dispatch(
        updateStakeLoadingParams(
          {
            progressDetail: {
              staking: {
                totalStatus: "success",
                broadcastStatus: "success",
                packStatus: "success",
                txHash: txHash,
              },
            },
            customMsg: "Minting processing, please wait for a moment",
            scanUrl: getBnbScanTxUrl(txHash),
            txHash: txHash,
          },
          (newParams) => {
            const newNotice: LocalNotice = {
              id: noticeUuid || stafiUuid(),
              type: "rToken Stake",
              txDetail: { transactionHash: txHash, sender: metaMaskAccount },
              data: {
                tokenName: TokenName.BNB,
                amount: Number(stakeAmount) + "",
                willReceiveAmount: Number(willReceiveAmount) + "",
              },
              scanUrl: getBnbScanTxUrl(stakeResult.transactionHash),
              status: "Pending",
              stakeLoadingParams: newParams,
            };
            dispatch(addNotice(newNotice));
          }
        )
      );

      dispatch(setIsLoading(false));
      dispatch(
        getMinting(
          rSymbol.Bnb,
          txHash,
          blockHash,
          chainId,
          willReceiveAmount,
          cb
        )
      );
    } catch (err: any) {
      cb && cb(false);
      console.error(err);
      dispatch(setIsLoading(false));
      if (err.code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        dispatch(resetStakeLoadingParams(undefined));
      } else {
        snackbarUtil.error(err.message);
        let sendingDetail: StakeLoadingProgressDetailItem = {
          totalStatus: "error",
          broadcastStatus: "error",
        };
        if (err.message === BLOCK_HASH_NOT_FOUND_MESSAGE) {
          sendingDetail = {
            totalStatus: "error",
            broadcastStatus: "success",
            packStatus: "error",
          };
        }
        dispatch(
          updateStakeLoadingParams(
            {
              displayMsg: err.message,
              errorStep: "sending",
              status: "error",
              progressDetail: {
                sending: sendingDetail,
                staking: {},
                minting: {},
              },
            },
            (newParams) => {
              dispatch(
                addNotice({
                  id: noticeUuid || stafiUuid(),
                  type: "rToken Stake",
                  data: {
                    tokenName: TokenName.BNB,
                    amount: stakeAmount,
                    willReceiveAmount: willReceiveAmount,
                  },
                  status: "Error",
                  stakeLoadingParams: newParams,
                })
              );
            }
          )
        );
      }
    }
  };

export const getPools = (): AppThunk => async (dispatch, setState) => {
  commonSlice.getPools(rSymbol.Bnb, Symbol.Bnb, (data: any) => {
    dispatch(setValidPools(data));
  });

  const data = await commonSlice.poolBalanceLimit(rSymbol.Bnb);
  dispatch(setPoolLimit(data));
};

export const unbondRBnb =
  (
    amount: string,
    recipient: string,
    willReceiveAmount: string,
    newTotalStakedAmount: string,
    cb?: (success?: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setIsLoading(true));
    dispatch(
      setRedeemLoadingParams({
        modalVisible: true,
        status: "loading",
        targetAddress: recipient,
        tokenName: TokenName.BNB,
        amount,
        willReceiveAmount,
        newTotalStakedAmount,
        customMsg: `Please confirm the ${Number(
          amount
        )} rBNB unstaking transaction in your MetaMask wallet`,
      })
    );

    try {
      const validPools = getState().bnb.validPools;
      let selectedPool = commonSlice.getPoolForUnbond(
        amount,
        validPools,
        rSymbol.Bnb
      );
      if (!selectedPool) {
        cb && cb();
        throw new Error("No selected pool");
      }
      const keyringInstance = keyring.init(Symbol.Bnb);

      dispatch(
        fisUnbond(
          amount,
          rSymbol.Bnb,
          u8aToHex(keyringInstance.decodeAddress(recipient)),
          selectedPool.poolPubKey,
          "",
          (r?: string, txHash?: string) => {
            const uuid = stafiUuid();
            if (r === "Success") {
              addRTokenUnbondRecords(TokenName.BNB, {
                id: uuid,
                txHash,
                estimateSuccessTime: dayjs()
                  .add(estimateUnbondDays(TokenName.BNB), "d")
                  .valueOf(),
                amount: willReceiveAmount,
                rTokenAmount: amount,
                recipient,
                txTimestamp: dayjs().unix(),
              });
              const metaMaskAccount = getState().wallet.metaMaskAccount;
              if (txHash && metaMaskAccount) {
                dispatch(
                  addNotice({
                    id: uuid,
                    type: "rToken Unstake",
                    data: {
                      tokenName: TokenName.BNB,
                      amount: amount,
                      willReceiveAmount: willReceiveAmount,
                    },
                    scanUrl: getEtherScanTxUrl(txHash),
                    status: "Confirmed",
                  })
                );
              }
              cb && cb();
            } else if (r === "Failed") {
              dispatch(
                addNotice({
                  id: uuid,
                  type: "rToken Unstake",
                  data: {
                    tokenName: TokenName.BNB,
                    amount: amount,
                    willReceiveAmount: willReceiveAmount,
                  },
                  status: "Error",
                })
              );
              cb && cb();
            }
          }
        )
      );
    } catch (err: any) {
      dispatch(setIsLoading(false));
      console.error(err);
    } finally {
      dispatch(updateBnbBalance());
      cb && cb();
    }
  };

export const getBondFee = (): AppThunk => async (dispatch, getState) => {
  const bondFee = await commonSlice.getBondFees(rSymbol.Bnb);
  if (bondFee) {
    dispatch(setBondFee(Number(bondFee).toString()));
  }
};

export const getUnbondFee = (): AppThunk => async (dispatch, getState) => {
  const unbondFee = await commonSlice.getUnbondFees(rSymbol.Bnb);
  if (unbondFee) {
    dispatch(setUnbondFee(Number(unbondFee).toString()));
  }
};

export const getUnbondCommision =
  (): AppThunk => async (dispatch, getState) => {
    const unbondCommision = await commonSlice.getUnbondCommision();
    if (unbondCommision) {
      dispatch(setUnbondCommision(unbondCommision.toString()));
    }
  };

/**
 * query relay fee from staking portal contract
 */
export const getBnbStakeRelayFee =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const web3 = createWeb3();
      const portalContract = new web3.eth.Contract(
        getBnbStakePortalAbi(),
        getBnbStakePortalAddress()
      );
      let feeResult = await portalContract.methods.relayFee().call();
      feeResult = feeResult || "1000000000000000"; // 0.001
      const relayFee = web3.utils.fromWei(feeResult);
      dispatch(setRelayFee(relayFee));
    } catch (err: any) {}
  };

export const getBnbUnbondTxFees =
  (amount: string, recipient: string): AppThunk =>
  async (dispatch, getState) => {
    if (!recipient) return;
    const validPools = getState().bnb.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      amount,
      validPools,
      rSymbol.Bnb
    );
    if (!selectedPool) return;
    const keyringInstance = keyring.init(Symbol.Bnb);
    dispatch(
      getUnbondTransactionFees(
        amount,
        rSymbol.Bnb,
        u8aToHex(keyringInstance.decodeAddress(recipient)),
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setUnbondTxFee(fee));
        }
      )
    );
  };
