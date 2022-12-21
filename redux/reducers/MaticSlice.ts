import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getEtherScanTxUrl } from "config/explorer";
import {
  getMaticAbi,
  getMaticStakePortalAbi,
  getMaticStakePortalAddress,
  getMaticTokenAddress,
} from "config/matic";
import {
  ChainId,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import StafiServer from "servers/stafi";
import numberUtil from "utils/numberUtil";
import snackbarUtil from "utils/snackbarUtils";
import { createWeb3, getMetaMaskTxErrorMsg } from "utils/web3Utils";
import Web3 from "web3";
import {
  addNotice,
  resetStakeLoadingParams,
  setIsLoading,
  setRedeemLoadingParams,
  StakeLoadingSendingDetailItem,
  updateNotice,
  updateStakeLoadingParams,
} from "./AppSlice";
import CommonSlice from "./CommonSlice";
import {
  bond,
  fisUnbond,
  getBondTransactionFees,
  getMinting,
  getUnbondTransactionFees,
} from "./FisSlice";
import keyring from "servers/keyring";
import { u8aToHex } from "@polkadot/util";
import {
  BLOCK_HASH_NOT_FOUND_MESSAGE,
  CANCELLED_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from "utils/constants";
import { updateRTokenBalance } from "./RTokenSlice";
import { addRTokenUnbondRecords } from "utils/storage";
import { stafiUuid } from "utils/common";
import dayjs from "dayjs";
import { estimateUnbondDays } from "config/unbond";
import { LocalNotice } from "utils/notice";
import { getWeb3ProviderUrlConfig } from "config/metaMask";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

export interface MaticState {
  txLoading: boolean;
  balance: string | undefined;
  stakedAmount: string | undefined;
  validPools: any[];
  poolLimit: any;
  unbondFees: string | undefined; // unbond relay fee
  unbondCommision: string | undefined; // unbond commision fee
  bondTxFees: string | undefined; // bond transaction fee
  unbondTxFees: string | undefined; // unbond transaction fee
  bondFees: string | undefined; // bond relay fee, todo: deprecated
  relayFee: string | undefined;
  isApproved: boolean;
  bridgeFee: string | undefined;
}

const initialState: MaticState = {
  txLoading: false,
  balance: undefined,
  stakedAmount: undefined,
  validPools: [],
  poolLimit: 0,
  unbondCommision: undefined,
  unbondFees: undefined,
  bondTxFees: undefined,
  unbondTxFees: undefined,
  bondFees: undefined,
  relayFee: undefined,
  isApproved: false,
  bridgeFee: undefined,
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
    setRelayFee: (state: MaticState, action: PayloadAction<string>) => {
      state.relayFee = action.payload;
    },
    setIsApproved: (state: MaticState, action: PayloadAction<boolean>) => {
      state.isApproved = action.payload;
    },
    setBridgeFee: (state: MaticState, action: PayloadAction<string>) => {
      state.bridgeFee = action.payload;
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
  setRelayFee,
  setIsApproved,
  setBridgeFee,
} = maticSlice.actions;

export default maticSlice.reducer;

export const updateMaticBalance =
  (): AppThunk => async (dispatch, getState) => {
    const account = getState().wallet.metaMaskAccount;
    if (!account || !window.ethereum) {
      dispatch(setMaticBalance("--"));
      return;
    }
    try {
      // let web3 = new Web3(window.ethereum as any);
      let web3 = new Web3(
        new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().eth)
      );
      let contract = new web3.eth.Contract(
        getMaticAbi(),
        getMaticTokenAddress(),
        {
          from: account,
        }
      );

      contract.methods
        .balanceOf(account)
        .call()
        .then((balance: any) => {
          if (getState().wallet.metaMaskAccount) {
            dispatch(setMaticBalance(Web3.utils.fromWei(balance.toString())));
          } else {
            dispatch(setMaticBalance("--"));
          }
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
          tokenName: TokenName.MATIC,
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
            swapping: {},
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
              swapping: {},
            },
          })
        );

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
            // console.log("txDetail", txDetail);
            break;
          }
        }

        const blockHash = txDetail && txDetail.blockHash;
        if (!blockHash) {
          throw new Error(BLOCK_HASH_NOT_FOUND_MESSAGE);
        }

        console.log("sending succeeded, proceeding signature");
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
                txDetail: { transactionHash: txHash, sender: metaMaskAccount },
                data: {
                  tokenName: TokenName.MATIC,
                  amount: Number(stakeAmount) + "",
                  willReceiveAmount: Number(willReceiveAmount) + "",
                },
                scanUrl: getEtherScanTxUrl(result.transactionHash),
                status: "Pending",
                stakeLoadingParams: newParams,
              };
              dispatch(addNotice(newNotice));
            }
          )
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
        throw new Error(TRANSACTION_FAILED_MESSAGE);
      }
    } catch (err: any) {
      console.error(err);
      dispatch(setIsLoading(false));
      if (err.code === 4001) {
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
                    tokenName: TokenName.MATIC,
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
    } finally {
      // dispatch(setIsLoading(false));
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
    try {
      const api = await stafiServer.createStafiApi();
      const result = await api.query.rTokenRate.rate(rSymbol.Matic);
      let ratio = numberUtil.rTokenRateToHuman(result.toJSON());
      ratio = ratio || 1;
      cb && cb(ratio);
      return ratio;
    } catch (err: any) {
      console.error(err);
      return 1;
    }
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
    dispatch(setIsLoading(true));
    dispatch(
      setRedeemLoadingParams({
        modalVisible: true,
        status: "loading",
        tokenName: TokenName.MATIC,
        amount,
        willReceiveAmount,
        newTotalStakedAmount,
        customMsg: `Please confirm the ${Number(
          amount
        )} rMATIC unstaking transaction in your MetaMask wallet`,
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
        throw new Error("No selected pool");
      }

      const keyringInstance = keyring.init(Symbol.Matic);

      dispatch(
        fisUnbond(
          amount,
          rSymbol.Matic,
          u8aToHex(keyringInstance.decodeAddress(recipient)),
          selectedPool.poolPubKey,
          // todo:
          `Unstake succeeded, unstaking period is around ${estimateUnbondDays(
            TokenName.MATIC
          )} days`,
          (r?: string, txHash?: string) => {
            const uuid = stafiUuid();
            if (r === "Success") {
              addRTokenUnbondRecords(TokenName.MATIC, {
                id: uuid,
                txHash,
                estimateSuccessTime: dayjs()
                  .add(estimateUnbondDays(TokenName.MATIC), "d")
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
                      tokenName: TokenName.MATIC,
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
                    tokenName: TokenName.MATIC,
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
      // dispatch(setIsLoading(false));
      dispatch(updateMaticBalance());
      cb && cb();
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
    if (unbondCommision) {
      dispatch(setUnbondCommision(unbondCommision.toString()));
    }
  };

export const getUnbondFees = (): AppThunk => async (dispatch, getState) => {
  const unbondFees = await commonSlice.getUnbondFees(rSymbol.Matic);
  if (unbondFees) {
    dispatch(setUnbondFees(Number(unbondFees).toString()));
  }
};

export const getBondFees = (): AppThunk => async (dispatch, getState) => {
  const bondFees = await commonSlice.getBondFees(rSymbol.Matic);
  if (bondFees) {
    dispatch(setBondFees(Number(bondFees).toString()));
  }
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

/**
 * stake MATIC to StaFi Portal
 */
export const stakeMatic =
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
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      if (!metaMaskAccount) {
        throw new Error("Please connect MetaMask");
      }

      const web3 = createWeb3();
      const contractMatic = new web3.eth.Contract(
        getMaticAbi(),
        getMaticTokenAddress(),
        {
          from: metaMaskAccount,
        }
      );
      const stakePortalAddress = getMaticStakePortalAddress();

      let steps = ["staking", "minting"];
      if (tokenStandard !== TokenStandard.Native) {
        steps.push("swapping");
      }

      // query allowance
      const allowanceResult = await contractMatic.methods
        .allowance(metaMaskAccount, stakePortalAddress)
        .call();
      let allowance = web3.utils.fromWei(allowanceResult);
      // insuffcient allowance, need to approve
      if (Number(allowance) < Number(stakeAmount)) {
        steps.unshift("approving");
        dispatch(
          resetStakeLoadingParams({
            modalVisible: true,
            noticeUuid,
            status: "loading",
            tokenName: TokenName.MATIC,
            amount: stakeAmount,
            willReceiveAmount: willReceiveAmount,
            newTotalStakedAmount,
            targetAddress,
            tokenStandard,
            steps,
            progressDetail: {
              approving: {
                totalStatus: "loading",
              },
              sendingParams,
              staking: {},
              minting: {},
              swapping: {},
            },
            customMsg:
              "Please Approve MATIC to StaFi Portal in your MetaMask wallet",
          })
        );
        allowance = web3.utils.toWei("10000000");
        const approveResult = await contractMatic.methods
          .approve(stakePortalAddress, allowance)
          .send({ from: metaMaskAccount });
        if (approveResult && approveResult.status) {
          // approved
          dispatch(
            updateStakeLoadingParams({
              progressDetail: {
                approving: {
                  totalStatus: "loading",
                  broadcastStatus: "loading",
                },
              },
              customMsg: undefined,
            })
          );

          await sleep(5000);
          dispatch(
            updateStakeLoadingParams({
              progressDetail: {
                approving: {
                  totalStatus: "success",
                  broadcastStatus: "success",
                  packStatus: "success",
                  txHash: approveResult.transactionHash,
                },
              },
            })
          );
        } else {
          throw new Error("Approve Error");
        }
      } else {
        dispatch(
          resetStakeLoadingParams({
            modalVisible: true,
            noticeUuid,
            status: "loading",
            tokenName: TokenName.MATIC,
            amount: stakeAmount,
            willReceiveAmount: willReceiveAmount,
            newTotalStakedAmount,
            targetAddress,
            tokenStandard,
            steps,
            progressDetail: {
              staking: {
                totalStatus: "loading",
              },
              sendingParams,
              minting: {},
              swapping: {},
            },
            // customMsg: 'Staking to StaFi Portal',
          })
        );
      }

      // stake
      const validPools = getState().matic.validPools;
      const poolLimit = getState().matic.poolLimit;

      const amount = web3.utils.toWei(stakeAmount);
      const selectedPool = commonSlice.getPool(amount, validPools, poolLimit);
      if (!selectedPool) {
        throw new Error("Invalid pool");
      }

      const polkadotAddress = getState().wallet.polkadotAccount;
      const contractStakePortal = new web3.eth.Contract(
        getMaticStakePortalAbi(),
        stakePortalAddress,
        { from: metaMaskAccount }
      );
      const keyringInstance = keyring.init(Symbol.Fis);
      const polkadotPubKey = u8aToHex(
        keyringInstance.decodeAddress(polkadotAddress as string)
      );

      dispatch(
        updateStakeLoadingParams({
          progressDetail: {
            staking: {
              totalStatus: "loading",
              broadcastStatus: "loading",
            },
          },
          customMsg: `Please confirm the ${stakeAmount} MATIC staking transaction in your MetaMask wallet`,
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
        .send({ value: web3.utils.toWei(txFee) });
      // console.log("stakeResult", stakeResult);
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
            scanUrl: getEtherScanTxUrl(txHash),
            txHash: txHash,
          },
          (newParams) => {
            const newNotice: LocalNotice = {
              id: noticeUuid || stafiUuid(),
              type: "rToken Stake",
              txDetail: { transactionHash: txHash, sender: metaMaskAccount },
              data: {
                tokenName: TokenName.MATIC,
                amount: Number(stakeAmount) + "",
                willReceiveAmount: Number(willReceiveAmount) + "",
              },
              scanUrl: getEtherScanTxUrl(stakeResult.transactionHash),
              status: "Pending",
              stakeLoadingParams: newParams,
            };
            dispatch(addNotice(newNotice));
          }
        )
      );

      dispatch(setIsLoading(false));

      // query bond state
      console.log({ txHash, blockHash });
      dispatch(getMinting(rSymbol.Matic, txHash, blockHash, chainId, cb));
    } catch (err: any) {
      cb && cb(false);
      console.error(err);
      dispatch(setIsLoading(false));
      if (err.code === 4001) {
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
              customMsg: undefined,
            },
            (newParams) => {
              dispatch(
                addNotice({
                  id: noticeUuid || stafiUuid(),
                  type: "rToken Stake",
                  data: {
                    tokenName: TokenName.MATIC,
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
    }
  };

export const getStakeRelayFee = (): AppThunk => async (dispatch, getState) => {
  try {
    const web3 = createWeb3();
    const contractStakePortal = new web3.eth.Contract(
      getMaticStakePortalAbi(),
      getMaticStakePortalAddress()
    );
    let feeResult = await contractStakePortal.methods.relayFee().call();
    feeResult = feeResult || "1000000000000000"; // 0.001 ETH
    const relayFee = web3.utils.fromWei(feeResult);
    dispatch(setRelayFee(relayFee));
  } catch (err: unknown) {}
};

export const queryIsApproved = (): AppThunk => async (dispatch, getState) => {
  try {
    const web3 = createWeb3();
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    const stakePortalAddress = getMaticStakePortalAddress();
    const contractMatic = new web3.eth.Contract(
      getMaticAbi(),
      getMaticTokenAddress(),
      {
        from: metaMaskAccount,
      }
    );
    const allowanceResult = await contractMatic.methods
      .allowance(metaMaskAccount, stakePortalAddress)
      .call();
    let allowance = web3.utils.fromWei(allowanceResult);
    dispatch(setIsApproved(Number(allowance) > 0));
  } catch (err: unknown) {}
};
