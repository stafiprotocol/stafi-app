import { Dialog, DialogContent } from "@mui/material";
import { BubblesLoading } from "components/common/BubblesLoading";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { CustomInput } from "components/common/CustomInput";
import { CustomNumberInput } from "components/common/CustomNumberInput";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { useAppDispatch } from "hooks/common";
import { useAppSlice } from "hooks/selector";
import { useEthGasPrice } from "hooks/useEthGasPrice";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { getBnbUnbondTxFees, unbondRBnb } from "redux/reducers/BnbSlice";
import { useRTokenRatio } from "hooks/useRTokenRatio";
import { useTokenPrice } from "hooks/useTokenPrice";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useTransactionCost } from "hooks/useTransactionCost";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard } from "interfaces/common";
import { bindPopover } from "material-ui-popup-state";
import { bindHover, usePopupState } from "material-ui-popup-state/hooks";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import Image from "next/image";
import bulb from "public/bulb.svg";
import ethIcon from "public/eth_type_green.svg";
import downIcon from "public/icon_down.png";
import maticBlackIcon from "public/matic_type_black.png";
import ksmBlackIcon from "public/ksm_type_black.png";
import dotBlackIcon from "public/dot_type_black.png";
import bnbBlackIcon from "public/bnb_type_black.png";
import rectangle from "public/rectangle_h.svg";
import userAvatar from "public/userAvatar.svg";
import { useContext, useEffect, useMemo, useState } from "react";
import { updateRefreshDataFlag } from "redux/reducers/AppSlice";
import { getDotUnbondTxFees, unstakeRDot } from "redux/reducers/DotSlice";
import { getKsmUnbondTxFees, unstakeRKsm } from "redux/reducers/KsmSlice";
import { getMaticUnbondTxFees, unbondRMatic } from "redux/reducers/MaticSlice";
import { updateRTokenBalance } from "redux/reducers/RTokenSlice";
import { isEmptyValue, openLink } from "utils/common";
import { formatLargeAmount, formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";
import { getRedeemDaysLeft } from "utils/rToken";
import { getShortAddress } from "utils/string";
import { validateETHAddress, validateSS58Address } from "utils/validator";
import Web3 from "web3";
import { RTokenRedeemLoadingSidebar } from "./RTokenRedeemLoadingSidebar";

interface RTokenRedeemModalProps {
  visible: boolean;
  tokenName: TokenName;
  defaultReceivingAddress: string | undefined;
  editAddressDisabled?: boolean;
  onClose: () => void;
  balance: string | undefined;
  onClickConnectWallet: () => void;
}

export const RTokenRedeemModal = (props: RTokenRedeemModalProps) => {
  const { walletType, isWrongMetaMaskNetwork, walletNotConnected } =
    useContext(MyLayoutContext);
  const dispatch = useAppDispatch();
  const {
    visible,
    tokenName,
    balance,
    defaultReceivingAddress,
    editAddressDisabled,
  } = props;
  const [editAddress, setEditAddress] = useState(false);
  const [targetAddress, setTargetAddress] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [expandUserAddress, setExpandUserAddress] = useState(false);

  const fisPrice = useTokenPrice("FIS");

  const tokenStandard = useTokenStandard(props.tokenName);

  const { unbondCommision, unbondFees, unbondTxFees } = useTransactionCost(
    tokenName,
    tokenStandard || TokenStandard.Native
  );
  const defaultTransactionFee = 0.0129;

  // const rTokenBalance = useRTokenBalance(tokenStandard, tokenName);
  const rTokenRatio = useRTokenRatio(tokenName);
  const ethGasPrice = useEthGasPrice();

  const { polkadotAccount, metaMaskAccount, polkadotBalance } =
    useWalletAccount();

  const commisionFee = useMemo(() => {
    if (
      isNaN(Number(unbondCommision)) ||
      isNaN(Number(redeemAmount)) ||
      Number(redeemAmount) === 0
    ) {
      return "--";
    }
    return Number(redeemAmount) * Number(unbondCommision);
  }, [redeemAmount, unbondCommision]);

  const userAddress = useMemo(() => {
    if (tokenStandard === TokenStandard.Native) {
      return polkadotAccount;
    } else if (
      tokenStandard === TokenStandard.BEP20 ||
      tokenStandard === TokenStandard.ERC20
    ) {
      return metaMaskAccount;
    }
    return metaMaskAccount;
  }, [polkadotAccount, tokenStandard, metaMaskAccount]);

  const willReceiveAmount = useMemo(() => {
    if (
      isNaN(Number(redeemAmount)) ||
      isNaN(Number(rTokenRatio)) ||
      Number(redeemAmount) === 0
    ) {
      return "--";
    }
    return Number(redeemAmount) * Number(rTokenRatio) + "";
  }, [redeemAmount, rTokenRatio]);

  const redeemFee = useMemo(() => {
    if (
      isNaN(Number(commisionFee)) ||
      isNaN(Number(rTokenRatio)) ||
      Number(commisionFee) === 0
    ) {
      return "--";
    }
    return Number(commisionFee) * Number(rTokenRatio) + "";
  }, [commisionFee, rTokenRatio]);

  const transactionCost = useMemo(() => {
    let txFee = unbondTxFees || defaultTransactionFee;
    if (isNaN(Number(txFee)) || isNaN(Number(unbondFees))) {
      return "--";
    }
    return Number(numberUtil.fisAmountToHuman(unbondFees)) + Number(txFee) + "";
  }, [unbondFees, unbondTxFees]);

  const transactionCostValue = useMemo(() => {
    if (isNaN(Number(transactionCost)) || isNaN(Number(fisPrice))) return "--";
    return Number(transactionCost) * Number(fisPrice) + "";
  }, [transactionCost, fisPrice]);

  const newTotalStakedAmount = useMemo(() => {
    // console.log(rTokenBalance, redeemAmount, rTokenRatio)
    if (
      isNaN(Number(balance)) ||
      isNaN(Number(redeemAmount)) ||
      isNaN(Number(rTokenRatio))
    ) {
      return "--";
    }
    return (Number(balance) - Number(redeemAmount)) * Number(rTokenRatio) + "";
  }, [balance, rTokenRatio, redeemAmount]);

  const { isLoading } = useAppSlice();

  const addressCorrect = useMemo(() => {
    if (tokenName === TokenName.KSM || tokenName === TokenName.DOT) {
      return validateSS58Address(targetAddress);
    }
    return validateETHAddress(targetAddress);
  }, [targetAddress, tokenName]);

  useEffect(() => {
    if (visible) {
      setTargetAddress(defaultReceivingAddress || "");
    }
  }, [visible, defaultReceivingAddress]);

  useEffect(() => {
    resetState();
  }, [visible]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (walletNotConnected) {
      return [false, "Connect Wallet"];
    }
    if (walletType === "MetaMask" && isWrongMetaMaskNetwork) {
      return [true, "Input Unstake Amount"];
    }
    if (isNaN(Number(balance))) {
      return [true, "Insufficient Balance"];
    }
    if (
      !redeemAmount ||
      isNaN(Number(redeemAmount)) ||
      Number(redeemAmount) === 0
    ) {
      return [true, "Input Unstake Amount"];
    }
    if (Number(redeemAmount) > Number(balance)) {
      return [true, `Not Enough r${tokenName} to Unstake`];
    }
    if (!addressCorrect) {
      return [true, "Invalid Receiving Address"];
    }
    if (
      (tokenName === TokenName.KSM || tokenName === TokenName.DOT) &&
      Number(polkadotBalance) < Number(transactionCost)
    ) {
      return [true, "Not Enough FIS for Fee"];
    }
    return [false, "Unstake"];
  }, [
    walletType,
    isWrongMetaMaskNetwork,
    balance,
    redeemAmount,
    addressCorrect,
    walletNotConnected,
    tokenName,
    polkadotBalance,
    transactionCost,
  ]);

  const estimateFee = useMemo(() => {
    let gasLimit = 146316;
    if (tokenName === TokenName.MATIC) {
      gasLimit = 36928;
    }
    if (tokenName === TokenName.ETH || tokenName === TokenName.MATIC) {
      if (isNaN(Number(ethGasPrice))) {
        return "--";
      }

      return Web3.utils.fromWei(
        Web3.utils.toBN(gasLimit).mul(Web3.utils.toBN(ethGasPrice)).toString(),
        "gwei"
      );
    }

    if (tokenName === TokenName.KSM || tokenName === TokenName.DOT) {
      return "0.005";
    }

    return "--";
  }, [ethGasPrice, tokenName]);

  const resetState = () => {
    setEditAddress(false);
    setRedeemAmount("");
  };

  const clickRedeem = () => {
    if (walletNotConnected) {
      props.onClickConnectWallet();
      return;
    }
    if (tokenName === TokenName.MATIC) {
      dispatch(
        unbondRMatic(
          redeemAmount,
          targetAddress,
          willReceiveAmount,
          newTotalStakedAmount,
          () => {
            dispatch(updateRTokenBalance(tokenStandard, props.tokenName));
            dispatch(updateRefreshDataFlag());
          }
        )
      );
    } else if (tokenName === TokenName.BNB) {
      dispatch(
        unbondRBnb(
          redeemAmount,
          targetAddress,
          willReceiveAmount,
          newTotalStakedAmount,
          () => {
            dispatch(updateRTokenBalance(tokenStandard, props.tokenName));
            dispatch(updateRefreshDataFlag());
          }
        )
      );
    } else if (tokenName === TokenName.KSM) {
      dispatch(
        unstakeRKsm(
          redeemAmount,
          targetAddress,
          willReceiveAmount,
          newTotalStakedAmount,
          () => {
            dispatch(updateRTokenBalance(tokenStandard, props.tokenName));
            dispatch(updateRefreshDataFlag());
          }
        )
      );
    } else if (tokenName === TokenName.DOT) {
      dispatch(
        unstakeRDot(
          redeemAmount,
          targetAddress,
          willReceiveAmount,
          newTotalStakedAmount,
          () => {
            dispatch(updateRTokenBalance(tokenStandard, props.tokenName));
            dispatch(updateRefreshDataFlag());
          }
        )
      );
    }
  };

  useEffect(() => {
    if (addressCorrect) {
      if (tokenName === TokenName.MATIC) {
        dispatch(getMaticUnbondTxFees(redeemAmount || "1", targetAddress));
      } else if (tokenName === TokenName.KSM) {
        dispatch(getKsmUnbondTxFees(redeemAmount || "1", targetAddress));
      } else if (tokenName === TokenName.DOT) {
        dispatch(getDotUnbondTxFees(redeemAmount || "1", targetAddress));
      } else if (tokenName === TokenName.BNB) {
        dispatch(getBnbUnbondTxFees("0.001", targetAddress));
      }
    }
  }, [dispatch, targetAddress, addressCorrect, redeemAmount, tokenName]);

  const txCostPopupState = usePopupState({
    variant: "popover",
    popupId: "txCost",
  });

  const getRedeemDaysTipLink = () => {
    if (tokenName === TokenName.MATIC) {
      return "https://docs.stafi.io/rtoken-app/rmatic-solution/rmatic-faq#4.what-should-be-noted-in-rmatic-redemption";
    }
		if (tokenName === TokenName.BNB) {
			return "https://docs.stafi.io/rtoken-app/rbnb-solution/rbnb-faq#4.whats-the-unbonding-period-of-rbnb";
		}
    return "";
  };

  const getLogo = () => {
    if (tokenName === TokenName.MATIC) {
      return maticBlackIcon;
    }
    if (tokenName === TokenName.KSM) {
      return ksmBlackIcon;
    }
    if (tokenName === TokenName.DOT) {
      return dotBlackIcon;
    }
    if (tokenName === TokenName.BNB) {
      return bnbBlackIcon;
    }
    return ethIcon;
  };

  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      scroll="body"
      sx={{
        borderRadius: "0.16rem",
        background: "transparent",
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
      <DialogContent sx={{ width: "14.88rem" }}>
        <Card mt=".56rem" mb=".56rem" background="#0A131B">
          <div className="flex flex-col items-stretch px-[.56rem] pb-[1rem] overflow-auto relative">
            <div className="self-center relative w-[2.4rem] h-[.9rem]">
              <Image src={rectangle} layout="fill" alt="rectangle" />
            </div>

            <div
              className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
              onClick={props.onClose}
            >
              <Icomoon icon="close" size="0.24rem" color="#5B6872" />
            </div>

            <div className="text-center mt-[0rem] text-white font-[700] text-[.42rem]">
              Unstake {tokenName}
            </div>

            <div className="mt-[.76rem] flex items-center justify-between">
              <div>
                <div className="text-text1 text-[.24rem]">
                  <MyTooltip
                    title={`The address that receives redeemed ${tokenName} tokens, ${tokenName} tokens will be sent to the receiving address after receiving the request of redemption around 9 days`}
                    text="Receiving Address"
                  />
                </div>

                <div className="flex mt-[.15rem] items-center">
                  {editAddress || !targetAddress ? (
                    <div className="flex items-center">
                      <Card
                        background="rgba(25, 38, 52, 0.35)"
                        borderColor="#1A2835"
                        ml="0.24rem"
                      >
                        <div className="h-[.68rem] w-[5.3rem] px-[.24rem] flex items-center">
                          <CustomInput
                            fontSize=".18rem"
                            placeholder="Receiving Address"
                            value={targetAddress}
                            handleValueChange={setTargetAddress}
                          />
                        </div>
                      </Card>
                      <div
                        className="ml-[.32rem] cursor-pointer"
                        onClick={() => {
                          if (editAddress || addressCorrect) {
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
                    >
                      <div className="h-[.68rem] flex items-center px-[.24rem] text-white">
                        <div>
                          <MyTooltip
                            hideQuestionIcon
                            title={targetAddress || ""}
                            text={getShortAddress(targetAddress, 4) || ""}
                          />
                        </div>

                        {!editAddressDisabled && (
                          <div
                            className="flex items-center ml-[.25rem] cursor-pointer"
                            onClick={() => {
                              setEditAddress(true);
                              // setTargetAddress("");
                            }}
                          >
                            <Icomoon
                              icon="edit"
                              size=".26rem"
                              color="#5B6872"
                            />
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-text1 text-[.24rem]">
                  Available to unstake:
                </div>

                <div className="mt-[.15rem] flex items-center">
                  <Card
                    background="rgba(25, 38, 52, 0.35)"
                    borderColor="#1A2835"
                  >
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

                  <div className="text-white text-[.24rem] ml-[.24rem]">
                    {isEmptyValue(balance) ? (
                      <BubblesLoading />
                    ) : (
                      <>
                        {formatNumber(balance, {
                          decimals: 6,
                          toReadable: false,
                        })}{" "}
                      </>
                    )}
                    r{tokenName}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-[.56rem] rounded-[.3rem] h-[.6rem] flex items-center justify-between px-[.3rem] border-solid border-[1px] border-warning/50">
              <div className="flex items-center">
                <div className="w-[.3rem] h-[.3rem] relative">
                  <Image src={bulb} alt="bulb" layout="fill" />
                </div>

                <div className="ml-[.16rem] text-[.2rem] text-warning">
                  Your unstake operation will take around{" "}
                  {getRedeemDaysLeft(tokenName)} days to completely finish.
                </div>
              </div>

              <div
                className="text-[.2rem] text-warning underline font-bold cursor-pointer"
                onClick={() => {
                  openLink(getRedeemDaysTipLink());
                }}
              >
                Learn More
              </div>
            </div>

            <Card
              mt=".38rem"
              background="rgba(25, 38, 52, 0.35)"
              borderColor="#1A2835"
              className="h-[1.3rem] flex items-center px-[.36rem]"
            >
              <div className="w-[.76rem] h-[.76rem] relative">
                <Image src={getLogo()} alt="icon" layout="fill" />
              </div>

              <div className="ml-[.35rem] text-text2 text-[.32rem]">
                r{props.tokenName}
              </div>

              <div className="flex-1 mx-[.34rem]">
                <CustomNumberInput
                  fontSize=".32rem"
                  placeholder="Unstake Amount"
                  value={redeemAmount}
                  handleValueChange={setRedeemAmount}
                />
              </div>

              <div
                className="w-[1.35rem] h-[.67rem] bg-[#1A2835] rounded-[.16rem] flex items-center justify-center cursor-pointer text-white text-[.24rem]"
                onClick={() => {
                  if (
                    isWrongMetaMaskNetwork ||
                    isNaN(Number(balance)) ||
                    isNaN(Number(estimateFee))
                  ) {
                    return;
                  }
                  setRedeemAmount(formatNumber(balance, { toReadable: false }));
                }}
              >
                Max
              </div>
            </Card>

            <Button
              disabled={buttonDisabled}
              loading={isLoading}
              mt=".36rem"
              fontSize=".32rem"
              height="1.3rem"
              onClick={clickRedeem}
            >
              {buttonText}
            </Button>

            <div className="mt-[.8rem] flex items-center justify-around">
              <div className="mx-[.28rem] flex flex-col items-center min-w-[2.2rem]">
                <div className="text-text2 text-[.24rem]">You Will Receive</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {formatLargeAmount(willReceiveAmount)} {tokenName}
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Exchange Rate</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {isEmptyValue(rTokenRatio) ? (
                    <BubblesLoading />
                  ) : (
                    <>{formatNumber(rTokenRatio, { decimals: 4 })}</>
                  )}{" "}
                  {tokenName} = 1 r{tokenName}
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Transcation Cost</div>
                <div
                  className="mt-[.15rem] text-text1 text-[.24rem] flex cursor-pointer"
                  {...bindHover(txCostPopupState)}
                  // onMouseEnter={}
                >
                  {isEmptyValue(transactionCost) ? (
                    <BubblesLoading />
                  ) : (
                    <>{formatNumber(transactionCost, { decimals: 4 })}</>
                  )}{" "}
                  FIS
                  <div className="w-[.19rem] h-[0.1rem] relative ml-[.19rem] self-center">
                    <Image src={downIcon} layout="fill" alt="down" />
                  </div>
                </div>

                <HoverPopover
                  {...bindPopover(txCostPopupState)}
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
                    },
                    "& .MuiTypography-root": {
                      padding: "0px",
                    },
                  }}
                >
                  <div className="text-text2">
                    <div className="flex justify-between">
                      <div>Relay Fee</div>
                      <div>
                        {isEmptyValue(unbondFees) ? (
                          <BubblesLoading />
                        ) : (
                          <>
                            {formatNumber(
                              numberUtil.fisAmountToHuman(unbondFees),
                              { decimals: 4 }
                            )}
                          </>
                        )}{" "}
                        FIS
                      </div>
                    </div>
                    <div className="flex justify-between my-[.18rem]">
                      <div>Transaction Fee</div>
                      <div>
                        {isEmptyValue(unbondTxFees) ? (
                          <BubblesLoading />
                        ) : (
                          <>{formatNumber(unbondTxFees, { decimals: 4 })}</>
                        )}{" "}
                        FIS
                      </div>
                    </div>
                    <div className="h-[1px] bg-text3 my-[.1rem]" />
                    <div className="text-text1">
                      Overall Transaction Cost: <span className="ml-[.1rem]" />{" "}
                      {isEmptyValue(transactionCost) ? (
                        <BubblesLoading />
                      ) : (
                        <>{formatNumber(transactionCost, { decimals: 4 })}</>
                      )}{" "}
                      FIS
                    </div>
                    <div className="mt-[.18rem] text-right">
                      ~$
                      {isEmptyValue(transactionCostValue) ? (
                        <BubblesLoading />
                      ) : (
                        <>
                          {formatNumber(transactionCostValue, { decimals: 4 })}
                        </>
                      )}
                    </div>
                  </div>
                </HoverPopover>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center min-w-[4.4rem]">
                <div className="text-text2 text-[.24rem]">
                  <MyTooltip
                    text="Unstake Fee"
                    title={`When users unstake the MATICs, StaFi protocol will charge 0.2% of the unstaked r${tokenName} tokens as a commission`}
                  />
                </div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {isEmptyValue(commisionFee) ? (
                    <BubblesLoading />
                  ) : (
                    <>
                      {formatLargeAmount(commisionFee)} r{tokenName} (~
                      {formatLargeAmount(redeemFee)} {tokenName})
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="self-center mt-[.8rem] text-[.24rem] flex items-center">
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
          </div>
        </Card>

        <RTokenRedeemLoadingSidebar />
      </DialogContent>
    </Dialog>
  );
};
