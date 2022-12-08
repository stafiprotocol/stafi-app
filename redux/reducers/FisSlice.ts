import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import CommonSlice from "./CommonSlice";
import numberUtil from "utils/numberUtil";
import keyring from "servers/keyring";
import StafiServer from "servers/stafi";
import { stringToHex, u8aToHex } from "@polkadot/util";
import {
  resetStakeLoadingParams,
  setIsLoading,
  setRedeemLoadingParams,
  updateNotice,
  updateStakeLoadingParams,
} from "./AppSlice";
import { getLocalStorageItem } from "utils/common";
import {
  connectPolkadot,
  getBep20AssetBalance,
  getErc20AssetBalance,
} from "utils/web3Utils";
import snackbarUtil from "utils/snackbarUtils";
import {
  CANCELLED_MESSAGE,
  SIGN_ERROR_MESSAGE,
  STAFI_ACCOUNT_EMPTY_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from "utils/constants";
import {
  ChainId,
  TokenName,
  TokenStandard,
  WalletType,
} from "interfaces/common";
import {
  getBSCRMaticAbi,
  getERCMaticAbi,
  getMaticAbi,
  getRMaticTokenAddress,
} from "config/matic";
import { getPolkadotStakingSignature } from "utils/polkadotUtils";
import { getBep20TokenContractConfig } from "config/bep20Contract";
import { getErc20TokenContractConfig } from "config/erc20Contract";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

export interface FisAccount {
  name: string | undefined;
  address: string;
  balance: string;
}

export interface FisState {
  chooseAccountVisible: boolean;
  chooseAccountWalletType: WalletType;
  routeNextPage: string | undefined;
}

const initialState: FisState = {
  chooseAccountVisible: false,
  chooseAccountWalletType: WalletType.Polkadot,
  routeNextPage: undefined,
};

const FisSlice = createSlice({
  name: "fis",
  initialState,
  reducers: {
    setChooseAccountVisible(state: FisState, action: PayloadAction<boolean>) {
      state.chooseAccountVisible = action.payload;
    },
    setChooseAccountWalletType(
      state: FisState,
      action: PayloadAction<WalletType>
    ) {
      state.chooseAccountWalletType = action.payload;
    },
    setRouteNextPage(
      state: FisState,
      action: PayloadAction<string | undefined>
    ) {
      state.routeNextPage = action.payload;
    },
  },
});

export const {
  setChooseAccountVisible,
  setChooseAccountWalletType,
  setRouteNextPage,
} = FisSlice.actions;

export default FisSlice.reducer;

export const bond =
  (
    address: string,
    txHash: string,
    blockHash: string,
    amount: string,
    poolAddress: string,
    rsymbol: rSymbol,
    chainId: ChainId,
    targetAddress: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    const handleStakeError = (errorMsg: string) => {
      dispatch(
        updateStakeLoadingParams(
          {
            status: "error",
            errorMsg,
            errorStep: "staking",
            progressDetail: {
              staking: {
                totalStatus: "error",
                broadcastStatus: "error",
              },
              minting: {},
            },
          },
          (newParams) => {
            dispatch(
              updateNotice(newParams?.noticeUuid, {
                status: "Error",
                stakeLoadingParams: newParams,
              })
            );
          }
        )
      );
    };

    dispatch(
      updateStakeLoadingParams(
        {
          status: "loading",
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
            stakingParams: {
              address,
              txHash,
              blockHash,
              amount,
              poolAddress,
              type: rsymbol,
              chainId,
              targetAddress,
            },
            minting: {},
          },
        },
        (newParams) => {
          dispatch(
            updateNotice(newParams?.noticeUuid, {
              stakeLoadingParams: newParams,
            })
          );
        }
      )
    );

    const fisAddress = getState().wallet.polkadotAccount;
    if (!fisAddress) {
      handleStakeError(STAFI_ACCOUNT_EMPTY_MESSAGE);
      return;
    }

    const keyringInstance = keyring.init(Symbol.Fis);
    let signature = undefined;
    const stafiApi = await stafiServer.createStafiApi();
    let pubkey = "";
    let poolPubKey = poolAddress;
    // todo: other rTokens, here only rMatic
    if (rsymbol === rSymbol.Matic) {
      await sleep(3000);

      const metaMaskAccount = getState().wallet.metaMaskAccount;
      const fisPubkey = u8aToHex(
        keyringInstance.decodeAddress(fisAddress as string),
        -1,
        false
      );
      const msg = stringToHex(fisPubkey);
      pubkey = address;
      signature = await ethereum
        .request({
          method: "personal_sign",
          params: [metaMaskAccount, msg],
        })
        .catch((err: any) => {
          dispatch(setIsLoading(false));
          console.error(err);
        });
      console.log("signature succeeded, proceeding staking");
    } else {
      signature = await getPolkadotStakingSignature(
        address,
        u8aToHex(keyringInstance.decodeAddress(fisAddress))
      );
      pubkey = u8aToHex(keyringInstance.decodeAddress(address));

      // message.info('Signature succeeded, proceeding staking');
    }

    if (!signature) {
      handleStakeError(SIGN_ERROR_MESSAGE);
      return;
    }

    await sleep(5000);

    const { web3Enable, web3FromSource } = await import(
      "@polkadot/extension-dapp"
    );
    web3Enable("stafi/rtoken");
    const injector = await web3FromSource("polkadot-js");

    let bondResult: any;
    if (chainId === ChainId.STAFI) {
      bondResult = await stafiApi.tx.rTokenSeries.liquidityBond(
        pubkey,
        signature,
        poolPubKey,
        blockHash,
        txHash,
        amount.toString(),
        rsymbol
      );
      // console.log({
      //   pubkey,
      //   signature,
      //   poolPubKey,
      //   blockHash,
      //   txHash,
      //   amount,
      //   type,
      // });
    } else {
      let swapAddress;
      if (chainId === ChainId.SOL) {
        // sol chain id
        // todo:
      } else {
        swapAddress = targetAddress;
      }
      bondResult = await stafiApi.tx.rTokenSeries.liquidityBondAndSwap(
        pubkey,
        signature,
        poolPubKey,
        blockHash,
        txHash,
        amount,
        rsymbol,
        swapAddress,
        chainId
      );
    }
    // console.log(bondResult);

    try {
      dispatch(
        updateStakeLoadingParams({
          progressDetail: {
            staking: {
              totalStatus: "loading",
              broadcastStatus: "loading",
            },
            minting: {},
            swapping: {},
          },
        })
      );
      let index = 0;
      // console.log(fisAddress, injector.signer);
      bondResult
        .signAndSend(fisAddress, { signer: injector.signer }, (result: any) => {
          if (index === 0) {
            index++;
          }
          // const tx = bondResult.hash.toHex();
          try {
            if (result.status.isInBlock) {
              dispatch(
                updateStakeLoadingParams({
                  progressDetail: {
                    staking: {
                      totalStatus: "loading",
                      broadcastStatus: "success",
                      packStatus: "loading",
                    },
                    minting: {},
                    swapping: {},
                  },
                })
              );
              // console.log("inBlock");
              // console.log('events', result.events);
              result.events
                .filter((e: any) => e.event.section === "system")
                .forEach((data: any) => {
                  // console.log(data.event.method);
                  if (data.event.method === "ExtrinsicFailed") {
                    const [dispatchError] = data.event.data;
                    if (dispatchError.isModule) {
                      try {
                        const mod = dispatchError.asModule;
                        const error = data.registry.findMetaError(
                          new Uint8Array([
                            mod.index.toNumber(),
                            mod.error.toNumber(),
                          ])
                        );

                        let msgStr =
                          "Something is wrong, please try again later";
                        if (error.name === "") {
                          msgStr = "";
                        }
                        // msgStr && console.log(msgStr);
                      } catch (err) {
                        console.error(err);
                      }
                      // console.log("fail");
                    }
                    dispatch(
                      updateStakeLoadingParams(
                        {
                          status: "error",
                          errorMsg: "Bond transaction failed",
                          errorStep: "staking",
                          progressDetail: {
                            staking: {
                              totalStatus: "error",
                              packStatus: "error",
                            },
                            minting: {},
                          },
                        },
                        (newParams) => {
                          dispatch(
                            updateNotice(newParams?.noticeUuid, {
                              status: "Error",
                              stakeLoadingParams: newParams,
                            })
                          );
                        }
                      )
                    );
                    dispatch(setIsLoading(false));
                  } else if (data.event.method === "ExtrinsicSuccess") {
                    dispatch(
                      updateStakeLoadingParams(
                        {
                          progressDetail: {
                            staking: {
                              totalStatus: "loading",
                              packStatus: "success",
                              finalizeStatus: "loading",
                            },
                            minting: {},
                          },
                        },
                        (newParams) => {
                          dispatch(
                            updateNotice(newParams?.noticeUuid, {
                              status: "Pending",
                              stakeLoadingParams: newParams,
                            })
                          );
                        }
                      )
                    );
                    dispatch(getMinting(rsymbol, txHash, blockHash, chainId));
                    // console.log("loading");
                  }
                });
            } else if (result.isError) {
              // console.log(result.toHuman());
            }
            if (result.status.isFinalized) {
              // dispatch(
              // 	setStakeLoadingParams({
              // 		progressDetail: {
              // 			sending: {
              // 				totalStatus: 'success',
              // 				broadcastStatus: 'success',
              // 				packStatus: 'success',
              // 				finalizeStatus: 'success',
              // 			},
              // 			staking: {
              // 				totalStatus: 'success',
              // 				finalizeStatus: 'success',
              // 			}
              // 		}
              // 	})
              // );
              console.log("finalized");
            }
          } catch (err) {
            console.error(err);
          }
        })
        .catch((err: any) => {
          console.log(err.message);
          dispatch(setIsLoading(false));
          if (err.message === "Cancelled") {
            handleStakeError("Cancelled");
          } else {
            handleStakeError(err.message);
          }
        });
    } catch (err: any) {
      console.error(err);
    }
  };

export const getMinting =
  (
    rsymbol: rSymbol,
    txHash: string,
    blockHash: string,
    chainId: ChainId,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    dispatch(
      updateStakeLoadingParams(
        {
          status: "loading",
          progressDetail: {
            staking: {
              totalStatus: "success",
              broadcastStatus: "success",
              packStatus: "success",
            },
            minting: {
              totalStatus: "loading",
            },
          },
        },
        (newParams) => {
          dispatch(
            updateNotice(newParams?.noticeUuid, {
              stakeLoadingParams: newParams,
            })
          );
        }
      )
    );
    let bondSuccessParamArr: any[] = [];
    bondSuccessParamArr.push(blockHash);
    bondSuccessParamArr.push(txHash);

    dispatch(
      queryRTokenBondState(
        rsymbol,
        bondSuccessParamArr,
        async (result: string) => {
          if (result === "successful") {
            const targetAddress =
              getState().app.stakeLoadingParams?.targetAddress;
            const amount = getState().app.stakeLoadingParams?.amount;
            dispatch(
              updateStakeLoadingParams({
                progressDetail: {
                  minting: {
                    totalStatus: "success",
                  },
                  swapping: {
                    totalStatus: "loading",
                  },
                },
                // customMsg: undefined,
              })
            );
            if (chainId === ChainId.STAFI) {
              dispatch(
                updateStakeLoadingParams(
                  {
                    status: "success",
                    customMsg: undefined,
                  },
                  (newParams) => {
                    dispatch(
                      updateNotice(newParams?.noticeUuid, {
                        status: "Confirmed",
                        stakeLoadingParams: newParams,
                      })
                    );
                  }
                )
              );
              cb && cb(true);
            } else {
              let tokenAbi: any = "";
              let tokenAddress: any = "";
              let oldBalance: string = "0";
              if (rsymbol === rSymbol.Matic) {
                if (chainId === ChainId.BSC) {
                  tokenAbi = getBSCRMaticAbi();
                  tokenAddress = getBep20TokenContractConfig().rMATIC;
                  oldBalance = await getBep20AssetBalance(
                    targetAddress,
                    tokenAbi,
                    tokenAddress
                  );
                } else if (chainId === ChainId.ETH) {
                  tokenAbi = getERCMaticAbi();
                  tokenAddress = getErc20TokenContractConfig().rMATIC;
                  oldBalance = await getErc20AssetBalance(
                    targetAddress,
                    tokenAbi,
                    tokenAddress,
                    TokenName.MATIC
                  );
                }
              }
              dispatch(
                updateStakeLoadingParams(
                  {
                    status: "loading",
                    progressDetail: {
                      swapping: {
                        totalStatus: "loading",
                      },
                    },
                    customMsg: "Minting succeeded, now swapping...",
                  },
                  (newParams) => {
                    dispatch(
                      updateNotice(newParams?.noticeUuid, {
                        status: "Pending",
                        stakeLoadingParams: newParams,
                      })
                    );
                  }
                )
              );
              dispatch(
                queryRTokenSwapState(
                  chainId,
                  targetAddress as string,
                  rsymbol,
                  oldBalance,
                  amount as string,
                  (result: string) => {
                    if (result === "successful") {
                      dispatch(
                        updateStakeLoadingParams(
                          {
                            status: "success",
                            progressDetail: {
                              swapping: {
                                totalStatus: "success",
                              },
                            },
                            customMsg: undefined,
                          },
                          (newParams) => {
                            dispatch(
                              updateNotice(newParams?.noticeUuid, {
                                status: "Confirmed",
                                stakeLoadingParams: newParams,
                              })
                            );
                          }
                        )
                      );
                    } else if (result === "failure") {
                      dispatch(
                        updateStakeLoadingParams(
                          {
                            status: "error",
                            errorMsg: "Swap failed",
                            errorStep: "swapping",
                            progressDetail: {
                              swapping: {
                                totalStatus: "error",
                              },
                            },
                            customMsg: undefined,
                          },
                          (newParams) => {
                            dispatch(
                              updateNotice(newParams?.noticeUuid, {
                                status: "Error",
                                stakeLoadingParams: newParams,
                              })
                            );
                          }
                        )
                      );
                    }
                  }
                )
              );
            }
            // todo: swapping
          } else if (result === "failure") {
            dispatch(
              updateStakeLoadingParams(
                {
                  status: "error",
                  errorMsg: "Mint failed",
                  errorStep: "minting",
                  progressDetail: {
                    minting: {
                      totalStatus: "error",
                    },
                  },
                  customMsg: undefined,
                },
                (newParams) => {
                  dispatch(
                    updateNotice(newParams?.noticeUuid, {
                      status: "Error",
                      stakeLoadingParams: newParams,
                    })
                  );
                }
              )
            );
          }
        }
      )
    );
  };

export const queryRTokenBondState =
  (rsymbol: rSymbol, bondSuccessParamArr: any, cb?: Function): AppThunk =>
  async (dispatch, getState) => {
    try {
      const stafiApi = await stafiServer.createStafiApi();
      const result = await stafiApi.query.rTokenSeries.bondStates(
        rsymbol,
        bondSuccessParamArr
      );

      let bondState = result.toJSON();
      if (bondState === "Fail") {
        // console.log("mint failure");
        cb && cb("failure");
      } else if (bondState === "Success") {
        // console.log("mint success");
        cb && cb("successful");
      } else {
        // console.log("mint pending");
        cb && cb("pending");
        setTimeout(() => {
          dispatch(queryRTokenBondState(rsymbol, bondSuccessParamArr, cb));
        }, 15000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

export const queryRTokenSwapState =
  (
    chainId: ChainId,
    targetAddress: string,
    rsymbol: rSymbol,
    oldBalance: string,
    amount: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    let tokenAbi: any = "";
    let tokenAddress: any = "";
    let balance: string = "";
    if (rsymbol === rSymbol.Matic) {
      if (chainId === ChainId.BSC) {
        tokenAbi = getBSCRMaticAbi();
        tokenAddress = getBep20TokenContractConfig().rMATIC;
        balance = await getBep20AssetBalance(
          targetAddress,
          tokenAbi,
          tokenAddress
        );
      } else if (chainId === ChainId.ETH) {
        tokenAbi = getERCMaticAbi();
        tokenAddress = getErc20TokenContractConfig().rMATIC;
        balance = await getErc20AssetBalance(
          targetAddress,
          tokenAbi,
          tokenAddress,
          TokenName.MATIC
        );
      }
    }

    if (
      Number(balance) - Number(oldBalance) <= Number(amount) * 1.1 &&
      Number(balance) - Number(oldBalance) >= Number(amount) * 0.9
    ) {
      cb && cb("successful");
    } else {
      setTimeout(() => {
        dispatch(
          queryRTokenSwapState(
            chainId,
            targetAddress,
            rsymbol,
            oldBalance,
            amount,
            cb
          )
        );
      }, 3000);
    }
  };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fisUnbond =
  (
    amount: string,
    symbol: rSymbol,
    recipient: string,
    selectedPool: string,
    topstr: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const address = getState().wallet.polkadotAccount as string;
      const api = await stafiServer.createStafiApi();

      dispatch(
        setRedeemLoadingParams({
          broadcastStatus: "loading",
        })
      );

      const { web3Enable, web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );
      web3Enable(stafiServer.getWeb3EnableName());
      const injector = await web3FromSource(stafiServer.getPolkadotJsSource());

      const unbondResult = await api.tx.rTokenSeries.liquidityUnbond(
        symbol,
        selectedPool,
        numberUtil.tokenAmountToChain(amount, symbol).toString(),
        recipient
      );

      unbondResult
        // @ts-ignore
        .signAndSend(address, { signer: injector.signer }, (result: any) => {
          try {
            if (result.status.isInBlock) {
              result.events
                .filter((e: any) => e.event.section === "system")
                .forEach((data: any) => {
                  if (data.event.method === "ExtrinsicSuccess") {
                    const txHash = unbondResult.hash.toHex();
                    cb && cb("Success", txHash);
                    dispatch(
                      setRedeemLoadingParams({
                        status: "success",
                        broadcastStatus: "success",
                        packStatus: "success",
                        finalizeStatus: "success",
                      })
                    );
                    dispatch(setIsLoading(false));
                  } else if (data.event.method === "ExtrinsicFailed") {
                    cb && cb("Failed");
                    dispatch(
                      setRedeemLoadingParams({
                        status: "error",
                        errorMsg: "Unstake failed",
                      })
                    );
                    dispatch(setIsLoading(false));
                  }
                });
            }
          } catch (err: any) {
            cb && cb("Failed");
            dispatch(setIsLoading(false));
          }
        })
        .catch((err: any) => {
          console.log(err);
          dispatch(setIsLoading(false));
          if ((err + "").startsWith("Error: Cancelled")) {
            cb && cb("Cancel");
            snackbarUtil.error(CANCELLED_MESSAGE);
            dispatch(setRedeemLoadingParams(undefined));
          } else {
            snackbarUtil.error(err.message);
            dispatch(
              setRedeemLoadingParams({
                status: "error",
                errorMsg: "Unbond failed",
              })
            );
          }
        });
    } catch (err: any) {
      console.error(err);
    }
  };

export const getUnbondTransactionFees =
  (
    amount: string,
    rsymbol: rSymbol,
    recipient: string,
    selectedPool: string,
    cb?: (fee: string) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const address = getState().wallet.polkadotAccount as string;
      const api = await stafiServer.createStafiApi();

      const txInfo = await api.tx.rTokenSeries
        .liquidityUnbond(
          rsymbol,
          selectedPool,
          numberUtil.tokenAmountToChain(amount, rsymbol).toString(),
          recipient
        )
        .paymentInfo(address);
      const txFee = txInfo.partialFee.toNumber() / 1000000000000;
      cb && cb(txFee.toString());
    } catch (err) {
      console.log(err);
    }
  };

export const getBondTransactionFees =
  (
    amount: string,
    rsymbol: rSymbol,
    chainId: number,
    poolAddress: string,
    cb?: (fee: string) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const address = getState().wallet.polkadotAccount as string;
      if (!address) return;
      const api = await stafiServer.createStafiApi();
      let txInfo;
      if (chainId === 1) {
        txInfo = await api.tx.rTokenSeries
          .liquidityBond(address, "", poolAddress, "", "", amount, rsymbol)
          .paymentInfo(address);
      } else {
        txInfo = await api.tx.rTokenSeries
          .liquidityBondAndSwap(
            address,
            "",
            poolAddress,
            "",
            "",
            amount,
            rsymbol,
            address,
            chainId
          )
          .paymentInfo(address);
      }
      // console.log(txInfo.partialFee.toHuman());
      const txFee = txInfo.partialFee.toNumber() / 1000000000000;
      cb && cb(txFee.toString());
    } catch (err) {
      console.log(err);
    }
  };
