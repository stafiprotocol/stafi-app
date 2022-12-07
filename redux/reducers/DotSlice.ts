import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getEtherScanTxUrl, getStafiScanTxUrl } from "config/explorer";
import { estimateUnbondDays } from "config/unbond";
import dayjs from "dayjs";
import {
  ChainId,
  TokenName,
  TokenStandard,
  WalletType,
} from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import { dotServer } from "servers/dot";
import StafiServer from "servers/stafi";
import { stafiUuid } from "utils/common";
import {
  BLOCK_HASH_NOT_FOUND_MESSAGE,
  CANCELLED_MESSAGE,
  NO_VALID_POOL_MESSAGE,
} from "utils/constants";
import { LocalNotice } from "utils/notice";
import { numberToChain } from "utils/number";
import numberUtil from "utils/numberUtil";
import {
  getPolkadotAccountBalance,
  polkadotAddressToHex,
} from "utils/polkadotUtils";
import snackbarUtil from "utils/snackbarUtils";
import { addRTokenUnbondRecords } from "utils/storage";
import {
  addNotice,
  resetStakeLoadingParams,
  setIsLoading,
  StakeLoadingSendingDetailItem,
  updateStakeLoadingParams,
} from "./AppSlice";
import CommonSlice from "./CommonSlice";
import {
  bond,
  fisUnbond,
  getBondTransactionFees,
  getUnbondTransactionFees,
} from "./FisSlice";
import { sendPolkadotTx } from "./TxSlice";
import { updatePolkadotExtensionAccountsBalances } from "./WalletSlice";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

export interface DotState {
  txLoading: boolean;
  stakedAmount: string;
  validPools: any[];
  poolLimit: any;
  unbondFees: string; // unbond relay fee
  unbondCommision: string; // unbond commision fee
  bondTxFees: string; // bond transaction fee
  unbondTxFees: string; // unbond transaction fee
  bondFees: string; // bond relay fee
}

const initialState: DotState = {
  txLoading: false,
  stakedAmount: "--",
  validPools: [],
  poolLimit: 0,
  unbondCommision: "--",
  unbondFees: "--",
  bondTxFees: "--",
  unbondTxFees: "--",
  bondFees: "--",
};

export const dotSlice = createSlice({
  name: "dot",
  initialState,
  reducers: {
    setDotTxLoading: (state: DotState, action: PayloadAction<boolean>) => {
      state.txLoading = action.payload;
    },
    setStakedAmount: (state: DotState, action: PayloadAction<string>) => {
      state.stakedAmount = action.payload;
    },
    setValidPools: (state: DotState, action: PayloadAction<any | null>) => {
      if (action.payload === null) {
        state.validPools = [];
      } else {
        state.validPools.push(action.payload);
      }
    },
    setPoolLimit: (state: DotState, action: PayloadAction<any>) => {
      state.poolLimit = action.payload;
    },
    setUnbondFees: (state: DotState, action: PayloadAction<string>) => {
      state.unbondFees = action.payload;
    },
    setUnbondCommision: (state: DotState, action: PayloadAction<string>) => {
      state.unbondCommision = action.payload;
    },
    setBondTxFees: (state: DotState, action: PayloadAction<string>) => {
      state.bondTxFees = action.payload;
    },
    setUnbondTxFees: (state: DotState, action: PayloadAction<string>) => {
      state.unbondTxFees = action.payload;
    },
    setBondFees: (state: DotState, action: PayloadAction<string>) => {
      state.bondFees = action.payload;
    },
  },
});

export const {
  setStakedAmount,
  setDotTxLoading,
  setPoolLimit,
  setValidPools,
  setUnbondCommision,
  setUnbondFees,
  setUnbondTxFees,
  setBondTxFees,
  setBondFees,
} = dotSlice.actions;

export default dotSlice.reducer;

export const getDotPools =
  (cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    commonSlice.getPools(rSymbol.Dot, Symbol.Dot, (data: any) => {
      dispatch(setValidPools(data));
      cb && cb();
    });

    const data = await commonSlice.poolBalanceLimit(rSymbol.Dot);
    dispatch(setPoolLimit(data));
  };

export const handleDotStake =
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

    const chainAmount = numberToChain(stakeAmount, rSymbol.Dot);
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
    const handleError = (err: any) => {
      console.error(err);
      dispatch(setIsLoading(false));
      if (err.message === CANCELLED_MESSAGE) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        dispatch(resetStakeLoadingParams(undefined));
      } else {
        snackbarUtil.error(err.message);
        let sendingDetail: StakeLoadingSendingDetailItem = {
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
                    tokenName: TokenName.DOT,
                    amount: Number(stakeAmount) + "",
                    willReceiveAmount: Number(willReceiveAmount) + "",
                  },
                  status: "Error",
                  stakeLoadingParams: newParams,
                })
              );
            }
          )
        );
      }
      dispatch(setIsLoading(false));
    };

    try {
      dispatch(setIsLoading(true)); // stake button loading
      let steps = ["sending", "staking", "minting"];
      if (tokenStandard !== TokenStandard.Native) {
        steps.push("swapping");
      }
      dispatch(
        resetStakeLoadingParams({
          modalVisible: true,
          noticeUuid,
          status: "loading",
          tokenName: TokenName.DOT,
          amount: stakeAmount,
          willReceiveAmount: willReceiveAmount,
          newTotalStakedAmount,
          targetAddress,
          tokenStandard,
          steps,
          progressDetail: {
            sending: {
              totalStatus: "loading",
              broadcastStatus: "loading",
            },
            sendingParams,
            staking: {},
            minting: {},
            swapping: {},
          },
        })
      );

      const dotAccount = getState().wallet.dotAccount;
      const dotBalance = getPolkadotAccountBalance(
        dotAccount,
        getState().wallet.polkadotExtensionAccounts,
        WalletType.Polkadot_DOT
      );

      if (!dotAccount) {
        throw new Error("Please connect Polkadot.js");
      }

      const validPools = getState().dot.validPools;
      const poolLimit = getState().dot.poolLimit;
      const selectedPool = commonSlice.getPool(
        stakeAmount,
        validPools,
        poolLimit
      );
      if (selectedPool == null) {
        throw new Error(NO_VALID_POOL_MESSAGE);
      }

      const dotApi = await dotServer.createDotApi();

      const extrinsic = dotApi.tx.balances.transferKeepAlive(
        selectedPool.address,
        chainAmount
      );

      dispatch(
        sendPolkadotTx(dotApi, dotAccount, dotBalance, {
          extrinsic,
          txCancelCb: () => {
            handleError(new Error(CANCELLED_MESSAGE));
          },
          txFailedCb: (reason) => {
            handleError(new Error(reason));
          },
          txSuccessCb: (result) => {
            const txHash = extrinsic.hash.toHex();
            const blockHash = result.status.asInBlock + "";

            dispatch(
              updateStakeLoadingParams(
                {
                  txHash: txHash,
                  scanUrl: getEtherScanTxUrl(txHash),
                  blockHash: blockHash,
                  poolPubKey: selectedPool.poolPubKey,
                  progressDetail: {
                    sending: {
                      totalStatus: "success",
                      broadcastStatus: "success",
                      packStatus: "success",
                      finalizeStatus: "success",
                    },
                    sendingParams,
                    staking: {
                      totalStatus: "loading",
                    },
                    minting: {},
                    swapping: {},
                  },
                },
                (newParams) => {
                  const newNotice: LocalNotice = {
                    id: noticeUuid || stafiUuid(),
                    type: "rToken Stake",
                    txDetail: {
                      transactionHash: txHash,
                      sender: dotAccount,
                    },
                    data: {
                      tokenName: TokenName.DOT,
                      amount: Number(stakeAmount) + "",
                      willReceiveAmount: Number(willReceiveAmount) + "",
                    },
                    scanUrl: getStafiScanTxUrl(txHash),
                    status: "Pending",
                    stakeLoadingParams: newParams,
                  };
                  dispatch(addNotice(newNotice));
                }
              )
            );

            dispatch(updatePolkadotExtensionAccountsBalances());

            blockHash &&
              dispatch(
                bond(
                  dotAccount,
                  txHash,
                  blockHash,
                  chainAmount,
                  selectedPool.poolPubKey,
                  rSymbol.Dot,
                  chainId,
                  targetAddress,
                  cb
                )
              );
          },
        })
      );
    } catch (err: any) {
      handleError(err);
    } finally {
      // dispatch(setIsLoading(false));
      dispatch(updatePolkadotExtensionAccountsBalances());
    }
  };

export const retryStake =
  (cb?: (success: boolean) => void): AppThunk =>
  async (dispatch, getState) => {
    const stakeLoadingParams = getState().app.stakeLoadingParams;
    if (!stakeLoadingParams) return;

    const metaMaskAccount = getState().wallet.metaMaskAccount;
    const {
      txHash,
      blockHash,
      amount,
      poolPubKey,
      targetAddress,
      tokenStandard,
    } = stakeLoadingParams;

    let chainId = ChainId.STAFI;
    if (tokenStandard === TokenStandard.ERC20) {
      chainId = ChainId.ETH;
    } else if (tokenStandard === TokenStandard.BEP20) {
      chainId = ChainId.BSC;
    } else if (tokenStandard === TokenStandard.SPL) {
      chainId = ChainId.SOL;
    }

    dispatch(
      updateStakeLoadingParams({
        txHash: txHash,
        scanUrl: getEtherScanTxUrl(txHash as string),
        blockHash: blockHash,
        poolPubKey: poolPubKey as string,
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

    dispatch(
      bond(
        metaMaskAccount as string,
        txHash as string,
        blockHash as string,
        amount as string,
        poolPubKey as string,
        rSymbol.Dot,
        chainId,
        targetAddress as string,
        cb
      )
    );
  };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getRDotRate =
  (cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    const api = await stafiServer.createStafiApi();
    const result = await api.query.rTokenRate.rate(rSymbol.Dot);
    let ratio = numberUtil.rTokenRateToHuman(result.toJSON());
    ratio = ratio || 1;
    cb && cb(ratio);
    return ratio;
  };

export const unstakeRDot =
  (
    amount: string,
    recipient: string,
    willReceiveAmount: string,
    newTotalStakedAmount: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    // console.log(newTotalStakedAmount);
    dispatch(setIsLoading(true));
    dispatch(
      resetStakeLoadingParams({
        modalVisible: true,
        status: "loading",
        tokenName: TokenName.DOT,
        amount: amount,
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
      const validPools = getState().dot.validPools;
      let selectedPool = commonSlice.getPoolForUnbond(
        amount,
        validPools,
        rSymbol.Dot
      );
      if (!selectedPool) {
        cb && cb();
        return;
      }

      dispatch(
        fisUnbond(
          amount,
          rSymbol.Dot,
          polkadotAddressToHex(recipient),
          selectedPool.poolPubKey,
          // todo:
          `Unstake succeeded, unstaking period is around ${estimateUnbondDays(
            TokenName.DOT
          )} days`,
          (r?: string, txHash?: string) => {
            if (r === "Success") {
              const uuid = stafiUuid();
              addRTokenUnbondRecords(TokenName.DOT, {
                id: uuid,
                txHash,
                estimateSuccessTime: dayjs()
                  .add(estimateUnbondDays(TokenName.DOT), "d")
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
      dispatch(updatePolkadotExtensionAccountsBalances());
    }
  };

export const getUnbondCommision =
  (): AppThunk => async (dispatch, getState) => {
    const unbondCommision = await commonSlice.getUnbondCommision();
    dispatch(setUnbondCommision(unbondCommision?.toString() || "--"));
    // dispatch(updateMaticBalance());
  };

export const getUnbondFees = (): AppThunk => async (dispatch, getState) => {
  const unbondFees = await commonSlice.getUnbondFees(rSymbol.Dot);
  dispatch(setUnbondFees(Number(unbondFees).toString()));
};

export const getBondFees = (): AppThunk => async (dispatch, getState) => {
  const bondFees = await commonSlice.getBondFees(rSymbol.Dot);
  dispatch(setBondFees(Number(bondFees).toString()));
};

export const getDotUnbondTxFees =
  (amount: string, recipient: string): AppThunk =>
  async (dispatch, getState) => {
    if (!recipient) return;
    const validPools = getState().dot.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      amount,
      validPools,
      rSymbol.Dot
    );
    if (!selectedPool) {
      return;
    }
    dispatch(
      getUnbondTransactionFees(
        amount,
        rSymbol.Dot,
        polkadotAddressToHex(recipient),
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setUnbondTxFees(fee));
        }
      )
    );
  };

export const getDotBondTransactionFees =
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
    const validPools = getState().dot.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      "0",
      validPools,
      rSymbol.Dot
    );
    if (!selectedPool) {
      return;
    }

    dispatch(
      getBondTransactionFees(
        "1",
        rSymbol.Dot,
        chainId,
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setBondTxFees(fee));
        }
      )
    );
  };
