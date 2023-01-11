import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getBnbStakePortalAbi, getBnbStakePortalAddress } from "config/bnb";
import {
  getBep20BridgeAbi,
  getBep20FisTokenAbi,
  getBep20RDotTokenAbi,
  getBep20REthTokenAbi,
  getBep20RKsmTokenAbi,
} from "config/bep20Abi";
import {
  getBep20BridgeContractConfig,
  getBep20TokenContractConfig,
} from "config/bep20Contract";
import { getSolanaRestRpc, getSolanaWsRpc, isDev } from "config/env";
import {
  getErc20BridgeAbi,
  getErc20FisTokenAbi,
  getErc20RDotTokenAbi,
  getErc20REthTokenAbi,
  getErc20RFisTokenAbi,
  getErc20RKsmTokenAbi,
  getErc20RMaticTokenAbi,
} from "config/erc20Abi";
import {
  getErc20BridgeContractConfig,
  getErc20TokenContractConfig,
} from "config/erc20Contract";
import { getBridgeSwapScanUrl, getStafiScanTxUrl } from "config/explorer";
import {
  getBSCRMaticAbi,
  getERCMaticAbi,
  getMaticStakePortalAbi,
  getMaticStakePortalAddress,
} from "config/matic";
import {
  ChainId,
  RTokenName,
  TokenName,
  TokenStandard,
  TokenSymbol,
  TokenType,
} from "interfaces/common";
import { AppThunk } from "redux/store";
import StafiServer from "servers/stafi";
import { stafiUuid, timeout } from "utils/common";
import { CANCELLED_MESSAGE } from "utils/constants";
import { LocalNotice } from "utils/notice";
import { numberToChain } from "utils/number";
import numberUtil from "utils/numberUtil";
import {
  getNativeFisBalance,
  getNativeRTokenBalance,
} from "utils/polkadotUtils";
import { getBridgeResourceId, getTokenSymbolFromTokenType } from "utils/rToken";
import snackbarUtil from "utils/snackbarUtils";
import {
  createWeb3,
  getBep20Allowance,
  getBep20AssetBalance,
  getErc20Allowance,
  getErc20AssetBalance,
} from "utils/web3Utils";
import { addNotice, setIsLoading, updateNotice } from "./AppSlice";
import {
  getSolanaExtension,
  getSolanaTokenAccountPubkey,
  getSplAssetBalance,
  refreshPhantom,
} from "utils/solanaUtils";
import { connectPhantom } from "./WalletSlice";
import * as crypto from "crypto";
import {
  getSPLBridgeConfig,
  getSPLTokenContractConfig,
} from "config/splContract";

const stafiServer = new StafiServer();

interface BridgePresetParams {
  tokenName: RTokenName | TokenName.FIS;
  srcTokenStandard: TokenStandard;
  dstTokenStandard: TokenStandard;
}

interface BridgeSwapLoadingParams {
  modalVisible?: boolean;
  status?: "loading" | "success" | "error";
  swapAmount?: string;
  srcTokenStandard?: TokenStandard;
  dstTokenStandard?: TokenStandard;
  tokenName?: TokenName | RTokenName;
  scanUrl?: string;
}
export type BridgeFeeCollection = {
  [tokenStandard in TokenStandard]?: {
    [tokenName in TokenName]?: string;
  };
};

export interface BridgeState {
  bridgeModalVisible: boolean;
  bridgePresetParams: BridgePresetParams | undefined;
  bridgeSwapLoadingParams: BridgeSwapLoadingParams | undefined;
  erc20BridgeFee: string;
  bep20BridgeFee: string;
  solBridgeFee: string;
  maticErc20BridgeFee: string;
  maticBep20BridgeFee: string;
  maticSolBridgeFee: string;
  bridgeFeeStore: BridgeFeeCollection;
}

const initialState: BridgeState = {
  bridgeModalVisible: false,
  bridgePresetParams: undefined,
  bridgeSwapLoadingParams: undefined,
  erc20BridgeFee: "--",
  bep20BridgeFee: "--",
  solBridgeFee: "--",
  maticErc20BridgeFee: "--",
  maticBep20BridgeFee: "--",
  maticSolBridgeFee: "--",
  bridgeFeeStore: {},
};

export const bridgeSlice = createSlice({
  name: "bridge",
  initialState,
  reducers: {
    setBridgeModalVisible: (
      state: BridgeState,
      action: PayloadAction<boolean>
    ) => {
      state.bridgeModalVisible = action.payload;
    },
    setBridgePresetParams: (
      state: BridgeState,
      action: PayloadAction<BridgePresetParams | undefined>
    ) => {
      state.bridgePresetParams = action.payload;
    },
    setBridgeSwapLoadingParams: (
      state: BridgeState,
      action: PayloadAction<BridgeSwapLoadingParams | undefined>
    ) => {
      if (!action.payload) {
        state.bridgeSwapLoadingParams = undefined;
      } else {
        state.bridgeSwapLoadingParams = {
          ...state.bridgeSwapLoadingParams,
          ...action.payload,
        };
      }
    },
    setErc20BridgeFee: (state: BridgeState, action: PayloadAction<string>) => {
      state.erc20BridgeFee = action.payload;
    },
    setBep20BridgeFee: (state: BridgeState, action: PayloadAction<string>) => {
      state.bep20BridgeFee = action.payload;
    },
    setSolBridgeFee: (state: BridgeState, action: PayloadAction<string>) => {
      state.solBridgeFee = action.payload;
    },
    setMaticErc20BridgeFee: (
      state: BridgeState,
      action: PayloadAction<string>
    ) => {
      state.maticErc20BridgeFee = action.payload;
    },
    setMaticBep20BridgeFee: (
      state: BridgeState,
      action: PayloadAction<string>
    ) => {
      state.maticBep20BridgeFee = action.payload;
    },
    setMaticSolBridgeFee: (
      state: BridgeState,
      action: PayloadAction<string>
    ) => {
      state.maticSolBridgeFee = action.payload;
    },
    setBridgeFeeStore: (
      state: BridgeState,
      action: PayloadAction<BridgeFeeCollection>
    ) => {
      state.bridgeFeeStore = action.payload;
    },
  },
});

export const {
  setBridgeModalVisible,
  setBridgePresetParams,
  setBridgeSwapLoadingParams,
  setBep20BridgeFee,
  setErc20BridgeFee,
  setSolBridgeFee,
  setMaticErc20BridgeFee,
  setMaticBep20BridgeFee,
  setMaticSolBridgeFee,
  setBridgeFeeStore,
} = bridgeSlice.actions;

export default bridgeSlice.reducer;

export const getBridgeEstimateEthFee = () => {
  if (isDev()) {
    return "0.001000";
  } else {
    return "0.000020";
  }
};

export const getBridgeEstimateBscFee = () => {
  if (isDev()) {
    return "0.001000";
  } else {
    return "0.000020";
  }
};

export const getBridgeEstimateSolFee = () => {
  if (isDev()) {
    return "0.000200";
  } else {
    return "0.000200";
  }
};

/**
 * query estimate bridge fees
 */
export const queryBridgeFees = (): AppThunk => async (dispatch, getState) => {
  try {
    const api = await stafiServer.createStafiApi();

    const resultErc20 = await api.query.bridgeCommon.chainFees(ChainId.ETH);
    if (resultErc20.toJSON()) {
      const fee = numberUtil.fisAmountToHuman(resultErc20.toJSON());
      dispatch(setErc20BridgeFee(numberUtil.handleFisAmountToFixed(fee)));
    }

    const resultBep20 = await api.query.bridgeCommon.chainFees(ChainId.BSC);
    if (resultBep20.toJSON()) {
      const fee = numberUtil.fisAmountToHuman(resultBep20.toJSON());
      dispatch(setBep20BridgeFee(numberUtil.handleFisAmountToFixed(fee)));
    }

    const resultSol = await api.query.bridgeCommon.chainFees(ChainId.SOL);
    if (resultSol.toJSON()) {
      const fee = numberUtil.fisAmountToHuman(resultSol.toJSON());
      dispatch(setSolBridgeFee(numberUtil.handleFisAmountToFixed(fee)));
    }
  } catch (err: any) {
    console.error(err);
  }
};

/**
 * query bridge fee from stakePortal
 * @returns
 */
export const getBridgeFee = (): AppThunk => async (dispatch, getState) => {
  try {
    const web3 = createWeb3();
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    const contractMatic = new web3.eth.Contract(
      getMaticStakePortalAbi(),
      getMaticStakePortalAddress(),
      {
        from: metaMaskAccount,
      }
    );

    const erc20BridgeFeeResult = await contractMatic.methods
      .bridgeFee(ChainId.ETH)
      .call();
    if (!isNaN(Number(erc20BridgeFeeResult))) {
      dispatch(
        setMaticErc20BridgeFee(web3.utils.fromWei(erc20BridgeFeeResult))
      );
    }

    const bep20BridgeFeeResult = await contractMatic.methods
      .bridgeFee(ChainId.BSC)
      .call();
    if (!isNaN(Number(bep20BridgeFeeResult))) {
      dispatch(
        setMaticBep20BridgeFee(web3.utils.fromWei(bep20BridgeFeeResult))
      );
    }

    const solBridgeFeeResult = await contractMatic.methods
      .bridgeFee(ChainId.SOL)
      .call();
    if (!isNaN(Number(solBridgeFeeResult))) {
      dispatch(setMaticSolBridgeFee(web3.utils.fromWei(solBridgeFeeResult)));
    }
  } catch (err: unknown) {}
};

export const nativeToOtherSwap =
  (
    dstTokenStandard: TokenStandard,
    tokenStr: TokenName | RTokenName,
    tokenType: TokenType,
    tokenAmount: any,
    targetAddress: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const chainId =
        dstTokenStandard === TokenStandard.Native
          ? ChainId.STAFI
          : dstTokenStandard === TokenStandard.ERC20
          ? ChainId.ETH
          : dstTokenStandard === TokenStandard.BEP20
          ? ChainId.BSC
          : dstTokenStandard === TokenStandard.SPL
          ? ChainId.SOL
          : -1;
      dispatch(setIsLoading(true));
      const noticeUuid = stafiUuid();

      let txAddress = targetAddress;
      if (dstTokenStandard === TokenStandard.SPL) {
        const { PublicKey } = await import("@solana/web3.js");
        txAddress = u8aToHex(new PublicKey(targetAddress).toBytes());
        const tokenMintPublicKey = await getSolanaTokenAccountPubkey(
          targetAddress,
          tokenType
        );
        if (!tokenMintPublicKey) {
          throw new Error("Please add the SPL token account first.");
        }
        txAddress = u8aToHex(tokenMintPublicKey.toBytes());
      }

      // if (dstTokenStandard === TokenStandard.ERC20) {
      //   updateSwapParamsOfErc(dispatch, notice_uuid, tokenType, tokenAmount, destAddress);
      // } else if (dstTokenStandard === TokenStandard.BEP20) {
      //   updateSwapParamsOfBep(dispatch, notice_uuid, tokenType, tokenAmount, destAddress);
      // }

      const { web3Enable, web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );
      web3Enable("stafi/rtoken");
      const injector = await web3FromSource("polkadot-js");
      const api = await stafiServer.createStafiApi();
      let currentAccount = getState().wallet.polkadotAccount;
      let extrinsic: any = "";

      if (tokenType === "fis") {
        const amount = numberToChain(tokenAmount.toString(), TokenSymbol.FIS);
        extrinsic = await api.tx.bridgeSwap.transferNative(
          amount.toString(),
          txAddress,
          chainId
        );
      } else {
        let rsymbol = getTokenSymbolFromTokenType(tokenType);
        const amount = numberToChain(tokenAmount.toString(), rsymbol);
        extrinsic = await api.tx.bridgeSwap.transferRtoken(
          rsymbol,
          amount.toString(),
          txAddress,
          chainId
        );
      }
      if (!extrinsic) {
        dispatch(setIsLoading(false));
        // dispatch(setSwapLoadingStatus(0));
        return;
      }

      extrinsic
        .signAndSend(
          currentAccount,
          { signer: injector.signer },
          (result: any) => {
            if (result.status.isInBlock) {
              result.events
                .filter((obj: any) => obj.event.section === "system")
                .forEach(({ event: { data, method } }: any) => {
                  if (method === "ExtrinsicFailed") {
                    const [dispatchError] = data;
                    if (dispatchError.isModule) {
                      try {
                        const mod = dispatchError.asModule;
                        const error = data.registry.findMetaError(
                          new Uint8Array([
                            mod.index.toNumber(),
                            mod.error.toNumber(),
                          ])
                        );
                        console.log("error", error);
                        let message_str =
                          "Something is wrong, please make sure you have enough FIS balance";
                        if (tokenType === "rfis") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rFIS balance";
                        } else if (tokenType === "rdot") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rDOT balance";
                        } else if (tokenType === "rksm") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rKSM balance";
                        } else if (tokenType === "ratom") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rATOM balance";
                        } else if (tokenType === "rsol") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rSOL balance";
                        } else if (tokenType === "rmatic") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rMATIC balance";
                        } else if (tokenType === "rbnb") {
                          message_str =
                            "Something is wrong, please make sure you have enough FIS and rBNB balance";
                        }
                        if (error.name === "ServicePaused") {
                          message_str =
                            "Service is paused, please try again later!";
                        }
                        dispatch(setIsLoading(false));
                        // dispatch(setSwapLoadingStatus(0));
                        console.error(message_str);
                      } catch (error) {
                        dispatch(setIsLoading(false));
                        // dispatch(setSwapLoadingStatus(0));
                        console.error((error as any).message);
                      }
                    }
                  } else if (method === "ExtrinsicSuccess") {
                    dispatch(setIsLoading(false));
                    // dispatch(setSwapLoadingStatus(2));
                    // dispatch(
                    //   add_Swap_Notice(
                    //     notice_uuid,
                    //     tokenStr,
                    //     tokenAmount,
                    //     noticeStatus.Pending,
                    //     {
                    //       swapType: "native",
                    //       destSwapType:
                    //         dstTokenStandard === BSC_CHAIN_ID
                    //           ? "bep20"
                    //           : dstTokenStandard === SOL_CHAIN_ID
                    //           ? "spl"
                    //           : dstTokenStandard === STAFIHUB_CHAIN_ID
                    //           ? "ics20"
                    //           : "erc20",
                    //       address: destAddress,
                    //     }
                    //   )
                    // );
                    const txHash = extrinsic.hash.toHex();

                    const newNotice: LocalNotice = {
                      id: noticeUuid,
                      type: "rBridge Swap",
                      txDetail: {
                        transactionHash: txHash,
                        sender: getState().wallet.polkadotAccount || "",
                      },
                      data: {
                        tokenName: tokenStr,
                        amount: Number(tokenAmount) + "",
                        srcTokenStandard: TokenStandard.Native,
                        dstTokenStandard,
                        targetAddress: targetAddress,
                      },
                      scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
                      status: "Pending",
                    };
                    dispatch(addNotice(newNotice));
                    cb && cb();

                    dispatch(
                      setBridgeSwapLoadingParams({
                        modalVisible: true,
                        tokenName: tokenStr,
                        swapAmount: tokenAmount,
                        srcTokenStandard: TokenStandard.Native,
                        dstTokenStandard: dstTokenStandard,
                        status: "loading",
                        scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
                      })
                    );

                    dispatch(
                      checkSwapStatus(
                        dstTokenStandard,
                        tokenStr,
                        tokenType,
                        tokenAmount,
                        targetAddress,
                        (status) => {
                          if (status === "success") {
                            dispatch(
                              setBridgeSwapLoadingParams({
                                status: "success",
                              })
                            );

                            dispatch(
                              updateNotice(noticeUuid, { status: "Confirmed" })
                            );
                          } else if (status === "pending") {
                          }
                        }
                      )
                    );
                  }
                });
            } else if (result.isError) {
              dispatch(setIsLoading(false));
              // dispatch(setSwapLoadingStatus(0));
              console.error(result.toHuman());
            }
          }
        )
        .catch((error: any) => {
          dispatch(setIsLoading(false));
          // dispatch(setSwapLoadingStatus(0));
          // message.error(error.message);
        });
    } catch (error) {
      dispatch(setIsLoading(false));
      // dispatch(setSwapLoadingStatus(0));
      console.error((error as any).message);
    }
  };

export const erc20ToOtherSwap =
  (
    dstTokenStandard: TokenStandard,
    tokenStr: TokenName | RTokenName,
    tokenType: TokenType,
    tokenAmount: any,
    targetAddress: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    const chainId =
      dstTokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : dstTokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : dstTokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : dstTokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1;
    dispatch(setIsLoading(true));
    // dispatch(setSwapLoadingStatus(1));
    // dispatch(setSwapWaitingTime(600));
    const metaMaskAddress = getState().wallet.metaMaskAccount;
    const noticeUuid = stafiUuid();

    // if (dstTokenStandard === BSC_CHAIN_ID) {
    //   updateSwapParamsOfBep(dispatch, notice_uuid, tokenType, tokenAmount, targetAddress);
    // } else {
    //   updateSwapParamsOfNative(dispatch, notice_uuid, tokenType, tokenAmount, targetAddress);
    // }

    let web3 = createWeb3();

    let tokenAbi: any = "";
    let tokenAddress = "";
    let tokenContract: any = "";
    let allowance: any = 0;

    if (!metaMaskAddress) {
      dispatch(setIsLoading(false));
      // dispatch(setSwapLoadingStatus(0));
      return;
    }

    const erc20TokenContractConfig = getErc20TokenContractConfig();
    if (tokenType === "fis") {
      tokenAbi = getErc20FisTokenAbi();
      tokenAddress = erc20TokenContractConfig.FIS;
      // allowance = getState().ETHModule.FISErc20Allowance;
    } else if (tokenType === "rfis") {
      tokenAbi = getErc20RFisTokenAbi();
      tokenAddress = erc20TokenContractConfig.rFIS;
      // allowance = getState().ETHModule.RFISErc20Allowance;
    } else if (tokenType === "rksm") {
      tokenAbi = getErc20RKsmTokenAbi();
      tokenAddress = erc20TokenContractConfig.rKSM;
      // allowance = getState().ETHModule.RKSMErc20Allowance;
    } else if (tokenType === "rdot") {
      tokenAbi = getErc20RDotTokenAbi();
      tokenAddress = erc20TokenContractConfig.rDOT;
      // allowance = getState().ETHModule.RDOTErc20Allowance;
    } else if (tokenType === "rsol") {
      // tokenContract = new web3.eth.Contract(solServer.getTokenAbi(), solServer.getRSOLTokenAddress(), {
      //   from: memtaMaskAddress,
      // });
      // allowance = getState().ETHModule.RSOLErc20Allowance;
    } else if (tokenType === "rmatic") {
      tokenAbi = getErc20RMaticTokenAbi();
      tokenAddress = erc20TokenContractConfig.rMATIC;
      // allowance = getState().ETHModule.RMaticErc20Allowance;
    } else if (tokenType === "reth") {
      tokenAbi = getErc20REthTokenAbi();
      tokenAddress = erc20TokenContractConfig.rETH;
      // allowance = getState().ETHModule.RETHErc20Allowance;
    }
    if (!tokenAbi || !tokenAddress) {
      dispatch(setIsLoading(false));
      return;
    }

    tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: metaMaskAddress,
    });

    allowance = await getErc20Allowance(
      metaMaskAddress,
      tokenAbi,
      tokenAddress
    );

    const amount = web3.utils.toWei(tokenAmount.toString());
    try {
      if (Number(allowance) < Number(amount)) {
        const approveResult = await tokenContract.methods
          .approve(
            getErc20BridgeContractConfig().bridgeHandler,
            web3.utils.toWei("10000000")
          )
          .send();
        if (approveResult && approveResult.status) {
          let bridgeContract = new web3.eth.Contract(
            getErc20BridgeAbi(),
            getErc20BridgeContractConfig().bridge,
            {
              from: metaMaskAddress,
            }
          );
          const sendAmount = web3.utils.toWei(getBridgeEstimateEthFee());

          let amountHex = web3.eth.abi.encodeParameter("uint256", amount);
          let len;
          let rAddressHex;
          if (chainId === ChainId.STAFI) {
            len = "32";
            rAddressHex = u8aToHex(decodeAddress(targetAddress));
          } else {
            len = "20";
            rAddressHex = targetAddress;
          }
          let lenHex = web3.eth.abi.encodeParameter("uint256", len);

          let data = amountHex + lenHex.slice(2) + rAddressHex.slice(2);

          const result = await bridgeContract.methods
            .deposit(chainId, getBridgeResourceId(tokenType), data)
            .send({ value: sendAmount });

          if (result && result.status) {
            // dispatch(
            //   add_Swap_Notice(
            //     notice_uuid,
            //     tokenStr,
            //     tokenAmount,
            //     noticeStatus.Pending,
            //     {
            //       swapType: "erc20",
            //       destSwapType:
            //         dstTokenStandard === STAFI_CHAIN_ID ? "native" : "bep20",
            //       address: targetAddress,
            //     }
            //   )
            // );
            // dispatch(setSwapLoadingStatus(2));
            cb && cb({ txHash: result.transactionHash });
            dispatch(setIsLoading(false));

            const newNotice: LocalNotice = {
              id: noticeUuid,
              type: "rBridge Swap",
              txDetail: {
                transactionHash: result.transactionHash,
                sender: metaMaskAddress,
              },
              data: {
                tokenName: tokenStr,
                amount: Number(tokenAmount) + "",
                srcTokenStandard: TokenStandard.ERC20,
                dstTokenStandard,
                targetAddress: targetAddress,
              },
              scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
              status: "Pending",
            };
            dispatch(addNotice(newNotice));

            dispatch(
              setBridgeSwapLoadingParams({
                modalVisible: true,
                tokenName: tokenStr,
                swapAmount: tokenAmount,
                srcTokenStandard: TokenStandard.ERC20,
                dstTokenStandard: dstTokenStandard,
                status: "loading",
                scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
              })
            );

            dispatch(
              checkSwapStatus(
                dstTokenStandard,
                tokenStr,
                tokenType,
                tokenAmount,
                targetAddress,
                (status) => {
                  if (status === "success") {
                    dispatch(
                      setBridgeSwapLoadingParams({
                        status: "success",
                      })
                    );

                    dispatch(updateNotice(noticeUuid, { status: "Confirmed" }));
                  } else if (status === "pending") {
                  }
                }
              )
            );
          } else {
            // dispatch(setSwapLoadingStatus(0));
            // message.error("Error! Please try again");
          }
        } else {
          dispatch(setIsLoading(false));
          if (approveResult.code === 4001) {
            snackbarUtil.error(CANCELLED_MESSAGE);
          } else {
            snackbarUtil.error(approveResult.message);
          }
          // dispatch(setSwapLoadingStatus(0));
          // message.error("Error! Please try again");
        }
      } else {
        let bridgeContract = new web3.eth.Contract(
          getErc20BridgeAbi(),
          getErc20BridgeContractConfig().bridge,
          {
            from: metaMaskAddress,
          }
        );
        const sendAmount = web3.utils.toWei(getBridgeEstimateEthFee());

        let amountHex = web3.eth.abi.encodeParameter("uint256", amount);
        let len;
        let rAddressHex;
        if (chainId === ChainId.STAFI) {
          len = "32";
          rAddressHex = u8aToHex(decodeAddress(targetAddress));
        } else {
          len = "20";
          rAddressHex = targetAddress;
        }
        let lenHex = web3.eth.abi.encodeParameter("uint256", len);

        let data = amountHex + lenHex.slice(2) + rAddressHex.slice(2);

        const result = await bridgeContract.methods
          .deposit(chainId, getBridgeResourceId(tokenType), data)
          .send({ value: sendAmount });

        if (result && result.status && result.transactionHash) {
          // dispatch(
          //   add_Swap_Notice(
          //     notice_uuid,
          //     tokenStr,
          //     tokenAmount,
          //     noticeStatus.Pending,
          //     {
          //       swapType: "erc20",
          //       destSwapType:
          //         dstTokenStandard === STAFI_CHAIN_ID ? "native" : "bep20",
          //       address: targetAddress,
          //     }
          //   )
          // );
          // dispatch(setSwapLoadingStatus(2));
          cb && cb({ txHash: result.transactionHash });
          dispatch(setIsLoading(false));

          const newNotice: LocalNotice = {
            id: noticeUuid,
            type: "rBridge Swap",
            txDetail: {
              transactionHash: result.transactionHash,
              sender: metaMaskAddress,
            },
            data: {
              tokenName: tokenStr,
              amount: Number(tokenAmount) + "",
              srcTokenStandard: TokenStandard.ERC20,
              dstTokenStandard,
              targetAddress: targetAddress,
            },
            scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
            status: "Pending",
          };
          dispatch(addNotice(newNotice));

          dispatch(
            setBridgeSwapLoadingParams({
              modalVisible: true,
              tokenName: tokenStr,
              swapAmount: tokenAmount,
              srcTokenStandard: TokenStandard.ERC20,
              dstTokenStandard: dstTokenStandard,
              status: "loading",
              scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
            })
          );

          dispatch(
            checkSwapStatus(
              dstTokenStandard,
              tokenStr,
              tokenType,
              tokenAmount,
              targetAddress,
              (status) => {
                if (status === "success") {
                  dispatch(
                    setBridgeSwapLoadingParams({
                      status: "success",
                    })
                  );

                  dispatch(updateNotice(noticeUuid, { status: "Confirmed" }));
                } else if (status === "pending") {
                }
              }
            )
          );
        } else {
          // dispatch(setSwapLoadingStatus(0));
          // message.error("Error! Please try again");
        }
      }
    } catch (error: unknown) {
      // dispatch(setSwapLoadingStatus(0));
      dispatch(setIsLoading(false));
      console.error((error as any).message);
      if ((error as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error((error as any).message);
      }
    } finally {
      // dispatch(setLoading(false));
    }
  };

export const bep20ToOtherSwap =
  (
    dstTokenStandard: TokenStandard,
    tokenStr: TokenName | RTokenName,
    tokenType: TokenType,
    tokenAmount: any,
    targetAddress: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    const chainId =
      dstTokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : dstTokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : dstTokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : dstTokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1;
    dispatch(setIsLoading(true));
    // dispatch(setSwapLoadingStatus(1));
    // dispatch(setSwapWaitingTime(600));
    const metaMaskAddress = getState().wallet.metaMaskAccount;
    const noticeUuid = stafiUuid();

    // if (dstTokenStandard === BSC_CHAIN_ID) {
    //   updateSwapParamsOfBep(dispatch, notice_uuid, tokenType, tokenAmount, targetAddress);
    // } else {
    //   updateSwapParamsOfNative(dispatch, notice_uuid, tokenType, tokenAmount, targetAddress);
    // }

    let web3 = createWeb3();

    let tokenAbi: any = "";
    let tokenAddress = "";
    let tokenContract: any = "";
    let allowance: any = 0;

    if (!metaMaskAddress) {
      dispatch(setIsLoading(false));
      // dispatch(setSwapLoadingStatus(0));
      return;
    }

    const bep20TokenContractConfig = getBep20TokenContractConfig();
    if (tokenType === "rfis") {
      tokenAbi = getErc20RFisTokenAbi();
      tokenAddress = bep20TokenContractConfig.rFIS;
      // allowance = getState().ETHModule.RFISErc20Allowance;
    } else if (tokenType === "rksm") {
      tokenAbi = getErc20RKsmTokenAbi();
      tokenAddress = bep20TokenContractConfig.rKSM;
      // allowance = getState().ETHModule.RKSMErc20Allowance;
    } else if (tokenType === "rdot") {
      tokenAbi = getErc20RDotTokenAbi();
      tokenAddress = bep20TokenContractConfig.rDOT;
      // allowance = getState().ETHModule.RDOTErc20Allowance;
    } else if (tokenType === "rsol") {
      // tokenContract = new web3.eth.Contract(solServer.getTokenAbi(), solServer.getRSOLTokenAddress(), {
      //   from: memtaMaskAddress,
      // });
      // allowance = getState().ETHModule.RSOLErc20Allowance;
    } else if (tokenType === "rmatic") {
      tokenAbi = getErc20RMaticTokenAbi();
      tokenAddress = bep20TokenContractConfig.rMATIC;
      // allowance = getState().ETHModule.RMaticErc20Allowance;
    } else if (tokenType === "reth") {
      tokenAbi = getErc20REthTokenAbi();
      tokenAddress = bep20TokenContractConfig.rETH;
      // allowance = getState().ETHModule.RETHErc20Allowance;
    }
    if (!tokenAbi || !tokenAddress) {
      dispatch(setIsLoading(false));
      return;
    }

    tokenContract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: metaMaskAddress,
    });

    allowance = await getBep20Allowance(
      metaMaskAddress,
      tokenAbi,
      tokenAddress
    );

    const amount = web3.utils.toWei(tokenAmount.toString());
    try {
      if (Number(allowance) < Number(amount)) {
        const approveResult = await tokenContract.methods
          .approve(
            getBep20BridgeContractConfig().bridgeHandler,
            web3.utils.toWei("10000000")
          )
          .send();
        if (approveResult && approveResult.status) {
          let bridgeContract = new web3.eth.Contract(
            getBep20BridgeAbi(),
            getBep20BridgeContractConfig().bridge,
            {
              from: metaMaskAddress,
            }
          );
          const sendAmount = web3.utils.toWei(getBridgeEstimateBscFee());

          let amountHex = web3.eth.abi.encodeParameter("uint256", amount);
          let len;
          let rAddressHex;
          if (chainId === ChainId.STAFI) {
            len = "32";
            rAddressHex = u8aToHex(decodeAddress(targetAddress));
          } else {
            len = "20";
            rAddressHex = targetAddress;
          }
          let lenHex = web3.eth.abi.encodeParameter("uint256", len);

          let data = amountHex + lenHex.slice(2) + rAddressHex.slice(2);

          const result = await bridgeContract.methods
            .deposit(chainId, getBridgeResourceId(tokenType), data)
            .send({ value: sendAmount });

          if (result && result.status) {
            cb && cb({ txHash: result.transactionHash });
            dispatch(setIsLoading(false));

            const newNotice: LocalNotice = {
              id: noticeUuid,
              type: "rBridge Swap",
              txDetail: {
                transactionHash: result.transactionHash,
                sender: metaMaskAddress,
              },
              data: {
                tokenName: tokenStr,
                amount: Number(tokenAmount) + "",
                srcTokenStandard: TokenStandard.BEP20,
                dstTokenStandard,
                targetAddress: targetAddress,
              },
              scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
              status: "Pending",
            };
            dispatch(addNotice(newNotice));

            dispatch(
              setBridgeSwapLoadingParams({
                modalVisible: true,
                tokenName: tokenStr,
                swapAmount: tokenAmount,
                srcTokenStandard: TokenStandard.BEP20,
                dstTokenStandard: dstTokenStandard,
                status: "loading",
                scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
              })
            );

            dispatch(
              checkSwapStatus(
                dstTokenStandard,
                tokenStr,
                tokenType,
                tokenAmount,
                targetAddress,
                (status) => {
                  if (status === "success") {
                    dispatch(
                      setBridgeSwapLoadingParams({
                        status: "success",
                      })
                    );

                    dispatch(updateNotice(noticeUuid, { status: "Confirmed" }));
                  } else if (status === "pending") {
                  }
                }
              )
            );
          } else {
            // dispatch(setSwapLoadingStatus(0));
            // message.error("Error! Please try again");
          }
        } else {
          dispatch(setIsLoading(false));
          if (approveResult.code === 4001) {
            snackbarUtil.error(CANCELLED_MESSAGE);
          } else {
            snackbarUtil.error(approveResult.message);
          }
          // dispatch(setSwapLoadingStatus(0));
          // message.error("Error! Please try again");
        }
      } else {
        let bridgeContract = new web3.eth.Contract(
          getBep20BridgeAbi(),
          getBep20BridgeContractConfig().bridge,
          {
            from: metaMaskAddress,
          }
        );
        const sendAmount = web3.utils.toWei(getBridgeEstimateBscFee());

        let amountHex = web3.eth.abi.encodeParameter("uint256", amount);
        let len;
        let rAddressHex;
        if (chainId === ChainId.STAFI) {
          len = "32";
          rAddressHex = u8aToHex(decodeAddress(targetAddress));
        } else {
          len = "20";
          rAddressHex = targetAddress;
        }
        let lenHex = web3.eth.abi.encodeParameter("uint256", len);

        let data = amountHex + lenHex.slice(2) + rAddressHex.slice(2);

        const result = await bridgeContract.methods
          .deposit(chainId, getBridgeResourceId(tokenType), data)
          .send({ value: sendAmount });

        if (result && result.status && result.transactionHash) {
          // dispatch(
          //   add_Swap_Notice(
          //     notice_uuid,
          //     tokenStr,
          //     tokenAmount,
          //     noticeStatus.Pending,
          //     {
          //       swapType: "erc20",
          //       destSwapType:
          //         dstTokenStandard === STAFI_CHAIN_ID ? "native" : "bep20",
          //       address: targetAddress,
          //     }
          //   )
          // );
          // dispatch(setSwapLoadingStatus(2));
          cb && cb({ txHash: result.transactionHash });
          dispatch(setIsLoading(false));

          const newNotice: LocalNotice = {
            id: noticeUuid,
            type: "rBridge Swap",
            txDetail: {
              transactionHash: result.transactionHash,
              sender: metaMaskAddress,
            },
            data: {
              tokenName: tokenStr,
              amount: Number(tokenAmount) + "",
              srcTokenStandard: TokenStandard.BEP20,
              dstTokenStandard,
              targetAddress: targetAddress,
            },
            scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
            status: "Pending",
          };
          dispatch(addNotice(newNotice));

          dispatch(
            setBridgeSwapLoadingParams({
              modalVisible: true,
              tokenName: tokenStr,
              swapAmount: tokenAmount,
              srcTokenStandard: TokenStandard.BEP20,
              dstTokenStandard: dstTokenStandard,
              status: "loading",
              scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
            })
          );

          dispatch(
            checkSwapStatus(
              dstTokenStandard,
              tokenStr,
              tokenType,
              tokenAmount,
              targetAddress,
              (status) => {
                if (status === "success") {
                  dispatch(
                    setBridgeSwapLoadingParams({
                      status: "success",
                    })
                  );

                  dispatch(updateNotice(noticeUuid, { status: "Confirmed" }));
                } else if (status === "pending") {
                }
              }
            )
          );
        } else {
          // dispatch(setSwapLoadingStatus(0));
          // message.error("Error! Please try again");
        }
      }
    } catch (error: unknown) {
      // dispatch(setSwapLoadingStatus(0));
      dispatch(setIsLoading(false));
      console.error((error as any).message);
      if ((error as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error((error as any).message);
      }
    } finally {
      // dispatch(setLoading(false));
    }
  };

export const splToOtherSwap =
  (
    dstTokenStandard: TokenStandard,
    tokenStr: TokenName | RTokenName,
    tokenType: TokenType,
    tokenAmount: any,
    targetAddress: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setIsLoading(true));
      const solana = getSolanaExtension();
      if (!solana) {
        snackbarUtil.error("Phantom extension not found");
        dispatch(setIsLoading(false));
        return;
      }

      await refreshPhantom();
      if (!solana.isConnected) {
        snackbarUtil.error("Please connect Phantom first");
        dispatch(setIsLoading(false));
        return;
      }

      const localSolAddress = getState().wallet.solanaAccount;
      const solAddress = solana.publicKey.toString();
      if (localSolAddress !== solAddress) {
        dispatch(connectPhantom(false));
        dispatch(setIsLoading(false));
        snackbarUtil.warning(
          "Phantom wallet address switched, please try again"
        );
        return;
      }

      let splTokenAddress = "";
      if (tokenType === TokenType.FIS) {
        splTokenAddress = getSPLTokenContractConfig().FIS;
      } else if (tokenType === TokenType.rSOL) {
        splTokenAddress = getSPLTokenContractConfig().rSOL;
      }
      const tokenAccountPubkey = await getSolanaTokenAccountPubkey(
        localSolAddress,
        tokenType
      );
      if (!tokenAccountPubkey) {
        dispatch(setIsLoading(false));
        snackbarUtil.error("Please create token account first");
        return;
      }

      const chainId =
        dstTokenStandard === TokenStandard.Native
          ? ChainId.STAFI
          : dstTokenStandard === TokenStandard.ERC20
          ? ChainId.ETH
          : dstTokenStandard === TokenStandard.BEP20
          ? ChainId.BSC
          : dstTokenStandard === TokenStandard.SPL
          ? ChainId.SOL
          : -1;
      const noticeUuid = stafiUuid();
      const { Transaction, Connection, PublicKey, TransactionInstruction } =
        await import("@solana/web3.js");

      const transaction = new Transaction();

      const bf = crypto
        .createHash("sha256")
        .update("global:transfer_out")
        .digest();
      const methodData = bf.slice(0, 8);
      // amount, LittleEndian
      const num = BigInt(Number(tokenAmount) * 1000000000);
      const ab = new ArrayBuffer(8);
      new DataView(ab).setBigInt64(0, num, true);
      // const amountBf = hexToU8a('0x' + num.toString(16));
      const amountData = Buffer.from(ab);
      // hex: 20 00 00 00
      const addressLengthData = Buffer.from([32, 0, 0, 0]).slice(0, 4);
      const addressData = decodeAddress(targetAddress);
      const bufferAddressData = Buffer.from(addressData);
      const chanIdData = Buffer.from([1]).slice(0, 1);

      const data = Buffer.concat([
        methodData,
        amountData,
        addressLengthData,
        bufferAddressData,
        chanIdData,
      ]);
      // console.log('sdfsdfsdf', u8aToHex(data));

      const connection = new Connection(getSolanaRestRpc(), {
        wsEndpoint: getSolanaWsRpc(),
        commitment: "singleGossip",
      });

      const bridgeAccountPubKey = new PublicKey(getSPLBridgeConfig().bridge);
      // const bridgeAccountInfo = await connection.getParsedAccountInfo(bridgeAccountPubKey);

      const instruction = new TransactionInstruction({
        keys: [
          // bridge account
          { pubkey: bridgeAccountPubKey, isSigner: false, isWritable: true },
          // fee payer
          { pubkey: solana.publicKey, isSigner: true, isWritable: false },
          // token mint account
          {
            pubkey: new PublicKey(splTokenAddress),
            isSigner: false,
            isWritable: true,
          },
          // from account
          { pubkey: tokenAccountPubkey, isSigner: false, isWritable: true },
          // fee receiver
          {
            pubkey: new PublicKey(getSPLBridgeConfig().feeReceiver),
            isSigner: false,
            isWritable: true,
          },
          // token program id
          {
            pubkey: new PublicKey(getSPLBridgeConfig().tokenProgramId),
            isSigner: false,
            isWritable: false,
          },
          // system program
          {
            pubkey: new PublicKey(getSPLBridgeConfig().systemProgramId),
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: new PublicKey(getSPLBridgeConfig().bridgeProgramId),
        data: data,
      });
      transaction.add(instruction);

      let { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      transaction.feePayer = solana.publicKey;

      let signed = await solana.signTransaction(transaction);
      let txid = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: true,
      });
      const result = await connection.confirmTransaction(txid);
      // console.log("txid", txid);

      // console.log('slp bridge swap result:', result);

      if (result.value && result.value.err === null) {
        cb && cb({});
        dispatch(setIsLoading(false));

        const newNotice: LocalNotice = {
          id: noticeUuid,
          type: "rBridge Swap",
          txDetail: {
            transactionHash: txid,
            sender: solAddress,
          },
          data: {
            tokenName: tokenStr,
            amount: Number(tokenAmount) + "",
            srcTokenStandard: TokenStandard.SPL,
            dstTokenStandard,
            targetAddress: targetAddress,
          },
          scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
          status: "Pending",
        };
        dispatch(addNotice(newNotice));

        dispatch(
          setBridgeSwapLoadingParams({
            modalVisible: true,
            tokenName: tokenStr,
            swapAmount: tokenAmount,
            srcTokenStandard: TokenStandard.SPL,
            dstTokenStandard: dstTokenStandard,
            status: "loading",
            scanUrl: getBridgeSwapScanUrl(chainId, targetAddress),
          })
        );

        dispatch(
          checkSwapStatus(
            dstTokenStandard,
            tokenStr,
            tokenType,
            tokenAmount,
            targetAddress,
            (status) => {
              if (status === "success") {
                dispatch(
                  setBridgeSwapLoadingParams({
                    status: "success",
                  })
                );

                dispatch(updateNotice(noticeUuid, { status: "Confirmed" }));
              } else if (status === "pending") {
              }
            }
          )
        );
      } else {
        console.log("result", result);
        throw new Error("failed");
      }
    } catch (error) {
      console.log("error", error);
      dispatch(setIsLoading(false));
    } finally {
      dispatch(setIsLoading(false));
    }
  };

export const checkSwapStatus =
  (
    dstTokenStandard: TokenStandard,
    tokenStr: TokenName | RTokenName,
    tokenType: TokenType,
    tokenAmount: any,
    targetAddress: string,
    cb?: (status: string) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    const chainId =
      dstTokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : dstTokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : dstTokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : dstTokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1;

    const { tokenAbi, tokenAddress } = getTokenAbiAndAddress(
      chainId,
      tokenType
    );
    let oldBalance: string | undefined = "0";
    if (chainId === ChainId.BSC) {
      oldBalance = await getBep20AssetBalance(
        targetAddress,
        tokenAbi,
        tokenAddress
      );
    } else if (chainId === ChainId.ETH) {
      oldBalance = await getErc20AssetBalance(
        targetAddress,
        tokenAbi,
        tokenAddress,
        tokenStr
      );
    } else if (chainId === ChainId.STAFI) {
      if (tokenType === TokenType.FIS) {
        oldBalance = (await getNativeFisBalance(targetAddress)) || "0";
      } else {
        oldBalance = await getNativeRTokenBalance(
          targetAddress,
          getTokenSymbolFromTokenType(tokenType)
        );
      }
    } else if (chainId === ChainId.SOL) {
      oldBalance = await getSplAssetBalance(targetAddress, tokenStr);
    }

    let count = 0;
    while (true) {
      let newBalance: string | undefined = "0";
      if (chainId === ChainId.BSC) {
        newBalance = await getBep20AssetBalance(
          targetAddress,
          tokenAbi,
          tokenAddress
        );
      } else if (chainId === ChainId.ETH) {
        newBalance = await getErc20AssetBalance(
          targetAddress,
          tokenAbi,
          tokenAddress,
          tokenStr
        );
      } else if (chainId === ChainId.STAFI) {
        if (tokenType === TokenType.FIS) {
          newBalance = (await getNativeFisBalance(targetAddress)) || "0";
        } else {
          newBalance = await getNativeRTokenBalance(
            targetAddress,
            getTokenSymbolFromTokenType(tokenType)
          );
        }
      } else if (chainId === ChainId.SOL) {
        newBalance = await getSplAssetBalance(targetAddress, tokenStr);
      }

      // console.log("newBalance", newBalance, targetAddress, tokenStr);

      if (
        Number(newBalance) - Number(oldBalance) <= Number(tokenAmount) * 1.1 &&
        Number(newBalance) - Number(oldBalance) >= Number(tokenAmount) * 0.9
      ) {
        await timeout(1000);
        cb && cb("success");
        break;
      }
      count++;
      await timeout(3000);

      if (count > 100) {
        cb && cb("pending");
        break;
      }
    }
  };

const getTokenAbiAndAddress = (chainId: ChainId, tokenType: TokenType) => {
  let tokenAbi: any = "";
  let tokenAddress: any = "";
  if (chainId === ChainId.BSC) {
    if (tokenType === TokenType.FIS) {
      tokenAbi = getBep20FisTokenAbi();
      tokenAddress = getBep20TokenContractConfig().FIS;
    } else if (tokenType === TokenType.rETH) {
      tokenAbi = getBep20REthTokenAbi();
      tokenAddress = getBep20TokenContractConfig().rETH;
    } else if (tokenType === TokenType.rMATIC) {
      tokenAbi = getBSCRMaticAbi();
      tokenAddress = getBep20TokenContractConfig().rMATIC;
    } else if (tokenType === TokenType.rKSM) {
      tokenAbi = getBep20RKsmTokenAbi();
      tokenAddress = getBep20TokenContractConfig().rKSM;
    } else if (tokenType === TokenType.rDOT) {
      tokenAbi = getBep20RDotTokenAbi();
      tokenAddress = getBep20TokenContractConfig().rDOT;
    }
  } else if (chainId === ChainId.ETH) {
    if (tokenType === TokenType.FIS) {
      tokenAbi = getErc20FisTokenAbi();
      tokenAddress = getErc20TokenContractConfig().FIS;
    } else if (tokenType === TokenType.rETH) {
      tokenAbi = getErc20REthTokenAbi();
      tokenAddress = getErc20TokenContractConfig().rETH;
    } else if (tokenType === TokenType.rMATIC) {
      tokenAbi = getERCMaticAbi();
      tokenAddress = getErc20TokenContractConfig().rMATIC;
    } else if (tokenType === TokenType.rKSM) {
      tokenAbi = getErc20RKsmTokenAbi();
      tokenAddress = getErc20TokenContractConfig().rKSM;
    } else if (tokenType === TokenType.rDOT) {
      tokenAbi = getErc20RDotTokenAbi();
      tokenAddress = getErc20TokenContractConfig().rDOT;
    }
  }

  return { tokenAbi, tokenAddress };
};

/**
 * query bridge fee collection from staking portal contract
 */
export const queryBridgeFee =
  (tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      const web3 = createWeb3(window.ethereum);
      const metaMaskAccount = getState().wallet.metaMaskAccount;

      let portalAbi = getMaticStakePortalAbi();
      let portalAddress = getMaticStakePortalAddress();

      if (tokenName === TokenName.BNB) {
        portalAbi = getBnbStakePortalAbi();
        portalAddress = getBnbStakePortalAddress();
      }

      const portalContract = new web3.eth.Contract(portalAbi, portalAddress, {
        from: metaMaskAccount,
      });

      const erc20BridgeFeeResult = await portalContract.methods
        .bridgeFee(ChainId.ETH)
        .call();
      let erc20BridgeFee = "--";
      if (!isNaN(Number(erc20BridgeFeeResult))) {
        erc20BridgeFee = web3.utils.fromWei(erc20BridgeFeeResult);
      }

      const bep20BridgeFeeResult = await portalContract.methods
        .bridgeFee(ChainId.BSC)
        .call();
      let bep20BridgeFee = "--";
      if (!isNaN(Number(bep20BridgeFeeResult))) {
        bep20BridgeFee = web3.utils.fromWei(bep20BridgeFeeResult);
      }

      const bridgeFeeStore = getState().bridge.bridgeFeeStore;
      const newValue = {
        ...bridgeFeeStore,
        [TokenStandard.ERC20]: {
          ...bridgeFeeStore.ERC20,
          [tokenName]: erc20BridgeFee,
        },
        [TokenStandard.BEP20]: {
          ...bridgeFeeStore.BEP20,
          [tokenName]: bep20BridgeFee,
        },
      };

      dispatch(setBridgeFeeStore(newValue));
    } catch (err: any) {
      console.error(err);
    }
  };
