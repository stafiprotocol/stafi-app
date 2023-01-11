import { Dialog, DialogContent } from "@mui/material";
import classNames from "classnames";
import { BubblesLoading } from "components/common/BubblesLoading";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { CustomInput } from "components/common/CustomInput";
import { CustomNumberInput } from "components/common/CustomNumberInput";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { BridgeTokenSelector } from "components/rbridge/BridgeTokenSelector";
import { BridgeTokenStandardSelector } from "components/rbridge/BridgeTokenStandardSelector";
import { getMetamaskBscChainId, getMetamaskEthChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useAppSlice } from "hooks/selector";
import { useFisBalance } from "hooks/useFisBalance";
import { useMetaMaskBalance } from "hooks/useMetaMaskBalance";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useTokenPrice } from "hooks/useTokenPrice";
import { useWalletAccount } from "hooks/useWalletAccount";
import {
  ChainId,
  RTokenName,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import Image from "next/image";
import modalBg from "public/rBridge/rBridge_bg.png";
import swapLine from "public/rBridge/swap_line.png";
import whiteLight from "public/rBridge/white_light.svg";
import whiteLightWrapper from "public/rBridge/white_light_wrapper.svg";
import userAvatar from "public/userAvatar.svg";
import { useEffect, useMemo, useState } from "react";
import { setIsLoading } from "redux/reducers/AppSlice";
import {
  bep20ToOtherSwap,
  erc20ToOtherSwap,
  getBridgeEstimateBscFee,
  getBridgeEstimateEthFee,
  getBridgeEstimateSolFee,
  nativeToOtherSwap,
  queryBridgeFees,
  setBridgeModalVisible,
  setBridgePresetParams,
  splToOtherSwap,
} from "redux/reducers/BridgeSlice";
import {
  connectMetaMask,
  connectPhantom,
  connectPolkadotJs,
} from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";
import { stafiServer } from "servers/stafi";
import { isEmptyValue, isUnsupportedBridgePair, openLink } from "utils/common";
import { getTokenStandardIcon } from "utils/icon";
import { chainAmountToHuman, formatNumber } from "utils/number";
import { getTokenType, rTokenNameToTokenName } from "utils/rToken";
import snackbarUtil from "utils/snackbarUtils";
import {
  createSolanaTokenAccount,
  getSolanaTokenAccountPubkey,
} from "utils/solanaUtils";
import { getShortAddress } from "utils/string";
import {
  validateETHAddress,
  validateSolanaAddress,
  validateSS58Address,
} from "utils/validator";

export const RBridgeModal = () => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const {
    bridgeModalVisible,
    bridgePresetParams,
    bridgeSwapLoadingParams,
    erc20BridgeFee,
    bep20BridgeFee,
    solBridgeFee,
  } = useAppSelector((state: RootState) => {
    return {
      bridgeModalVisible: state.bridge.bridgeModalVisible,
      bridgePresetParams: state.bridge.bridgePresetParams,
      bridgeSwapLoadingParams: state.bridge.bridgeSwapLoadingParams,
      erc20BridgeFee: state.bridge.erc20BridgeFee,
      bep20BridgeFee: state.bridge.bep20BridgeFee,
      solBridgeFee: state.bridge.solBridgeFee,
    };
  });
  const { isLoading } = useAppSlice();
  const {
    polkadotAccount,
    metaMaskAccount,
    solanaAccount,
    polkadotBalance,
    solanaBalance,
  } = useWalletAccount();
  const { ethBalance, bnbBalance } = useMetaMaskBalance();

  const [srcTokenStandard, setSrcTokenStandard] = useState<
    TokenStandard | undefined
  >(TokenStandard.Native);
  const [dstTokenStandard, setDstTokenStandard] = useState<
    TokenStandard | undefined
  >(TokenStandard.ERC20);
  const [selectedTokenName, setSelectedTokenName] = useState<
    TokenName.FIS | RTokenName | undefined
  >(TokenName.FIS);
  const [expandUserAddress, setExpandUserAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [targetAddress, setTargetAddress] = useState<string | undefined>();
  const [swapAmount, setSwapAmount] = useState("");
  const [fisTxFee, setFisTxFee] = useState("");
  const [needCreateSplTokenAccount, setNeedCreateSplTokenAccount] =
    useState(false);

  const selectedTokenPrice = useTokenPrice(selectedTokenName);
  const fisBalance = useFisBalance(srcTokenStandard);
  const rTokenBalance = useRTokenBalance(
    srcTokenStandard,
    rTokenNameToTokenName(
      selectedTokenName === TokenName.FIS ? RTokenName.rFIS : selectedTokenName
    ),
    true
  );

  useEffect(() => {
    setSwapAmount("");
  }, [selectedTokenName, bridgeModalVisible]);

  useEffect(() => {
    if (bridgeModalVisible && bridgePresetParams) {
      setSrcTokenStandard(bridgePresetParams.srcTokenStandard);
      setDstTokenStandard(bridgePresetParams.dstTokenStandard);
      setSelectedTokenName(bridgePresetParams.tokenName);
      dispatch(setBridgePresetParams(undefined));
    }
  }, [dispatch, bridgeModalVisible, bridgePresetParams]);

  useEffect(() => {
    (async () => {
      if (polkadotAccount && !isNaN(Number(polkadotBalance))) {
        try {
          const api = await stafiServer.createStafiApi();
          const tx = await api.tx.bridgeSwap.transferNative(
            polkadotBalance,
            "",
            !dstTokenStandard
              ? ChainId.STAFI
              : dstTokenStandard === TokenStandard.SPL
              ? ChainId.SOL
              : dstTokenStandard === TokenStandard.ERC20
              ? ChainId.ETH
              : dstTokenStandard === TokenStandard.BEP20
              ? ChainId.BSC
              : ChainId.STAFI
          );
          const paymentInfo = await tx.paymentInfo(polkadotAccount);
          const fisFee = chainAmountToHuman(
            paymentInfo.partialFee.toJSON(),
            TokenSymbol.FIS
          );
          // console.log("fisFee", fisFee);
          setFisTxFee(fisFee.toString());
        } catch (err: unknown) {}
      }
    })();
  }, [polkadotAccount, polkadotBalance, dstTokenStandard]);

  const srcSelectionList = useMemo(() => {
    return [
      TokenStandard.Native,
      TokenStandard.ERC20,
      TokenStandard.BEP20,
      TokenStandard.SPL,
    ];
  }, []);

  const dstSelectionList = useMemo(() => {
    return [
      TokenStandard.Native,
      TokenStandard.ERC20,
      TokenStandard.BEP20,
      TokenStandard.SPL,
    ];
  }, []);

  const tokenList: (TokenName.FIS | RTokenName)[] = useMemo(() => {
    if (isUnsupportedBridgePair(srcTokenStandard, dstTokenStandard)) {
      return [];
    }
    if (
      srcTokenStandard === TokenStandard.BEP20 ||
      dstTokenStandard === TokenStandard.BEP20
    ) {
      return [
        RTokenName.rFIS,
        RTokenName.rETH,
        RTokenName.rBNB,
        RTokenName.rMATIC,
        RTokenName.rKSM,
        RTokenName.rDOT,
      ];
    }
    if (
      srcTokenStandard === TokenStandard.SPL ||
      dstTokenStandard === TokenStandard.SPL
    ) {
      return [TokenName.FIS, RTokenName.rSOL];
    }
    return [
      TokenName.FIS,
      RTokenName.rFIS,
      RTokenName.rETH,
      RTokenName.rMATIC,
      RTokenName.rKSM,
      RTokenName.rDOT,
    ];
  }, [srcTokenStandard, dstTokenStandard]);

  /**
   * Check SPL Token Account status.
   */
  useEffect(() => {
    if (
      dstTokenStandard !== TokenStandard.SPL ||
      !selectedTokenName ||
      !targetAddress
    ) {
      setNeedCreateSplTokenAccount(false);
    }

    (async () => {
      const pubkey = await getSolanaTokenAccountPubkey(
        targetAddress,
        getTokenType(selectedTokenName)
      );
      setNeedCreateSplTokenAccount(!pubkey);
    })();
  }, [dstTokenStandard, selectedTokenName, targetAddress]);

  const fee: { amount: string; tokenName: string } = useMemo(() => {
    if (!srcTokenStandard) {
      return {
        amount: "--",
        tokenName: "",
      };
    }
    if (srcTokenStandard === TokenStandard.Native) {
      return {
        amount:
          dstTokenStandard === TokenStandard.ERC20
            ? erc20BridgeFee
            : dstTokenStandard === TokenStandard.SPL
            ? solBridgeFee
            : bep20BridgeFee,
        tokenName: "FIS",
      };
    } else if (srcTokenStandard === TokenStandard.ERC20) {
      return {
        amount: getBridgeEstimateEthFee(),
        tokenName: "ETH",
      };
    } else if (srcTokenStandard === TokenStandard.BEP20) {
      return {
        amount: getBridgeEstimateBscFee(),
        tokenName: "BNB",
      };
    } else if (srcTokenStandard === TokenStandard.SPL) {
      return {
        amount: getBridgeEstimateSolFee(),
        tokenName: "SOL",
      };
    }
    return {
      amount: "--",
      tokenName: "FIS",
    };
  }, [
    srcTokenStandard,
    dstTokenStandard,
    erc20BridgeFee,
    bep20BridgeFee,
    solBridgeFee,
  ]);

  const balance = useMemo(() => {
    if (
      selectedTokenName === TokenName.FIS &&
      srcTokenStandard === TokenStandard.Native
    ) {
      if (
        isNaN(Number(fisBalance)) ||
        isNaN(Number(fisTxFee)) ||
        isNaN(Number(fee.amount))
      ) {
        return "--";
      }
      return (
        Math.max(
          0,
          Number(fisBalance) - Number(fisTxFee) - Number(fee.amount)
        ) + ""
      );
    }
    return selectedTokenName === TokenName.FIS ? fisBalance : rTokenBalance;
  }, [
    selectedTokenName,
    fisBalance,
    rTokenBalance,
    srcTokenStandard,
    fee,
    fisTxFee,
  ]);

  useEffect(() => {
    dispatch(queryBridgeFees());
  }, [dispatch]);

  useEffect(() => {
    if (dstTokenStandard === TokenStandard.Native) {
      setTargetAddress(polkadotAccount);
    } else if (
      dstTokenStandard === TokenStandard.ERC20 ||
      dstTokenStandard === TokenStandard.BEP20
    ) {
      setTargetAddress(metaMaskAccount);
    } else if (dstTokenStandard === TokenStandard.SPL) {
      setTargetAddress(solanaAccount);
    } else {
      setTargetAddress("");
    }
  }, [dstTokenStandard, polkadotAccount, metaMaskAccount, solanaAccount]);

  useEffect(() => {
    if (srcTokenStandard === TokenStandard.SPL) {
      setDstTokenStandard(TokenStandard.Native);
    }
  }, [srcTokenStandard]);

  useEffect(() => {
    if (dstTokenStandard === TokenStandard.SPL) {
      setSrcTokenStandard(TokenStandard.Native);
    }
  }, [dstTokenStandard]);

  useEffect(() => {
    setSwapAmount("");
  }, [srcTokenStandard]);

  useEffect(() => {
    if (
      srcTokenStandard === TokenStandard.BEP20 ||
      dstTokenStandard === TokenStandard.BEP20
    ) {
      if (selectedTokenName === TokenName.FIS) {
        setSelectedTokenName(RTokenName.rFIS);
      }
    }
    if (
      srcTokenStandard === TokenStandard.SPL ||
      dstTokenStandard === TokenStandard.SPL
    ) {
      if (
        selectedTokenName !== TokenName.FIS &&
        selectedTokenName !== RTokenName.rSOL
      ) {
        setSelectedTokenName(TokenName.FIS);
      }
    }
    if (isUnsupportedBridgePair(srcTokenStandard, dstTokenStandard)) {
      setSelectedTokenName(undefined);
    }
  }, [srcTokenStandard, dstTokenStandard, selectedTokenName]);

  const userAddress = useMemo(() => {
    if (srcTokenStandard === TokenStandard.Native) {
      return polkadotAccount;
    } else if (
      srcTokenStandard === TokenStandard.ERC20 ||
      srcTokenStandard === TokenStandard.BEP20
    ) {
      return metaMaskAccount;
    } else if (srcTokenStandard === TokenStandard.SPL) {
      return solanaAccount;
    }
    return "";
  }, [srcTokenStandard, metaMaskAccount, polkadotAccount, solanaAccount]);

  const addressCorrect = useMemo(() => {
    if (!targetAddress) {
      return false;
    }
    if (dstTokenStandard === TokenStandard.Native) {
      return validateSS58Address(targetAddress);
    } else if (
      dstTokenStandard === TokenStandard.ERC20 ||
      dstTokenStandard === TokenStandard.BEP20
    ) {
      return validateETHAddress(targetAddress);
    } else if (dstTokenStandard === TokenStandard.SPL) {
      return validateSolanaAddress(targetAddress);
    }
    return true;
  }, [targetAddress, dstTokenStandard]);

  const [buttonDisabled, buttonText]: [
    buttonDisabled: boolean,
    buttonText:
      | "Connect Wallet"
      | "Not Enough FIS Fee"
      | "Not Enough SOL Fee"
      | "Not Enough ETH Fee"
      | "Not Enough BNB Fee"
      | "Switch Network"
      | "Invalid Address"
      | "Create SPL Token Account"
      | "SPL Token Account Not Created"
      | "Swap"
      | "Input Swap Amount"
      | "Insufficient Balance"
  ] = useMemo(() => {
    if (srcTokenStandard === TokenStandard.Native) {
      if (!polkadotAccount) {
        return [false, "Connect Wallet"];
      }
      if (Number(fisBalance) < Number(fee.amount)) {
        return [true, "Not Enough FIS Fee"];
      }
    }

    if (srcTokenStandard === TokenStandard.SPL) {
      if (!solanaAccount) {
        return [false, "Connect Wallet"];
      }
      if (Number(solanaBalance) < Number(fee.amount)) {
        return [true, "Not Enough SOL Fee"];
      }
    }

    if (srcTokenStandard === TokenStandard.ERC20) {
      if (!metaMaskAccount) {
        return [false, "Connect Wallet"];
      }
      if (metaMaskChainId !== getMetamaskEthChainId()) {
        return [false, "Switch Network"];
      }
      if (Number(ethBalance) < Number(fee.amount)) {
        return [true, "Not Enough ETH Fee"];
      }
    }

    if (srcTokenStandard === TokenStandard.BEP20) {
      if (!metaMaskAccount) {
        return [false, "Connect Wallet"];
      }
      if (metaMaskChainId !== getMetamaskBscChainId()) {
        return [false, "Switch Network"];
      }
      if (Number(bnbBalance) < Number(fee.amount)) {
        return [true, "Not Enough BNB Fee"];
      }
    }

    if (dstTokenStandard === TokenStandard.Native) {
      if (!validateSS58Address(targetAddress)) {
        return [true, "Invalid Address"];
      }
    }

    if (
      dstTokenStandard === TokenStandard.ERC20 ||
      dstTokenStandard === TokenStandard.BEP20
    ) {
      if (!validateETHAddress(targetAddress)) {
        return [true, "Invalid Address"];
      }
    }

    if (dstTokenStandard === TokenStandard.SPL) {
      if (!validateSolanaAddress(targetAddress)) {
        return [true, "Invalid Address"];
      }
      if (needCreateSplTokenAccount) {
        if (targetAddress === solanaAccount) {
          return [false, "Create SPL Token Account"];
        } else {
          return [true, "SPL Token Account Not Created"];
        }
      }
    }

    if (
      !swapAmount ||
      !srcTokenStandard ||
      !dstTokenStandard ||
      !selectedTokenName
    ) {
      return [true, "Swap"];
    }

    if (
      isNaN(Number(swapAmount)) ||
      Number(swapAmount) === 0 ||
      isNaN(Number(balance))
    ) {
      return [true, "Input Swap Amount"];
    }

    if (
      !balance ||
      isNaN(Number(balance)) ||
      Number(balance) < Number(swapAmount)
    ) {
      return [true, "Insufficient Balance"];
    }

    if (!addressCorrect) {
      return [true, "Invalid Address"];
    }

    return [false, "Swap"];
  }, [
    balance,
    swapAmount,
    addressCorrect,
    srcTokenStandard,
    metaMaskChainId,
    metaMaskAccount,
    polkadotAccount,
    solanaAccount,
    dstTokenStandard,
    fee,
    fisBalance,
    selectedTokenName,
    ethBalance,
    bnbBalance,
    solanaBalance,
    needCreateSplTokenAccount,
    targetAddress,
  ]);

  const createSPLToken = async () => {
    dispatch(setIsLoading(true));
    const result = await createSolanaTokenAccount(
      targetAddress,
      getTokenType(selectedTokenName)
    );
    dispatch(setIsLoading(false));
    if (result) {
      setNeedCreateSplTokenAccount(false);
    }
  };

  const clickSwap = () => {
    if (
      !targetAddress ||
      !selectedTokenName ||
      !srcTokenStandard ||
      !dstTokenStandard
    ) {
      return;
    }

    if (bridgeSwapLoadingParams) {
      snackbarUtil.warning("A swap operation is on-going, please wait");
      return;
    }

    if (srcTokenStandard === TokenStandard.Native) {
      if (!polkadotAccount) {
        dispatch(connectPolkadotJs());
        return;
      }
    }

    if (srcTokenStandard === TokenStandard.SPL) {
      if (!solanaAccount) {
        dispatch(connectPhantom(false));
        return;
      }
    }

    if (srcTokenStandard === TokenStandard.ERC20) {
      if (!metaMaskAccount || metaMaskChainId !== getMetamaskEthChainId()) {
        dispatch(connectMetaMask(getMetamaskEthChainId()));
        return;
      }
    }

    if (srcTokenStandard === TokenStandard.BEP20) {
      if (!metaMaskAccount || metaMaskChainId !== getMetamaskBscChainId()) {
        dispatch(connectMetaMask(getMetamaskBscChainId()));
        return;
      }
    }

    if (dstTokenStandard === TokenStandard.SPL) {
      if (buttonText === "Create SPL Token Account") {
        createSPLToken();
        return;
      }
    }

    if (srcTokenStandard === TokenStandard.Native) {
      dispatch(
        nativeToOtherSwap(
          dstTokenStandard,
          selectedTokenName,
          getTokenType(selectedTokenName),
          swapAmount,
          targetAddress,
          () => {
            setSwapAmount("");
            dispatch(setBridgeModalVisible(false));
          }
        )
      );
    } else if (srcTokenStandard === TokenStandard.ERC20) {
      dispatch(
        erc20ToOtherSwap(
          dstTokenStandard,
          selectedTokenName,
          getTokenType(selectedTokenName),
          swapAmount,
          targetAddress,
          () => {
            setSwapAmount("");
          }
        )
      );
    } else if (srcTokenStandard === TokenStandard.BEP20) {
      dispatch(
        bep20ToOtherSwap(
          dstTokenStandard,
          selectedTokenName,
          getTokenType(selectedTokenName),
          swapAmount,
          targetAddress,
          () => {
            setSwapAmount("");
          }
        )
      );
    } else if (srcTokenStandard === TokenStandard.SPL) {
      dispatch(
        splToOtherSwap(
          dstTokenStandard,
          selectedTokenName,
          getTokenType(selectedTokenName),
          swapAmount,
          targetAddress,
          () => {
            setSwapAmount("");
          }
        )
      );
    }
  };

  const renderBalance = () => {
    if (!userAddress || !selectedTokenName) {
      return <div className="mt-[.15rem] text-white text-[.24rem]">--</div>;
    }
    return (
      <div className="mt-[.15rem] flex items-center">
        <Card background="rgba(25, 38, 52, 0.35)" borderColor="#1A2835">
          <div
            className="px-[.24rem] h-[.68rem] flex items-center justify-center cursor-pointer"
            onClick={() => {
              setExpandUserAddress(!expandUserAddress);
            }}
          >
            {expandUserAddress && (
              <div className="text-text2 text-[.24rem] mr-[.14rem]">
                {getShortAddress(userAddress, 5)}
              </div>
            )}

            <div className="w-[.28rem] h-[.28rem] relative">
              <Image src={userAvatar} alt="icon" layout="fill" />
            </div>
          </div>
        </Card>

        <div className="text-white text-[.24rem] ml-[.24rem] flex items-center">
          {isEmptyValue(balance) ? <BubblesLoading /> : formatNumber(balance)}

          <div className="ml-[.06rem]">{selectedTokenName}</div>
        </div>
      </div>
    );
  };

  const renderReceivingAddress = () => {
    if (!dstTokenStandard) {
      return <div className="mt-[.15rem] text-white text-[.24rem]">--</div>;
    }

    return (
      <div className="flex items-center mt-[.15rem]">
        {editAddress || !targetAddress ? (
          <div className="flex items-center">
            <Card
              background="rgba(25, 38, 52, 0.35)"
              borderColor="#1A2835"
              ml=".24rem"
            >
              <div className="h-[.68rem] w-[5.3rem] flex items-center px-[.24rem]">
                <CustomInput
                  fontSize=".18rem"
                  placeholder="Receiving Address"
                  value={targetAddress || ""}
                  handleValueChange={setTargetAddress}
                />
              </div>
            </Card>

            <div
              className="ml-[.32rem] cursor-pointer"
              onClick={() => {
                if (editAddress && addressCorrect) {
                  setEditAddress(false);
                }
              }}
            >
              <Icomoon
                icon="complete-outline"
                size=".38rem"
                color={addressCorrect ? "#00F3AB" : "#5B6872"}
              />
            </div>
          </div>
        ) : (
          <Card
            background="rgba(25, 38, 52, 0.35)"
            borderColor="#1A2835"
            ml=".24rem"
          >
            <div className="h-[.68rem] flex items-center px-[.24rem] text-white">
              <div>
                <MyTooltip
                  hideQuestionIcon
                  title={targetAddress || ""}
                  text={getShortAddress(targetAddress, 4) || ""}
                />
              </div>

              <div
                className="flex items-center ml-[.25rem] cursor-pointer"
                onClick={() => {
                  setEditAddress(true);
                }}
              >
                <Icomoon icon="edit" size=".26rem" color="#5B6872" />
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderSwapTokenValue = () => {
    if (!swapAmount || Number(swapAmount) === 0 || !selectedTokenName) {
      return undefined;
    }
    if (isNaN(Number(selectedTokenPrice))) {
      return <BubblesLoading />;
    }

    return (
      <div className="mt-[.1rem] text-text2 text-[.2rem]">
        ~ ${formatNumber(Number(selectedTokenPrice) * Number(swapAmount))}
      </div>
    );
  };

  return (
    <Dialog
      open={bridgeModalVisible}
      onClose={() => {
        dispatch(setBridgeModalVisible(false));
      }}
      scroll="body"
      sx={{
        borderRadius: "0.16rem",
        "& .MuiDialog-container": {
          padding: "0",
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "14.88rem", // Set your width here
            backgroundColor: "transparent",
            padding: "0",
          },
          "& .MuiDialogContent-root": {
            padding: "0",
            width: "14.88rem",
          },
        },
      }}
    >
      <DialogContent>
        <div className="flex justify-center">
          <div className="w-[2.88rem] h-[2.88rem] flex items-center justify-center relative z-10">
            <div className="w-[2.88rem] h-[2.88rem] relative opacity-50">
              <Image src={whiteLightWrapper} layout="fill" alt="wrapper" />
            </div>

            <div className="w-[1rem] h-[1rem] absolute top-[.94rem] left-[.94rem]">
              <Image src={whiteLight} layout="fill" alt="wrapper" />
            </div>
          </div>
        </div>

        <Card background="#0A131B" className="max-h-full" mt="-2rem">
          <div className="flex flex-col items-stretch px-[1rem] pb-[.6rem] relative overflow-hidden">
            <div className="absolute left-0 right-0 top-[0.15rem] w-[14.88rem] h-[4.5rem]">
              <Image src={modalBg} layout="fill" alt="bg" />
            </div>

            <div
              className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
              onClick={() => {
                dispatch(setBridgeModalVisible(false));
              }}
            >
              <Icomoon icon="close" size="0.24rem" color="#5B6872" />
            </div>

            <div className="relative z-20">
              <div className="mt-[1rem] text-center text-white text-[.42rem] font-bold ">
                rBridge
              </div>

              <div className="flex items-center justify-center mt-[.1rem]">
                <BridgeTokenStandardSelector
                  isFrom
                  selectionList={srcSelectionList}
                  selectedStandard={srcTokenStandard}
                  onChange={(tokenStandard) => {
                    if (dstTokenStandard === tokenStandard) {
                      setDstTokenStandard(srcTokenStandard);
                    }
                    setSrcTokenStandard(tokenStandard);
                  }}
                />

                <div className="ml-[.24rem] w-[.84rem] h-[.84rem] relative">
                  {srcTokenStandard && (
                    <Image
                      src={getTokenStandardIcon(srcTokenStandard)}
                      layout="fill"
                      alt="icon"
                    />
                  )}
                </div>

                <div className="mx-[.24rem] w-[2.3rem] h-[.1rem] relative">
                  <Image src={swapLine} layout="fill" alt="icon" />
                </div>

                <div className="mr-[.24rem] w-[.84rem] h-[.84rem] relative">
                  {dstTokenStandard && (
                    <Image
                      src={getTokenStandardIcon(dstTokenStandard)}
                      layout="fill"
                      alt="icon"
                    />
                  )}
                </div>

                <BridgeTokenStandardSelector
                  isFrom={false}
                  selectionList={dstSelectionList}
                  selectedStandard={dstTokenStandard}
                  onChange={(tokenStandard) => {
                    if (srcTokenStandard === tokenStandard) {
                      setSrcTokenStandard(dstTokenStandard);
                    }
                    setDstTokenStandard(tokenStandard);
                  }}
                />
              </div>
            </div>

            <div className="mt-[.65rem] flex item-center justify-between relative z-20">
              <div className="flex flex-col">
                <div className="text-text1 text-[.24rem]">
                  Available to Swap:
                </div>

                {renderBalance()}
              </div>

              <div className="flex flex-col items-end">
                <div className="text-text1 text-[.24rem]">
                  <MyTooltip title="Receving Address" text="Receving Address" />
                </div>

                {renderReceivingAddress()}
              </div>
            </div>

            <Card background="#19263480" mt=".56rem">
              <div className="h-[1.3rem] relative z-20 flex items-center justify-between px-[.36rem]">
                <div className="flex items-center flex-1">
                  <BridgeTokenSelector
                    selectionList={tokenList}
                    srcTokenStandard={srcTokenStandard}
                    selectedTokenName={selectedTokenName}
                    onChange={setSelectedTokenName}
                  />

                  <div className="ml-[.4rem] flex-1">
                    <CustomNumberInput
                      fontSize=".36rem"
                      placeholder="Swap Amount"
                      value={swapAmount}
                      handleValueChange={setSwapAmount}
                    />

                    {renderSwapTokenValue()}
                  </div>
                </div>

                <div
                  className="ml-[.56rem] w-[1.35rem] h-[.67rem] bg-[#1A2835] rounded-[.16rem] flex items-center justify-center cursor-pointer text-white text-[.24rem]"
                  onClick={() => {
                    if (isNaN(Number(balance))) {
                      return;
                    }
                    let amount = Number(balance);
                    setSwapAmount(
                      formatNumber(amount.toString(), { toReadable: false })
                    );
                  }}
                >
                  Max
                </div>
              </div>
            </Card>

            <Button
              disabled={buttonDisabled}
              loading={isLoading}
              mt=".36rem"
              fontSize=".32rem"
              height="1.3rem"
              onClick={clickSwap}
            >
              {buttonText}
            </Button>

            <div className="mt-[.36rem] flex justify-end items-center text-[.24rem] pr-[.2rem]">
              <div className="text-text2">Estimate Fee:</div>
              <div className="text-text1 ml-[.4rem]">
                {fee.amount} {fee.tokenName}
              </div>
            </div>

            <div
              className={classNames(
                "self-center mt-[.8rem] text-[.24rem] flex items-center"
              )}
            >
              <div className="text-text2">Need FIS for Transaction?</div>
              <div
                className="ml-[.22rem] flex items-center text-primary cursor-pointer"
                onClick={() => {
                  openLink("https://app.stafi.io/feeStation");
                }}
              >
                <div className="mr-[.16rem]">Go FIS Station</div>
                <Icomoon icon="arrow-right" size=".26rem" color="#00F3AB" />
              </div>
            </div>

            <a
              className="self-center underline text-text2 text-[.24rem] mt-[.56rem]"
              target="_blank"
              href="https://docs.stafi.io/rtoken-app/rasset/swap-guide"
              rel="noreferrer"
            >
              rBridge Guide
            </a>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
