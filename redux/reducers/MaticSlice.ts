import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getEtherScanTxUrl } from "config/explorer";
import { getMaticAbi, getMaticTokenAddress } from "config/matic";
import { ChainId, TokenName, TokenStandard } from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import StafiServer from "servers/stafi";
import numberUtil from "utils/numberUtil";
import snackbarUtil from "utils/snackbarUtils";
import { createWeb3 } from "utils/web3Utils";
import Web3 from "web3";
import {
  addNotice,
  resetStakeLoadingParams,
  setIsLoading,
  updateStakeLoadingParams,
} from "./AppSlice";
import CommonSlice from "./CommonSlice";
import {
  bond,
  fisUnbond,
  getBondTransactionFees,
  getUnbondTransactionFees,
} from "./FisSlice";
import keyring from "servers/keyring";
import { u8aToHex } from "@polkadot/util";
import { CANCELLED_MESSAGE } from "utils/constants";
import { updateRTokenBalance } from "./RTokenSlice";
import { addRTokenUnbondRecords } from "utils/storage";
import { stafiUuid } from "utils/common";
import dayjs from "dayjs";
import { estimateUnbondDays } from "config/unbond";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

export interface MaticState {
  txLoading: boolean;
  balance: string;
  stakedAmount: string;
  validPools: any[];
  poolLimit: any;
  unbondFees: string; // unbond relay fee
  unbondCommision: string; // unbond commision fee
  bondTxFees: string; // bond transaction fee
  unbondTxFees: string; // unbond transaction fee
  bondFees: string; // bond relay fee
}

const initialState: MaticState = {
  txLoading: false,
  balance: "--",
  stakedAmount: "--",
  validPools: [],
  poolLimit: 0,
  unbondCommision: "--",
  unbondFees: "--",
  bondTxFees: "--",
  unbondTxFees: "--",
  bondFees: "--",
};

export const maticSlice = createSlice({
  name: "matic",
  initialState,
  reducers: {
    setMaticTxLoading: (state: MaticState, action: PayloadAction<boolean>) => {
      state.txLoading = action.payload;
    },
    setMaticBalance: (state: MaticState, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setStakedAmount: (state: MaticState, action: PayloadAction<string>) => {
      state.stakedAmount = action.payload;
    },
    setValidPools: (state: MaticState, action: PayloadAction<any | null>) => {
      if (action.payload === null) {
        state.validPools = [];
      } else {
        state.validPools.push(action.payload);
      }
    },
    setPoolLimit: (state: MaticState, action: PayloadAction<any>) => {
      state.poolLimit = action.payload;
    },
    setUnbondFees: (state: MaticState, action: PayloadAction<string>) => {
      state.unbondFees = action.payload;
    },
    setUnbondCommision: (state: MaticState, action: PayloadAction<string>) => {
      state.unbondCommision = action.payload;
    },
    setBondTxFees: (state: MaticState, action: PayloadAction<string>) => {
      state.bondTxFees = action.payload;
    },
    setUnbondTxFees: (state: MaticState, action: PayloadAction<string>) => {
      state.unbondTxFees = action.payload;
    },
    setBondFees: (state: MaticState, action: PayloadAction<string>) => {
      state.bondFees = action.payload;
    },
  },
});

export const {
  setMaticBalance,
  setStakedAmount,
  setMaticTxLoading,
  setPoolLimit,
  setValidPools,
  setUnbondCommision,
  setUnbondFees,
  setUnbondTxFees,
  setBondTxFees,
  setBondFees,
} = maticSlice.actions;

export default maticSlice.reducer;

export const updateMaticBalance =
  (): AppThunk => async (dispatch, getState) => {
    const account = getState().wallet.metaMaskAccount;
    if (!account || !window.ethereum) return;

    let web3 = new Web3(window.ethereum as any);
    let contract = new web3.eth.Contract(
      getMaticAbi(),
      getMaticTokenAddress(),
      {
        from: account,
      }
    );

    try {
      contract.methods
        .balanceOf(account)
        .call()
        .then((balance: any) => {
          dispatch(setMaticBalance(Web3.utils.fromWei(balance.toString())));
        })
        .catch((e: any) => {
          console.error(e);
        });
    } catch (e) {
      console.error(e);
    }
  };

export const reloadData = (): AppThunk => async (dispatch, getState) => {
  dispatch(updateMaticBalance());
};

export const handleMaticStake =
  (
    stakeAmount: string,
    willReceiveAmount: string,
    tokenStandard: TokenStandard | undefined,
    targetAddress: string,
    newTotalStakedAmount: string,
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

    try {
      dispatch(setIsLoading(true)); // stake button loading
      dispatch(
        resetStakeLoadingParams({
          modalVisible: true,
          status: "loading",
          tokenName: TokenName.MATIC,
          amount: stakeAmount,
          willReceiveAmount: willReceiveAmount,
          newTotalStakedAmount,
          steps: ["sending", "staking", "minting"],
          userAction: undefined,
          progressDetail: {
            sending: {
              totalStatus: "loading",
            },
            staking: {},
            minting: {},
          },
        })
      );

      const metaMaskAccount = getState().wallet.metaMaskAccount;
      if (!metaMaskAccount) {
        throw new Error("Please connect MetaMask");
      }

      const web3 = createWeb3();
      const contract = new web3.eth.Contract(
        getMaticAbi(),
        getMaticTokenAddress(),
        {
          from: metaMaskAccount,
        }
      );

      const amount = web3.utils.toWei(stakeAmount.toString());

      const validPools = getState().matic.validPools;
      const poolLimit = getState().matic.poolLimit;

      const selectedPool = commonSlice.getPool(amount, validPools, poolLimit);
      if (!selectedPool) return null;

      const result = await contract.methods
        .transfer(selectedPool.address, amount.toString())
        .send();
      dispatch(
        updateStakeLoadingParams({
          progressDetail: {
            sending: {
              totalStatus: "loading",
              broadcastStatus: "loading",
            },
            staking: {},
            minting: {},
          },
        })
      );

      if (result && result.status) {
        const txHash = result.transactionHash;
        dispatch(
          updateStakeLoadingParams({
            progressDetail: {
              sending: {
                totalStatus: "loading",
                broadcastStatus: "success",
                packStatus: "loading",
              },
              staking: {},
              minting: {},
            },
          })
        );
        // dispatch(
        // 	addNotice(
        // 		txHash,
        // 		'rToken Stake',
        // 		{
        // 			transactionHash: txHash,
        // 			sender: metaMaskAccount,
        // 		},
        // 		{
        // 			tokenName: TokenName.MATIC,
        // 			amount: stakeAmount,
        // 		},
        // 		getEtherScanTxUrl(result.transactionHash),
        // 		'Confirmed',
        // 	)
        // );

        let txDetail;
        while (true) {
          await sleep(5000);
          txDetail = await ethereum
            .request({
              method: "eth_getTransactionByHash",
              params: [txHash],
            })
            .catch((err: any) => {
              console.error(err);
            });

          if (txDetail.blockHash || !txDetail) {
            console.log("txDetail", txDetail);
            break;
          }
        }

        const blockHash = txDetail && txDetail.blockHash;
        if (!blockHash) {
          dispatch(
            updateStakeLoadingParams({
              status: "error",
              progressDetail: {
                sending: {
                  totalStatus: "error",
                  broadcastStatus: "error",
                },
                staking: {},
                minting: {},
              },
            })
          );
          console.error("blockHash error");
        }

        console.log("sending succeeded, proceeding signature");
        dispatch(
          updateStakeLoadingParams({
            txHash: txHash,
            scanUrl: getEtherScanTxUrl(txHash),
            progressDetail: {
              sending: {
                totalStatus: "success",
                broadcastStatus: "success",
                packStatus: "success",
                finalizeStatus: "success",
              },
              staking: {
                totalStatus: "loading",
              },
              minting: {},
            },
          })
        );

        dispatch(reloadData());

        blockHash &&
          dispatch(
            bond(
              metaMaskAccount,
              txHash,
              blockHash,
              amount,
              selectedPool.poolPubKey,
              rSymbol.Matic,
              chainId,
              targetAddress,
              cb
            )
          );
      } else {
        const txHash = result.transactionHash;
        dispatch(
          updateStakeLoadingParams({
            status: "error",
            txHash: txHash,
            progressDetail: {
              sending: {
                totalStatus: "error",
                broadcastStatus: "error",
              },
              staking: {},
              minting: {},
            },
          })
        );
        snackbarUtil.error("Error! Please try again");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        dispatch(resetStakeLoadingParams(undefined));
      } else {
        snackbarUtil.error(err.message);
        dispatch(
          updateStakeLoadingParams({
            status: "error",
          })
        );
      }
    } finally {
      dispatch(setIsLoading(false));
      dispatch(updateMaticBalance());
    }
  };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getPools =
  (cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    commonSlice.getPools(rSymbol.Matic, Symbol.Matic, (data: any) => {
      dispatch(setValidPools(data));
      cb && cb();
    });

    const data = await commonSlice.poolBalanceLimit(rSymbol.Matic);
    dispatch(setPoolLimit(data));
  };

export const getRMaticRate =
  (cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    const api = await stafiServer.createStafiApi();
    const result = await api.query.rTokenRate.rate(rSymbol.Matic);
    let ratio = numberUtil.rTokenRateToHuman(result.toJSON());
    ratio = ratio || 1;
    cb && cb(ratio);
    return ratio;
  };

export const unbondRMatic =
  (
    amount: string,
    recipient: string,
    willReceiveAmount: string,
    newTotalStakedAmount: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    console.log(newTotalStakedAmount);
    dispatch(setIsLoading(true));
    dispatch(
      resetStakeLoadingParams({
        modalVisible: true,
        status: "loading",
        tokenName: TokenName.MATIC,
        amount: amount,
        userAction: "redeem",
        willReceiveAmount,
        newTotalStakedAmount,
        steps: ["sending"],
        progressDetail: {
          sending: {
            totalStatus: "loading",
          },
        },
      })
    );
    try {
      const validPools = getState().matic.validPools;
      let selectedPool = commonSlice.getPoolForUnbond(
        amount,
        validPools,
        rSymbol.Matic
      );
      if (!selectedPool) {
        cb && cb();
        return;
      }

      const keyringInstance = keyring.init(Symbol.Matic);

      dispatch(
        fisUnbond(
          amount,
          rSymbol.Matic,
          u8aToHex(keyringInstance.decodeAddress(recipient)),
          selectedPool.poolPubKey,
          // todo:
          `Unbond succeeded, unbonding period is around ${estimateUnbondDays(
            TokenName.MATIC
          )} days`,
          (r?: string, txHash?: string) => {
            if (r === "Success") {
              const uuid = stafiUuid();
              addRTokenUnbondRecords(TokenName.MATIC, {
                id: uuid,
                txHash,
                estimateSuccessTime: dayjs()
                  .add(estimateUnbondDays(TokenName.MATIC), "d")
                  .valueOf(),
                amount: willReceiveAmount,
                recipient,
              });
            }
          }
        )
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      dispatch(setIsLoading(false));
      dispatch(updateMaticBalance());
    }
  };

export const mockProcess =
  (
    stakeAmount: string,
    willReceiveAmount: string,
    tokenStandard: TokenStandard | undefined,
    targetAddress: string,
    newTotalStakedAmount: string
  ): AppThunk =>
  async (dispatch, getState) => {
    console.log("mock");
    dispatch(
      resetStakeLoadingParams({
        modalVisible: true,
        status: "loading",
        tokenName: TokenName.MATIC,
        amount: stakeAmount,
        willReceiveAmount: willReceiveAmount,
        newTotalStakedAmount,
        steps: ["sending", "staking", "minting"],
        userAction: undefined,
        progressDetail: {
          sending: {
            totalStatus: "loading",
          },
          staking: {},
          minting: {},
        },
      })
    );
    await sleep(5000);
    dispatch(
      updateStakeLoadingParams({
        progressDetail: {
          sending: {
            broadcastStatus: "loading",
          },
        },
      })
    );
    await sleep(2000);
    dispatch(
      updateStakeLoadingParams({
        progressDetail: {
          sending: {
            broadcastStatus: "success",
            finalizeStatus: "loading",
          },
        },
      })
    );
    await sleep(2000);
    dispatch(
      updateStakeLoadingParams({
        progressDetail: {
          sending: {
            totalStatus: "success",
          },
          staking: {
            totalStatus: "loading",
          },
        },
      })
    );
    await sleep(2000);
    dispatch(
      updateStakeLoadingParams({
        progressDetail: {
          sending: {
            totalStatus: "success",
          },
          staking: {
            broadcastStatus: "loading",
          },
        },
      })
    );
    await sleep(2000);
    dispatch(
      updateStakeLoadingParams({
        progressDetail: {
          sending: {
            totalStatus: "success",
          },
          staking: {
            totalStatus: "success",
          },
          minting: {
            totalStatus: "loading",
          },
        },
      })
    );
    await sleep(2000);

    dispatch(resetStakeLoadingParams(undefined));
  };

export const getUnbondCommision =
  (): AppThunk => async (dispatch, getState) => {
    const unbondCommision = await commonSlice.getUnbondCommision();
    dispatch(setUnbondCommision(unbondCommision.toString()));
  };

export const getUnbondFees = (): AppThunk => async (dispatch, getState) => {
  const unbondFees = await commonSlice.getUnbondFees(rSymbol.Matic);
  dispatch(setUnbondFees(Number(unbondFees).toString()));
};

export const getBondFees = (): AppThunk => async (dispatch, getState) => {
  const bondFees = await commonSlice.getBondFees(rSymbol.Matic);
  dispatch(setBondFees(Number(bondFees).toString()));
};

export const getMaticUnbondTxFees =
  (amount: string, recipient: string): AppThunk =>
  async (dispatch, getState) => {
    if (!recipient) return;
    const validPools = getState().matic.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      amount,
      validPools,
      rSymbol.Matic
    );
    if (!selectedPool) {
      return;
    }
    const keyringInstance = keyring.init(Symbol.Matic);
    dispatch(
      getUnbondTransactionFees(
        amount,
        rSymbol.Matic,
        u8aToHex(keyringInstance.decodeAddress(recipient)),
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setUnbondTxFees(fee));
        }
      )
    );
  };

export const getMaticBondTransactionFees =
  (tokenStandard: TokenStandard | undefined): AppThunk =>
  async (dispatch, getState) => {
    let chainId = 1;
    if (tokenStandard === TokenStandard.ERC20) {
      chainId = 2;
    } else if (tokenStandard === TokenStandard.BEP20) {
      chainId = 3;
    } else if (tokenStandard === TokenStandard.SPL) {
      chainId = 4;
    }
    const validPools = getState().matic.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      "0",
      validPools,
      rSymbol.Matic
    );
    if (!selectedPool) {
      return;
    }

    dispatch(
      getBondTransactionFees(
        "1",
        rSymbol.Matic,
        chainId,
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setBondTxFees(fee));
        }
      )
    );
  };
