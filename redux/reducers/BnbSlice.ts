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
import { createWeb3 } from "utils/web3Utils";
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
import { bond, fisUnbond } from "./FisSlice";
import keyring from "servers/keyring";
import { u8aToHex } from "@polkadot/util";
import numberUtil from "utils/numberUtil";

const commonSlice = new CommonSlice();

export interface BnbState {
  balance: string;
  stakedAmount: string;
  validPools: any[];
  poolLimit: any;
  unbondFee: string;
  bondFee: string;
  unbondCommision: string;
}

const initialState: BnbState = {
  balance: "--",
  stakedAmount: "--",
  validPools: [],
  poolLimit: 0,
  bondFee: "--",
  unbondFee: "--",
  unbondCommision: "--",
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
} = bnbSlice.actions;

declare const window: any;

export default bnbSlice.reducer;

export const updateBnbBalance = (): AppThunk => async (dispatch, getState) => {
  const account = getState().wallet.metaMaskAccount;
  if (!account) return;

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });
    dispatch(setBalance(Web3.utils.fromWei(balance.toString())));
  } catch (err) {
    console.error(err);
  }
};

export const handleBnbStake =
  (
    stakeAmount: string,
    willReceiveAmount: string,
    tokenStandard: TokenStandard | undefined,
    targetAddress: string,
    newTotalStakedAmount: string,
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
    };

    dispatch(setIsLoading(true));

    let steps = ["sending", "staking", "minting"];
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
        userAction: undefined,
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
    const amountInBnb = numberUtil.tokenAmountToChain(stakeAmount, rSymbol.Bnb);

    const validPools = getState().bnb.validPools;
    const poolLimit = getState().bnb.poolLimit;

    const metaMaskAccount = getState().wallet.metaMaskAccount;

    const selectedPool = commonSlice.getPool(amount, validPools, poolLimit);
    if (!selectedPool || !metaMaskAccount) return null;

    try {
      const amountHex = web3.utils.toHex(amount);
      const txParams = {
        value: amountHex,
        gas: "0x54647",
        to: selectedPool.address,
        from: metaMaskAccount,
        chainId: getEthChainId(),
      };

      const txHash = await window.ethereum
        .request({
          method: "eth_sendTransaction",
          params: [txParams],
        })
        .catch((err: any) => {
          throw err;
        });

      dispatch(
        updateStakeLoadingParams({
          progressDetail: {
            sending: {
              totalStatus: "loading",
              broadcastStatus: "loading",
            },
            staking: {},
            minting: {},
            swapping: {},
          },
        })
      );

      if (!txHash) {
        throw new Error("tx error");
      }

      let txDetail;
      while (true) {
        sleep(1000);
        txDetail = await window.ethereum
          .request({
            method: "eth_getTransactionByHash",
            params: [txHash],
          })
          .catch((err: any) => {
            console.error(err);
          });

        if (!txDetail || txDetail.blockHash) {
          break;
        }
      }

      const blockHash = txDetail && txDetail.blockHash;
      if (!blockHash) {
        throw new Error(BLOCK_HASH_NOT_FOUND_MESSAGE);
      }

      dispatch(
        bond(
          metaMaskAccount,
          txHash,
          blockHash,
          amountInBnb,
          selectedPool.poolPubKey,
          rSymbol.Bnb,
          chainId,
          targetAddress,
          cb
        )
      );
    } catch (err: any) {
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
              errorMsg: err.message,
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
    cb?: (success: boolean) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setIsLoading(true));
    dispatch(
      setRedeemLoadingParams({
        modalVisible: true,
        status: "loading",
        tokenName: TokenName.BNB,
        amount,
        willReceiveAmount,
        newTotalStakedAmount,
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
        return;
      }
      const keyringInstance = keyring.init(Symbol.Bnb);

      dispatch(
        fisUnbond(
          amount,
          rSymbol.Bnb,
          u8aToHex(keyringInstance.decodeAddress(recipient)),
          selectedPool.poolPubKey,
          ""
        )
      );
    } catch (err: any) {
      console.error(err);
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
