import { Dialog, DialogContent, Popover } from "@mui/material";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { setFisStationModalVisible } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import SettingsActiveLogo from "public/settings.svg";
import SettingsLogo from "public/settings_default.svg";
import FisStationBgImg from "public/fisStationBg.png";
import { Button } from "components/common/button";
import { useFisStationPoolInfo } from "hooks/useFisStationPoolInfo";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomNumberInput } from "components/common/CustomNumberInput";
import downIcon from "public/icon_down.png";
import ethLogo from "public/eth_type_green.svg";
import dotLogo from "public/dot_type_green.png";
import maticLogo from "public/matic_type_green.svg";
import ksmLogo from "public/ksm_type_green.png";
import atomLogo from "public/atom_type_green.svg";
import { TokenName } from "interfaces/common";
import { handleSwap, PoolInfoItem } from "redux/reducers/FisStationSlice";
import { useWalletAccount } from "hooks/useWalletAccount";
import { useKsmBalance } from "hooks/useKsmBalance";
import { useDotBalance } from "hooks/useDotBalance";
import { formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";
import { PriceItem } from "redux/reducers/RTokenSlice";

const FisStationModal = () => {
  const dispatch = useAppDispatch();

  const { fisStationModalVisible, priceList } = useAppSelector(
    (state: RootState) => {
      return {
        fisStationModalVisible: state.app.fisStationModalVisible,
        priceList: state.rToken.priceList,
      };
    }
  );

  const { swapLimit, poolInfoList } = useFisStationPoolInfo();

  const { polkadotBalance } = useWalletAccount();
  const ksmBalance = useKsmBalance();
  const dotBalance = useDotBalance();
  const { ethBalance, maticBalance } = useAppSelector((state: RootState) => {
    return {
      ethBalance: state.eth.balance,
      maticBalance: state.matic.balance,
    };
  });

  const [slippage, setSlippage] = useState<number>(0.5);
  const [swapTokenAmount, setSwapTokenAmount] = useState<string>("");
  const [swapFisAmount, setSwapFisAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<TokenName | undefined>(
    undefined
  );

  const selectedTokenBalance = useMemo(() => {
    if (selectedToken === TokenName.DOT) return dotBalance;
    if (selectedToken === TokenName.KSM) return ksmBalance;
    if (selectedToken === TokenName.ETH) return ethBalance;
    if (selectedToken === TokenName.MATIC) return maticBalance;
  }, [selectedToken]);

  const swapTokenAmountValue = useMemo(() => {
    const tokenPrice = priceList.find(
      (priceItem: PriceItem) => priceItem.symbol === selectedToken
    );
    if (!selectedToken || swapTokenAmount === "" || !tokenPrice) {
      return "--";
    }
    return Number(tokenPrice.price) * Number(swapTokenAmount);
  }, [swapTokenAmount, priceList, selectedToken]);

  const swapFisAmountValue = useMemo(() => {
    const fisPrice = priceList.find(
      (priceItem: PriceItem) => priceItem.symbol === TokenName.FIS
    );
    if (swapFisAmount === "" || !fisPrice) {
      return "--";
    }
    return Number(fisPrice.price) * Number(swapFisAmount);
  }, [swapFisAmount, priceList]);

  const onClose = () => {
    dispatch(setFisStationModalVisible(false));
  };

  const [buttonDisabled, buttonText] = useMemo(() => {
    return [false, "Swap"];
  }, []);

  const onClickSlippageAuto = () => {
    setSlippage(1);
  };

  const onChangeSwapTokenAmount = (value: string) => {
    setSwapTokenAmount(value);
    const currentPoolInfo = poolInfoList.find(
      (info: PoolInfoItem) => info.symbol === selectedToken
    );
    if (!currentPoolInfo || value === "") {
      setSwapFisAmount("");
      return;
    }
    const fisAmount =
      (Number(value) * Number(currentPoolInfo.swapRate)) / 1000000;
    setSwapFisAmount(numberUtil.handleFisRoundToFixed(fisAmount));
  };

  const onChangeSwapFisAmount = (value: string) => {
    setSwapFisAmount(value);
    const currentPoolInfo = poolInfoList.find(
      (info: PoolInfoItem) => info.symbol === selectedToken
    );
    if (!currentPoolInfo || value === "") {
      setSwapTokenAmount("");
      return;
    }
    const tokenAmount =
      (Number(value) * 1000000) / Number(currentPoolInfo.swapRate);
    setSwapTokenAmount(numberUtil.handleFisRoundToFixed(tokenAmount));
  };

  const onSelectTokenType = (tokenName: TokenName) => {
    setSelectedToken(tokenName);
    setSwapFisAmount("");
    setSwapTokenAmount("");
  };

  const onClickMaxTokenAmount = () => {
    const tokenBalance = selectedTokenBalance;
    if (tokenBalance) {
      onChangeSwapTokenAmount(
        formatNumber(tokenBalance, { toReadable: false })
      );
    }
  };

  const onClickSwap = () => {
    // dispatch(handleSwap(selectedToken, ))
  };

  const getTokenLogo = (tokenName: TokenName) => {
    if (tokenName === TokenName.DOT) return dotLogo;
    if (tokenName === TokenName.KSM) return ksmLogo;
    if (tokenName === TokenName.MATIC) return maticLogo;
    if (tokenName === TokenName.ETH) return ethLogo;
    if (tokenName === TokenName.ATOM) return atomLogo;
    return ethLogo;
  };

  const settingsPopUpState = usePopupState({
    variant: "popover",
    popupId: "settings",
  });

  const tokenTypePopUpState = usePopupState({
    variant: "popover",
    popupId: "tokenType",
  });

  useEffect(() => {
    if (!selectedToken && poolInfoList.length > 0) {
      setSelectedToken(poolInfoList[0].symbol);
    }
  }, [poolInfoList]);

  return (
    <Dialog
      open={fisStationModalVisible}
      onClose={onClose}
      scroll="body"
      sx={{
        borderRadius: "0.16rem",
        "& .MuiDialog-container": {
          padding: "0",
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "16.88rem", // Set your width here
            backgroundColor: "transparent",
            padding: "0",
          },
          "& .MuiDialogContent-root": {
            padding: "0",
            width: "16.88rem",
          },
        },
      }}
    >
      <DialogContent>
        <Card background="#0A131B" className="max-h-full">
          <div className="flex flex-col items-stretch px-[.56rem] pb-[1rem] relative">
            <div className="absolute top-0 left-0 w-full h-[3.4rem]">
              <Image src={FisStationBgImg} alt="fisStationBg" layout="fill" />
            </div>
            <div
              className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
              onClick={onClose}
            >
              <Icomoon icon="close" size="0.24rem" color="#5B6872" />
            </div>
            <div className="text-center mt-[1.06rem] text-white font-[700] text-[.42rem] z-10">
              FIS Station
            </div>
            <div
              className="w-[.28rem] h-[.28rem] absolute top-[2.63rem] right-[.78rem]"
              {...bindTrigger(settingsPopUpState)}
            >
              <Image src={SettingsLogo} alt="settings" layout="fill" />
            </div>

            <Popover
              {...bindPopover(settingsPopUpState)}
              transformOrigin={{
                horizontal: "center",
                vertical: "top",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              sx={{
                marginTop: ".1rem",
                "& .MuiPopover-paper": {
                  background: "rgba(9, 15, 23, 0.25)",
                  border: "1px solid #26494E",
                  backdropFilter: "blur(.4rem)",
                  borderRadius: ".16rem",
                  padding: ".2rem",
                  paddingBottom: ".56rem",
                },
                "& .MuiTypography-root": {
                  padding: "0px",
                },
              }}
            >
              <div className="mt-[.32rem] text-center text-[.2rem] text-text1">
                Settings
              </div>
              <div className="mt-[.21rem] text-text1">
                <MyTooltip text="Slippage" title="" color="#9DAFBE" />
              </div>
              <div className="flex mt-[.22rem] items-center">
                <div
                  className="w-[1.35rem] h-[.57rem] bg-[#1A2835] px-[.4rem] py-[.15rem] rounded-[.17rem] text-white cursor-pointer"
                  onClick={onClickSlippageAuto}
                >
                  Auto
                </div>
                <div
                  className="w-[3.47rem] h-[.68rem] ml-[.32rem] rounded-[.16rem] flex text-text2 items-center px-[.24rem]"
                  style={{
                    background: "rgba(25, 38, 52, 0.35)",
                  }}
                >
                  <CustomNumberInput
                    placeholder="Slippage"
                    value={slippage + ""}
                    handleValueChange={(value) => setSlippage(Number(value))}
                    fontSize=".24rem"
                  />
                  <div className="text-white text-[.24rem]">%</div>
                </div>
              </div>
            </Popover>

            <div className="mt-[2rem] relative">
              <div
                className="h-[1.5rem] rounded-[.32rem] flex relative"
                style={{
                  background: "rgba(25, 38, 52, 0.35)",
                }}
              >
                <div
                  className="rounded-[.16rem] w-[2.13rem] h-[.86rem] my-[.32rem] ml-[.36rem] flex items-center relative cursor-pointer"
                  style={{
                    background: "rgba(25, 38, 52, 0.35)",
                    border: "1px solid #1A2835",
                  }}
                  {...bindTrigger(tokenTypePopUpState)}
                >
                  {selectedToken && (
                    <>
                      <div className="relative w-[.36rem] h-[.36rem] ml-[.24rem]">
                        <Image src={getTokenLogo(selectedToken)} alt="logo" />
                      </div>
                      <div className="text-white text-[.24rem] ml-[.12rem]">
                        {selectedToken}
                      </div>
                    </>
                  )}
                  <div className="w-[.2rem] h-[.1rem] absolute right-[.28rem]">
                    <Image src={downIcon} layout="fill" alt="down" />
                  </div>
                </div>
                <div className="flex flex-col ml-[.55rem] h-full justify-center pt-[.21rem] min-w-[60%]">
                  <div className="font-[700]">
                    <CustomNumberInput
                      placeholder="Swap Amount"
                      value={swapTokenAmount}
                      handleValueChange={onChangeSwapTokenAmount}
                      fontSize=".36rem"
                    />
                  </div>
                  <div className="text-[.2rem] text-text2 mt-[.12rem]">
                    ~${formatNumber(swapTokenAmountValue)}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end h-full absolute right-[.36rem]">
                  <div
                    className="rounded-[.17rem] bg-[#1A2835] text-[.24rem] text-white w-[1.35rem] h-[.57rem] text-center pt-[.15rem] cursor-pointer"
                    onClick={onClickMaxTokenAmount}
                  >
                    Max
                  </div>
                  <div className="text-[.2rem] text-text2 mt-[.15rem]">
                    Balance:{" "}
                    {`${formatNumber(selectedTokenBalance)} ${selectedToken}`}
                  </div>
                </div>
              </div>

              <div
                className="w-[.92rem] h-[.72rem] rounded-[.32rem] absolute top-[1.26rem] flex justify-center items-center"
                style={{
                  border: "1px solid #1A2835",
                  background: "rgba(9, 15, 23, 0.35)",
                  left: "calc(50% - .46rem)",
                  backdropFilter: "blur(.4rem)",
                }}
              >
                <div className="w-[.2rem] h-[.1rem] relative">
                  <Image src={downIcon} layout="fill" alt="down" />
                </div>
              </div>

              <div
                className="h-[1.5rem] rounded-[.32rem] mt-[.24rem] flex relative"
                style={{
                  background: "rgba(25, 38, 52, 0.35)",
                }}
              >
                <div
                  className="rounded-[.16rem] w-[2.13rem] h-[.86rem] my-[.32rem] ml-[.36rem] flex items-center"
                  style={{
                    background: "rgba(25, 38, 52, 0.35)",
                    border: "1px solid #1A2835",
                  }}
                >
                  <div className="relative w-[.36rem] h-[.36rem] ml-[.24rem]">
                    <Image src={getTokenLogo(TokenName.ETH)} alt="logo" />
                  </div>
                  <div className="text-white text-[.24rem] ml-[.12rem]">
                    FIS
                  </div>
                </div>
                <div className="flex flex-col ml-[.55rem] h-full justify-center pt-[.21rem] min-w-[60%]">
                  <div className="font-[700]">
                    <CustomNumberInput
                      placeholder="Swap Amount"
                      value={swapFisAmount}
                      handleValueChange={onChangeSwapFisAmount}
                      fontSize=".36rem"
                    />
                  </div>
                  <div className="text-[.2rem] text-text2 mt-[.12rem]">
                    ~${formatNumber(swapFisAmountValue)}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end h-full absolute right-[.36rem]">
                  <div className="text-[.2rem] text-text2 mt-[.15rem]">
                    Balance: {formatNumber(polkadotBalance)} FIS
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[.56rem]">
              <Button radius=".32rem" disabled={buttonDisabled}>
                {buttonText}
              </Button>
            </div>

            <div className="mt-[.8rem] flex items-center justify-around">
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">You Will Receive</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">11</div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Exchange Rate</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">11</div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Transaction Cost</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">11</div>
              </div>
            </div>

            <Popover
              {...bindPopover(tokenTypePopUpState)}
              transformOrigin={{
                horizontal: "center",
                vertical: "top",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              sx={{
                marginTop: ".1rem",
                "& .MuiPopover-paper": {
                  background: "rgba(9, 15, 23, 0.25)",
                  border: "1px solid #26494E",
                  backdropFilter: "blur(.4rem)",
                  borderRadius: ".16rem",
                  padding: ".32rem .24rem",
                },
                "& .MuiTypography-root": {
                  padding: "0px",
                },
              }}
            >
              <div className="text-[.2rem] text-text1 mb-[.24rem]">
                Choose Token Type
              </div>
              {poolInfoList.map((info: PoolInfoItem, index: number) => (
                <div
                  className="flex justify-between h-[.76rem] items-center min-w-[4rem]"
                  style={{
                    borderBottom:
                      index === poolInfoList.length - 1
                        ? "none"
                        : "1px solid #26494E",
                  }}
                  onClick={() => onSelectTokenType(info.symbol)}
                >
                  <div className="flex items-center">
                    <div className="w-[.36rem] h-[.36rem] relative">
                      <Image
                        src={getTokenLogo(info.symbol)}
                        alt="tokenLogo"
                        layout="fill"
                      />
                    </div>
                    <div
                      className="text-[.24rem] ml-[.12rem]"
                      style={{
                        fontWeight:
                          info.symbol === selectedToken ? "700" : "400",
                        color:
                          info.symbol === selectedToken ? "#00F3AB" : "#9DAFBE",
                      }}
                    >
                      {info.symbol}
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div
                      className="text-[.18rem] mr-[.24rem]"
                      style={{
                        color:
                          info.symbol === selectedToken ? "#00F3AB" : "#9DAFBE",
                      }}
                    >
                      20
                    </div>
                    <div>
                      {info.symbol === selectedToken ? (
                        <Icomoon icon="active" size=".24rem" />
                      ) : (
                        <div className="border-[1px] border-solid rounded-full border-white/50 w-[.24rem] h-[.24rem]" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </Popover>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default FisStationModal;
