import { u8aToHex } from "@polkadot/util";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getEtherScanTxUrl,
  getKsmScanTxUrl,
  getSolScanTxUrl,
  getStafiScanTxUrl,
} from "config/explorer";
import { estimateUnbondDays } from "config/unbond";
import base58 from "bs58";
import dayjs from "dayjs";
import {
  ChainId,
  TokenName,
  TokenStandard,
  TokenSymbol,
  TokenType,
  WalletType,
} from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import keyring from "servers/keyring";
import { ksmServer } from "servers/ksm";
import StafiServer from "servers/stafi";
import { stafiUuid, timeout } from "utils/common";
import {
  BLOCK_HASH_NOT_FOUND_MESSAGE,
  CANCELLED_MESSAGE,
  NO_VALID_POOL_MESSAGE,
} from "utils/constants";
import { LocalNotice } from "utils/notice";
import { chainAmountToHuman, numberToChain } from "utils/number";
import numberUtil from "utils/numberUtil";
import {
  getPolkadotAccountBalance,
  polkadotAddressToHex,
} from "utils/polkadotUtils";
import snackbarUtil from "utils/snackbarUtils";
import {
  createSolanaTokenAccount,
  getSolanaExtension,
  getSolanaTokenAccountPubkey,
  refreshPhantom,
  sendSolanaTransaction,
} from "utils/solanaUtils";
import { addRTokenUnbondRecords } from "utils/storage";
import {
  addNotice,
  resetStakeLoadingParams,
  setIsLoading,
  setRedeemLoadingParams,
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
import {
  connectPhantom,
  updatePolkadotExtensionAccountsBalances,
  updateSolanaBalance,
} from "./WalletSlice";

declare const window: any;

const commonSlice = new CommonSlice();
const stafiServer = new StafiServer();

export interface SolState {
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

const initialState: SolState = {
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

export const solSlice = createSlice({
  name: "sol",
  initialState,
  reducers: {
    setSolTxLoading: (state: SolState, action: PayloadAction<boolean>) => {
      state.txLoading = action.payload;
    },
    setStakedAmount: (state: SolState, action: PayloadAction<string>) => {
      state.stakedAmount = action.payload;
    },
    setValidPools: (state: SolState, action: PayloadAction<any | null>) => {
      if (action.payload === null) {
        state.validPools = [];
      } else {
        state.validPools.push(action.payload);
      }
    },
    setPoolLimit: (state: SolState, action: PayloadAction<any>) => {
      state.poolLimit = action.payload;
    },
    setUnbondFees: (state: SolState, action: PayloadAction<string>) => {
      state.unbondFees = action.payload;
    },
    setUnbondCommision: (state: SolState, action: PayloadAction<string>) => {
      state.unbondCommision = action.payload;
    },
    setBondTxFees: (state: SolState, action: PayloadAction<string>) => {
      state.bondTxFees = action.payload;
    },
    setUnbondTxFees: (state: SolState, action: PayloadAction<string>) => {
      state.unbondTxFees = action.payload;
    },
    setBondFees: (state: SolState, action: PayloadAction<string>) => {
      state.bondFees = action.payload;
    },
  },
});

export const {
  setStakedAmount,
  setSolTxLoading,
  setPoolLimit,
  setValidPools,
  setUnbondCommision,
  setUnbondFees,
  setUnbondTxFees,
  setBondTxFees,
  setBondFees,
} = solSlice.actions;

export default solSlice.reducer;

export const getSolPools =
  (cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    commonSlice.getPools(rSymbol.Sol, Symbol.Sol, (data: any) => {
      dispatch(setValidPools(data));
      cb && cb();
    });

    const data = await commonSlice.poolBalanceLimit(rSymbol.Sol);
    dispatch(setPoolLimit(data));
  };

export const handleSolStake =
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
    dispatch(setIsLoading(true));
    const solana = getSolanaExtension();
    if (!solana) {
      snackbarUtil.error("Phantom extension not found");
      return;
    }

    await refreshPhantom();
    if (!solana.isConnected) {
      snackbarUtil.error("Please connect Phantom first");
      return;
    }

    const localSolanaAddress = getState().wallet.solanaAccount;
    const solanaAddress = solana.publicKey.toString();
    // console.log('solana account:', solana.publicKey.toString());
    if (localSolanaAddress !== solanaAddress) {
      dispatch(connectPhantom(true));
    }

    let chainId = ChainId.STAFI;
    if (tokenStandard === TokenStandard.ERC20) {
      chainId = ChainId.ETH;
    } else if (tokenStandard === TokenStandard.BEP20) {
      chainId = ChainId.BSC;
    } else if (tokenStandard === TokenStandard.SPL) {
      chainId = ChainId.SOL;
    }

    const chainAmount = numberToChain(stakeAmount, rSymbol.Sol);

    // console.log("chainAmount", chainAmount);
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
                    tokenName: TokenName.SOL,
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
      let steps = ["sending", "staking", "minting"];
      if (tokenStandard !== TokenStandard.Native) {
        steps.push("swapping");
      }
      dispatch(
        resetStakeLoadingParams({
          modalVisible: true,
          noticeUuid,
          displayMsg: `Please approve the ${Number(
            stakeAmount
          )} SOL fund sending request in your Phantom wallet`,
          status: "loading",
          tokenName: TokenName.SOL,
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

      // Check token account first in SPL stake.
      if (chainId === ChainId.SOL) {
        const tokenAccount = await getSolanaTokenAccountPubkey(
          targetAddress,
          TokenType.rSOL
        );
        if (!tokenAccount) {
          dispatch(
            updateStakeLoadingParams({
              displayMsg:
                "Please approve create token account request in Phantom wallet",
            })
          );
          const createTokenAccountRes = await createSolanaTokenAccount(
            targetAddress,
            TokenType.rSOL
          );
          if (!createTokenAccountRes) {
            throw new Error("Create Token Account failed");
          } else {
            dispatch(
              updateStakeLoadingParams({
                displayMsg: "",
              })
            );
            let retryCount = 0;
            let tokenAccount;
            while (true) {
              tokenAccount = await getSolanaTokenAccountPubkey(
                targetAddress,
                TokenType.rSOL
              );
              if (tokenAccount || retryCount > 5) {
                break;
              }
              await timeout(5000);
              retryCount++;
            }
            if (!tokenAccount) {
              throw new Error("Token account not found");
            }
          }
        }
      }

      const validPools = getState().sol.validPools;
      const poolLimit = getState().sol.poolLimit;
      const selectedPool = commonSlice.getPool(
        stakeAmount,
        validPools,
        poolLimit
      );
      if (selectedPool == null) {
        throw new Error(NO_VALID_POOL_MESSAGE);
      }

      const result = await sendSolanaTransaction(
        Number(chainAmount),
        selectedPool.address
      ).catch((error) => {
        throw error;
      });

      if (!result || !result.txHash || !result.blockHash) {
        throw new Error("Send Solana Transaction Failed");
      }

      const hexBlockHash = u8aToHex(base58.decode(result.blockHash));
      const hexTxHash = u8aToHex(base58.decode(result.txHash));

      dispatch(
        updateStakeLoadingParams(
          {
            txHash: hexTxHash,
            scanUrl: getSolScanTxUrl(hexTxHash),
            blockHash: hexBlockHash,
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
                transactionHash: hexTxHash,
                sender: solanaAddress,
              },
              data: {
                tokenName: TokenName.SOL,
                amount: Number(stakeAmount) + "",
                willReceiveAmount: Number(willReceiveAmount) + "",
              },
              scanUrl: getSolScanTxUrl(hexTxHash),
              status: "Pending",
              stakeLoadingParams: newParams,
            };
            dispatch(addNotice(newNotice));
          }
        )
      );

      hexBlockHash &&
        dispatch(
          bond(
            solanaAddress,
            hexTxHash,
            hexBlockHash,
            chainAmount,
            willReceiveAmount,
            selectedPool.poolPubKey,
            rSymbol.Sol,
            chainId,
            targetAddress,
            cb
          )
        );
      cb && cb(true);
    } catch (err: any) {
      handleError(err);
    } finally {
      dispatch(updateSolanaBalance());
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
      willReceiveAmount,
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
        scanUrl: getKsmScanTxUrl(txHash as string),
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
        willReceiveAmount as string,
        poolPubKey as string,
        rSymbol.Ksm,
        chainId,
        targetAddress as string,
        cb
      )
    );
  };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getRSolRate =
  (cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    const api = await stafiServer.createStafiApi();
    const result = await api.query.rTokenRate.rate(rSymbol.Sol);
    let ratio = numberUtil.rTokenRateToHuman(result.toJSON());
    ratio = ratio || 1;
    cb && cb(ratio);
    return ratio;
  };

export const unstakeRSol =
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
      setRedeemLoadingParams({
        modalVisible: true,
        status: "loading",
        targetAddress: recipient,
        tokenName: TokenName.SOL,
        amount: amount,
        willReceiveAmount,
        newTotalStakedAmount,
        customMsg: `Please confirm the ${Number(
          amount
        ).toString()} rSOL unstaking transaction in your Polkadot.js wallet`,
      })
    );
    try {
      const validPools = getState().sol.validPools;
      let selectedPool = commonSlice.getPoolForUnbond(
        amount,
        validPools,
        rSymbol.Sol
      );
      if (!selectedPool) {
        cb && cb();
        return;
      }

      const { PublicKey } = await import("@solana/web3.js");

      dispatch(
        fisUnbond(
          amount,
          rSymbol.Sol,
          u8aToHex(new PublicKey(recipient).toBytes()),
          selectedPool.poolPubKey,
          // todo:
          `Unstake succeeded, unstaking period is around ${estimateUnbondDays(
            TokenName.SOL
          )} days`,
          (r?: string, txHash?: string) => {
            const uuid = stafiUuid();
            if (r === "Success") {
              addRTokenUnbondRecords(TokenName.SOL, {
                id: uuid,
                txHash,
                estimateSuccessTime: dayjs()
                  .add(estimateUnbondDays(TokenName.SOL), "d")
                  .valueOf(),
                amount: willReceiveAmount,
                recipient,
              });

              dispatch(
                addNotice({
                  id: uuid,
                  type: "rToken Unstake",
                  data: {
                    tokenName: TokenName.SOL,
                    amount: amount,
                    willReceiveAmount: willReceiveAmount,
                  },
                  scanUrl: getStafiScanTxUrl(txHash),
                  status: "Confirmed",
                })
              );
            } else if (r === "Failed") {
              dispatch(
                addNotice({
                  id: uuid,
                  type: "rToken Unstake",
                  data: {
                    tokenName: TokenName.SOL,
                    amount: amount,
                    willReceiveAmount: willReceiveAmount,
                  },
                  scanUrl: getStafiScanTxUrl(txHash),
                  status: "Error",
                })
              );
            }
          }
        )
      );
    } catch (err: any) {
      console.error(err);
    } finally {
      dispatch(setIsLoading(false));
      dispatch(updateSolanaBalance());
    }
  };

export const getSolUnbondCommision =
  (): AppThunk => async (dispatch, getState) => {
    const unbondCommision = await commonSlice.getUnbondCommision();
    dispatch(setUnbondCommision(unbondCommision?.toString() || "--"));
    // dispatch(updateMaticBalance());
  };

export const getSolUnbondFees = (): AppThunk => async (dispatch, getState) => {
  const unbondFees = await commonSlice.getUnbondFees(rSymbol.Sol);
  dispatch(setUnbondFees(Number(unbondFees).toString()));
};

export const getSolBondFees = (): AppThunk => async (dispatch, getState) => {
  const bondFees = await commonSlice.getBondFees(rSymbol.Sol);
  dispatch(setBondFees(Number(bondFees).toString()));
};

export const getSolUnbondTxFees =
  (amount: string, recipient: string): AppThunk =>
  async (dispatch, getState) => {
    if (!recipient) return;
    const validPools = getState().sol.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      amount,
      validPools,
      rSymbol.Sol
    );
    if (!selectedPool) {
      return;
    }
    const { PublicKey } = await import("@solana/web3.js");
    dispatch(
      getUnbondTransactionFees(
        amount,
        rSymbol.Sol,
        u8aToHex(new PublicKey(recipient).toBytes()),
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setUnbondTxFees(fee));
        }
      )
    );
  };

export const getSolBondTransactionFees =
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
    const validPools = getState().sol.validPools;
    let selectedPool = commonSlice.getPoolForUnbond(
      "0",
      validPools,
      rSymbol.Sol
    );
    if (!selectedPool) {
      return;
    }

    dispatch(
      getBondTransactionFees(
        "1",
        rSymbol.Sol,
        chainId,
        selectedPool.poolPubKey,
        (fee: string) => {
          dispatch(setBondTxFees(fee));
        }
      )
    );
  };
