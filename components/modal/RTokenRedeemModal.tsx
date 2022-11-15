import { Dialog, DialogContent } from "@mui/material";
import { Card } from "components/common/card";
import { CustomInput } from "components/common/CustomInput";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { TokenStandardSelector } from "components/rtoken/TokenStandardSelector";
import { TokenName, TokenStandard } from "interfaces/common";
import Image from "next/image";
import rectangle from "public/rectangle_h.svg";
import ethIcon from "public/eth_type_green.svg";
import maticIcon from 'public/matic_type_green.svg';
import { useContext, useEffect, useMemo, useState } from "react";
import { CustomNumberInput } from "components/common/CustomNumberInput";
import { Button } from "components/common/button";
import { useAppDispatch } from "hooks/common";
import { handleEthTokenStake } from "redux/reducers/EthSlice";
import { formatNumber } from "utils/number";
import { MyLayoutContext } from "components/layout/layout";
import { getShortAddress } from "utils/string";
import { checkMetaMaskAddress, openLink } from "utils/common";
import { useAppSlice } from "hooks/selector";
import { updateRTokenBalance } from "redux/reducers/RTokenSlice";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useRTokenRatio } from "hooks/useRTokenRatio";
import { useRTokenStakerApr } from "hooks/useRTokenStakerApr";
import { useEthGasPrice } from "hooks/useEthGasPrice";
import Web3 from "web3";
import { handleMaticStake, unbondRMatic } from "redux/reducers/MaticSlice";

interface RTokenRedeemModalProps {
  visible: boolean;
  tokenName: TokenName;
  defaultReceivingAddress: string | undefined;
  editAddressDisabled?: boolean;
  onClose: () => void;
  balance: string;
}

export const RTokenRedeemModal = (props: RTokenRedeemModalProps) => {
  const { walletType, isWrongMetaMaskNetwork } = useContext(MyLayoutContext);
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

  const rTokenRatio = useRTokenRatio(tokenName);
  const rTokenStakerApr = useRTokenStakerApr(tokenName);
  const ethGasPrice = useEthGasPrice();

  const willReceiveAmount = useMemo(() => {
    if (
      isNaN(Number(redeemAmount)) ||
      isNaN(Number(rTokenRatio)) ||
      Number(redeemAmount) === 0
    ) {
      return "--";
    }
    return Number(redeemAmount) / Number(rTokenRatio) + "";
  }, [redeemAmount, rTokenRatio]);

  const { isLoading } = useAppSlice();

  const addressCorrect = useMemo(() => {
    if (tokenName === TokenName.ETH) {
      return checkMetaMaskAddress(targetAddress);
    }
    return true;
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
    if (walletType === "MetaMask" && isWrongMetaMaskNetwork) {
      return [true, "Redeem"];
    }
    if (!redeemAmount || Number(redeemAmount) === 0 || isNaN(Number(balance))) {
      return [true, "Redeem"];
    }
    if (Number(redeemAmount) > Number(balance)) {
      return [true, "Insufficient Balance"];
    }
    if (!addressCorrect) {
      return [true, "Invalid Receiving Address"];
    }
    return [false, "Redeem"];
  }, [
    walletType,
    isWrongMetaMaskNetwork,
    balance,
    redeemAmount,
    addressCorrect,
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

    return "--";
  }, [ethGasPrice, tokenName]);

  const resetState = () => {
    setEditAddress(false);
    setRedeemAmount("");
  };

  const clickRedeem = () => {
    if (tokenName === TokenName.MATIC) {
			dispatch(
				unbondRMatic(
					redeemAmount,
					targetAddress,
					() => {

					}
				)
			);
		}
  };

  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      scroll="paper"
      sx={{
        borderRadius: "0.16rem",
        background: "transparent",
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
              Redeem {tokenName}
            </div>

            <div className="mt-[.76rem] flex items-center justify-between">
              <div>
                <div className="text-text1 text-[.24rem]">
                  <MyTooltip title="Receive Address" text="Receive Address" />
                </div>

                <div className="flex mt-[.15rem]">
                  {editAddress || !targetAddress ? (
                    <div>
                      <Card
                        background="rgba(25, 38, 52, 0.35)"
                        borderColor="#1A2835"
												ml="0.24rem"
                      >
                        <div className="h-[.68rem] w-[5.3rem] px-[.24rem]">
                          <CustomInput
                            fontSize=".18rem"
                            placeholder="Receiving Address"
                            value={targetAddress}
                            handleValueChange={setTargetAddress}
                          />
                        </div>
                      </Card>
                      {addressCorrect && (
                        <div className="ml-[.32rem]">
                          <Icomoon
                            icon="complete-outline"
                            size=".38rem"
                            color="#00F3AB"
                          />
                        </div>
                      )}
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
                              setTargetAddress("");
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
                  Available to redeem:
                </div>

                <div className="mt-[.15rem] flex items-center">
                  <Card
                    background="rgba(25, 38, 52, 0.35)"
                    borderColor="#1A2835"
                  >
                    <div className="w-[.76rem] h-[.68rem] flex items-center justify-center">
                      <div className="w-[.28rem] h-[.28rem] relative">
                        <Image src={tokenName === TokenName.MATIC ? maticIcon : ethIcon} alt="icon" layout="fill" />
                      </div>
                    </div>
                  </Card>

                  <div className="text-white text-[.24rem] ml-[.24rem]">
                    {formatNumber(balance)} r{tokenName}
                  </div>
                </div>
              </div>
            </div>

            <Card
              mt=".76rem"
              background="rgba(25, 38, 52, 0.35)"
              borderColor="#1A2835"
              className="h-[1.3rem] flex items-center px-[.36rem]"
            >
              <div className="w-[.76rem] h-[.76rem] relative">
                <Image src={tokenName === TokenName.MATIC ? maticIcon : ethIcon} alt="icon" layout="fill" />
              </div>

              <div className="ml-[.35rem] text-text2 text-[.32rem]">r{props.tokenName}</div>

              <div className="flex-1 mx-[.34rem]">
                <CustomNumberInput
                  fontSize=".32rem"
                  placeholder="Redeem Amount"
                  value={redeemAmount}
                  handleValueChange={setRedeemAmount}
                />
              </div>

              <div
                className="w-[1.35rem] h-[.67rem] bg-[#1A2835] rounded-[.16rem] flex items-center justify-center cursor-pointer text-white text-[.24rem]"
                onClick={() => {
                  if (
                    false ||
                    isNaN(Number(balance)) ||
                    isNaN(Number(estimateFee))
                  ) {
                    return;
                  }
                  setRedeemAmount(
                    formatNumber(
                      Math.max(Number(balance) - Number(estimateFee), 0)
                    )
                  );
                }}
              >
                Max
              </div>
            </Card>

            <Button
              // disabled={buttonDisabled}
							disabled={false}
              loading={isLoading}
              mt=".36rem"
              fontSize=".32rem"
              height="1.3rem"
              onClick={clickRedeem}
            >
              {buttonText}
            </Button>

            <div className="mt-[.8rem] flex items-center justify-center">
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">You Will Receive</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {formatNumber(willReceiveAmount)} {tokenName}
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Exchange Rate</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {formatNumber(rTokenRatio, { decimals: 4 })} {tokenName} = 1 r
                  {tokenName}
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Transcation Cost</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  Est. {formatNumber(estimateFee)} ETH
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">
                  <MyTooltip text="Staking Reward" title="Staking Reward" />
                </div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {formatNumber(rTokenStakerApr, { decimals: 2 })}% Reward Fee
                  {/* + 463.2 FIS */}
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
      </DialogContent>
    </Dialog>
  );
};
