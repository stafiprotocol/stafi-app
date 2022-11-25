import { Dialog, DialogContent, Divider, Popover } from "@mui/material";
import { Card } from "components/common/card";
import { CustomInput } from "components/common/CustomInput";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { TokenStandardSelector } from "components/rtoken/TokenStandardSelector";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import Image from "next/image";
import rectangle from "public/rectangle_h.svg";
import ethIcon from "public/eth_type_green.svg";
import maticIcon from 'public/matic_type_green.svg';
import userAvatar from 'public/userAvatar.svg';
import maticBlackIcon from 'public/matic_type_black.svg';
import { useContext, useEffect, useMemo, useState } from "react";
import { CustomNumberInput } from "components/common/CustomNumberInput";
import { Button } from "components/common/button";
import { useAppDispatch, useAppSelector } from "hooks/common";
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
import { getMaticUnbondTxFees, unbondRMatic } from "redux/reducers/MaticSlice";
import { useWalletAccount } from "hooks/useWalletAccount";
import { RootState } from "redux/store";
import numberUtil from "utils/numberUtil";
import { useTransactionCost } from "hooks/useTransactionCost";
import downIcon from 'public/icon_down.png';
import { bindPopover } from "material-ui-popup-state";
import { bindHover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import { useTokenPrice } from "hooks/useTokenPrice";
import { rSymbol, Symbol } from "keyring/defaults";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { validateETHAddress } from "utils/validator";

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
	const [expandUserAddress, setExpandUserAddress] = useState(false);

	const fisPrice = useTokenPrice('FIS');

	const tokenStandard = useTokenStandard(props.tokenName);
 
	const { unbondCommision, unbondFees, unbondTxFees } = useTransactionCost();
	const defaultTransactionFee = 0.0129;

	const rTokenBalance = useRTokenBalance(tokenStandard, tokenName);
  const rTokenRatio = useRTokenRatio(tokenName);
  const rTokenStakerApr = useRTokenStakerApr(tokenName);
  const ethGasPrice = useEthGasPrice();

	const { metaMaskAccount } = useWalletAccount();

	const userAddress = useMemo(() => {
		if (walletType === WalletType.MetaMask) {
			return metaMaskAccount;
		}
		return '';
	}, [walletType, metaMaskAccount]);

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
			isNaN(Number(unbondCommision)) ||
			isNaN(Number(rTokenRatio)) ||
			Number(unbondCommision) === 0
		) {
			return '--';
		}
		return Number(unbondCommision) * Number(rTokenRatio) + '';
	}, [unbondCommision, rTokenRatio]);

	const transactionCost = useMemo(() => {
		let txFee = unbondTxFees || defaultTransactionFee;
		if (
			isNaN(Number(txFee)) ||
			isNaN(Number(unbondFees))
		) {
			return '--';
		}
		return Number(numberUtil.fisAmountToHuman(unbondFees)) + Number(txFee) + '';
	}, [unbondFees, unbondTxFees]);

	const transactionCostValue = useMemo(() => {
		if (
			isNaN(Number(transactionCost)) ||
			isNaN(Number(fisPrice))
		) return '--';
		return Number(transactionCost) * Number(fisPrice) + '';
	}, [transactionCost, fisPrice]);

	const newTotalStakedAmount = useMemo(() => {
    // console.log(rTokenBalance, redeemAmount, rTokenRatio)
		if (
			isNaN(Number(rTokenBalance)) ||
			isNaN(Number(redeemAmount)) ||
			isNaN(Number(rTokenRatio))
		) {
			return '--';
		}
		return (
			(Number(rTokenBalance) - Number(redeemAmount)) * Number(rTokenRatio) + ''
		);
	}, [rTokenBalance, rTokenRatio, redeemAmount]);

  const { isLoading } = useAppSlice();

  const addressCorrect = useMemo(() => {
    return validateETHAddress(targetAddress);
  }, [targetAddress]);

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
      return [true, "Unstake"];
    }
    if (isNaN(Number(balance))) {
      return [true, 'Insufficient Balance'];
    }
    if (!redeemAmount || Number(redeemAmount) === 0 || isNaN(Number(balance))) {
      return [true, "Unstake"];
    }
    if (Number(redeemAmount) > Number(balance)) {
      return [true, "Insufficient Balance"];
    }
    if (!addressCorrect) {
      return [true, "Invalid Receiving Address"];
    }
    return [false, "Unstake"];
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
          willReceiveAmount,
					newTotalStakedAmount,
					() => {
						dispatch(updateRTokenBalance(tokenStandard, props.tokenName));
					}
				)
			);
		}
  };

	useEffect(() => {
    if (addressCorrect) {
      dispatch(
        getMaticUnbondTxFees(redeemAmount || '1', targetAddress)
      )
    }
	}, [dispatch, targetAddress, addressCorrect, redeemAmount]);

	const txCostPopupState = usePopupState({
		variant: 'popover',
		popupId: 'txCost',
	});

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
              Unstake {tokenName}
            </div>

            <div className="mt-[.76rem] flex items-center justify-between">
              <div>
                <div className="text-text1 text-[.24rem]">
                  <MyTooltip title="Receive Address" text="Receive Address" />
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
                          color={addressCorrect ? '#00F3AB' : '#5B6872'}
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
                    {formatNumber(balance, { decimals: 6, toReadable: false })} r{tokenName}
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
                <Image src={tokenName === TokenName.MATIC ? maticBlackIcon : ethIcon} alt="icon" layout="fill" />
              </div>

              <div className="ml-[.35rem] text-text2 text-[.32rem]">r{props.tokenName}</div>

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
                  setRedeemAmount(
										balance
                  );
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
                <div
									className="mt-[.15rem] text-text1 text-[.24rem] flex cursor-pointer"
									{...bindHover(txCostPopupState)}
									// onMouseEnter={}
								>
									{formatNumber(transactionCost, { decimals: 2 })} FIS
									<div className="w-[.19rem] h-[0.1rem] relative ml-[.19rem] self-center">
										<Image src={downIcon} layout="fill" alt="down" />
									</div>
                </div>

								<HoverPopover
									{...bindPopover(txCostPopupState)}
									transformOrigin={{
										horizontal: 'center',
										vertical: 'top'
									}}
									anchorOrigin={{
										vertical: 'bottom',
										horizontal: 'center',
									}}
									sx={{
										marginTop: '.1rem',
										"& .MuiPopover-paper": {
											background: "rgba(9, 15, 23, 0.25)",
											border: "1px solid #26494E",
											backdropFilter: "blur(.4rem)",
											borderRadius: ".16rem",
											padding: '.2rem',
										},
										"& .MuiTypography-root": {
											padding: "0px",
										},
									}}
								>
									<div className="text-text2">
										<div className="flex justify-between">
											<div>Relay Fee</div>
											<div>{numberUtil.fisAmountToHuman(unbondFees)} FIS</div>
										</div>
										<div className="flex justify-between my-[.18rem]">
											<div>Transaction Fee</div>
											<div>{formatNumber(unbondTxFees, { decimals: 2 })} FIS</div>
										</div>
										<div
											className="h-[1px] bg-text3 my-[.1rem]"
										/>
										<div className="text-text1">
											Overall Transaction Cost: <span className="ml-[.1rem]" /> {formatNumber(transactionCost, { decimals: 2 })} FIS
										</div>
										<div className="mt-[.18rem] text-right">
											~${formatNumber(transactionCostValue, { decimals: 2 })}
										</div>
									</div>
								</HoverPopover>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">
                  <MyTooltip text="Unstake Fee" title="Unstake Fee" />
                </div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {formatNumber(unbondCommision, { decimals: 3 })} r{tokenName} (~{formatNumber(redeemFee, { decimals: 3 })} {tokenName})
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
