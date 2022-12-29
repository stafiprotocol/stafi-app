import { u8aToHex } from "@polkadot/util";
import { decodeAddress } from "@polkadot/util-crypto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isDev } from "config/env";
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
import { getStafiScanTxUrl } from "config/explorer";
import {
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
import { rSymbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import StafiServer from "servers/stafi";
import { stafiUuid } from "utils/common";
import { CANCELLED_MESSAGE } from "utils/constants";
import { LocalNotice } from "utils/notice";
import { numberToChain } from "utils/number";
import numberUtil from "utils/numberUtil";
import {
  getErc20BridgeResourceId,
  getTokenSymbolFromTokenType,
} from "utils/rToken";
import snackbarUtil from "utils/snackbarUtils";
import { createWeb3, getErc20Allowance } from "utils/web3Utils";
import { addNotice, setIsLoading } from "./AppSlice";

const stafiServer = new StafiServer();

export interface BridgeState {
  bridgeModalVisible: boolean;
  erc20BridgeFee: string;
  bep20BridgeFee: string;
  solBridgeFee: string;
  maticErc20BridgeFee: string;
  maticBep20BridgeFee: string;
  maticSolBridgeFee: string;
}

const initialState: BridgeState = {
  bridgeModalVisible: false,
  erc20BridgeFee: "--",
  bep20BridgeFee: "--",
  solBridgeFee: "--",
  maticErc20BridgeFee: "--",
  maticBep20BridgeFee: "--",
  maticSolBridgeFee: "--",
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
  },
});

export const {
  setBridgeModalVisible,
  setBep20BridgeFee,
  setErc20BridgeFee,
  setSolBridgeFee,
  setMaticErc20BridgeFee,
  setMaticBep20BridgeFee,
  setMaticSolBridgeFee,
} = bridgeSlice.actions;

export default bridgeSlice.reducer;

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
      // if (dstTokenStandard === TokenStandard.SPL) {
      //   txAddress = u8aToHex(new PublicKey(destAddress).toBytes());
      //   const tokenMintPublicKey = await solServer.getTokenAccountPubkey(destAddress, tokenType);
      //   if (!tokenMintPublicKey) {
      //     throw new Error('Please add the SPL token account first.');
      //   }
      //   txAddress = u8aToHex(tokenMintPublicKey.toBytes());
      // } else if (dstTokenStandard === STAFIHUB_CHAIN_ID) {
      //   const { words } = bech32.decode(destAddress);
      //   const hex = u8aToHex(new Uint8Array(bech32.fromWords(words)));
      //   txAddress = '0x' + hex.substr(2).toUpperCase();
      // }

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
                      scanUrl: getStafiScanTxUrl(txHash),
                      status: "Pending",
                    };
                    dispatch(addNotice(newNotice));
                    cb && cb();
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
    const memtaMaskAddress = getState().wallet.metaMaskAccount;
    const notice_uuid = stafiUuid();

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

    if (!memtaMaskAddress) {
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
      from: memtaMaskAddress,
    });

    allowance = await getErc20Allowance(
      memtaMaskAddress,
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
              from: memtaMaskAddress,
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
            .deposit(chainId, getErc20BridgeResourceId(tokenType), data)
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
            from: memtaMaskAddress,
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
          .deposit(chainId, getErc20BridgeResourceId(tokenType), data)
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

const getBridgeEstimateEthFee = () => {
  if (isDev()) {
    return "0.001000";
  } else {
    return "0.000020";
  }
};
