import { Dialog, DialogContent } from "@mui/material";
import { Card } from "components/common/card";
import { CustomInput } from "components/common/CustomInput";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { TokenStandardSelector } from "components/rtoken/TokenStandardSelector";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import Image from "next/image";
import rectangle from "public/rectangle_h.svg";
import ethIcon from "public/eth_type_green.svg";
import maticIcon from "public/matic_type_green.svg";
import userAvatar from "public/userAvatar.svg";
import { useContext, useEffect, useMemo, useState } from "react";
import { CustomNumberInput } from "components/common/CustomNumberInput";
import { Button } from "components/common/button";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { handleEthTokenStake } from "redux/reducers/EthSlice";
import { formatLargeAmount, formatNumber } from "utils/number";
import { MyLayoutContext } from "components/layout/layout";
import { getShortAddress } from "utils/string";
import { checkMetaMaskAddress, isPolkadotWallet, openLink } from "utils/common";
import { useAppSlice } from "hooks/selector";
import { updateRTokenBalance } from "redux/reducers/RTokenSlice";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useRTokenRatio } from "hooks/useRTokenRatio";
import { useRTokenStakerApr } from "hooks/useRTokenStakerApr";
import { useEthGasPrice } from "hooks/useEthGasPrice";
import Web3 from "web3";
import {
  getMaticBondTransactionFees,
  handleMaticStake,
  mockProcess,
  stakeMatic,
} from "redux/reducers/MaticSlice";
import classNames from "classnames";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useWalletAccount } from "hooks/useWalletAccount";
import {
  usePopupState,
  bindHover,
  bindPopover,
} from "material-ui-popup-state/hooks";
import { useTransactionCost } from "hooks/useTransactionCost";
import numberUtil from "utils/numberUtil";
import { useTokenPrice } from "hooks/useTokenPrice";
import downIcon from "public/icon_down.png";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { RootState } from "redux/store";
import { useBridgeFees } from "hooks/useBridgeFees";
import { validateETHAddress, validateSS58Address } from "utils/validator";
import { RTokenStakeLoadingSidebar } from "./RTokenStakeLoadingSidebar";
import { BubblesLoading } from "components/common/BubblesLoading";
import { handleKsmStake } from "redux/reducers/KsmSlice";
import { getPolkadotAccountBalance } from "utils/polkadotUtils";
import { handleDotStake } from "redux/reducers/DotSlice";

interface RTokenStakeModalProps {
  visible: boolean;
  tokenName: TokenName;
  defaultReceivingAddress: string | undefined;
  editAddressDisabled?: boolean;
  onClose: () => void;
  balance: string;
}

export const RTokenStakeModal = (props: RTokenStakeModalProps) => {
  const { walletType, isWrongMetaMaskNetwork } = useContext(MyLayoutContext);
  const dispatch = useAppDispatch();
  const {
    visible,
    tokenName,
    balance,
    defaultReceivingAddress,
    editAddressDisabled,
  } = props;
  const tokenStandard = useTokenStandard(tokenName);
  const [expandUserAddress, setExpandUserAddress] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [targetAddress, setTargetAddress] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");

  const rTokenBalance = useRTokenBalance(tokenStandard, tokenName);
  const rTokenRatio = useRTokenRatio(tokenName);
  const rTokenStakerApr = useRTokenStakerApr(tokenName);
  const ethGasPrice = useEthGasPrice();
  const { polkadotBalance } = useWalletAccount();

  const { ethBalance, isApproved } = useAppSelector((state: RootState) => {
    let isApproved: boolean = false;
    if (tokenName === TokenName.MATIC) {
      isApproved = state.matic.isApproved;
    }
    return {
      ethBalance: state.eth.balance,
      isApproved,
    };
  });

  const { metaMaskAccount, polkadotAccount, ksmAccount, dotAccount } =
    useWalletAccount();

  const { bondFees, bondTxFees, relayFee } = useTransactionCost(
    tokenName,
    tokenStandard || TokenStandard.Native
  );

  const { erc20BridgeFee, bep20BridgeFee, solBridgeFee } = useBridgeFees();

  const ethPrice = useTokenPrice("ETH");

  const userAddress = useMemo(() => {
    if (walletType === WalletType.MetaMask) {
      return metaMaskAccount;
    } else if (walletType === WalletType.Polkadot) {
      return polkadotAccount;
    } else if (walletType === WalletType.Polkadot_KSM) {
      return ksmAccount;
    } else if (walletType === WalletType.Polkadot_DOT) {
      return dotAccount;
    }
    return "";
  }, [walletType, metaMaskAccount, polkadotAccount, ksmAccount, dotAccount]);

  const willReceiveAmount = useMemo(() => {
    if (
      isNaN(Number(stakeAmount)) ||
      isNaN(Number(rTokenRatio)) ||
      Number(stakeAmount) === 0
    ) {
      return "--";
    }
    return Number(stakeAmount) / Number(rTokenRatio) + "";
  }, [stakeAmount, rTokenRatio]);

  const { isLoading } = useAppSlice();

  const addressCorrect = useMemo(() => {
    if (tokenName === TokenName.ETH) {
      return validateETHAddress(targetAddress);
    } else if (tokenName === TokenName.MATIC) {
      if (tokenStandard === TokenStandard.Native) {
        return validateSS58Address(targetAddress);
      } else {
        return validateETHAddress(targetAddress);
      }
    }
    return true;
  }, [targetAddress, tokenName, tokenStandard]);

  useEffect(() => {
    if (visible) {
      setTargetAddress(defaultReceivingAddress || "");
    }
  }, [visible, defaultReceivingAddress]);

  useEffect(() => {
    resetState();
  }, [visible]);

  const estimateFee = useMemo(() => {
    let gasLimit = 146316;
    if (tokenName === TokenName.MATIC) {
      gasLimit = 79724;
      if (!isApproved) {
        gasLimit += 46179;
      }
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
  }, [ethGasPrice, tokenName, isApproved]);

  const totalBridgeFee = useMemo(() => {
    if (tokenStandard === TokenStandard.Native) {
      if (isNaN(Number(relayFee))) {
        return "--";
      }
      return relayFee + "";
    } else {
      let bridgeFee: string = "--";
      if (tokenStandard === TokenStandard.ERC20) {
        bridgeFee = erc20BridgeFee;
      } else if (tokenStandard === TokenStandard.BEP20) {
        bridgeFee = bep20BridgeFee;
      } else {
        bridgeFee = solBridgeFee;
      }
      if (isNaN(Number(relayFee)) || isNaN(Number(bridgeFee))) {
        return "--";
      }
      return Number(relayFee) + Number(bridgeFee) + "";
    }
  }, [relayFee, erc20BridgeFee, bep20BridgeFee, solBridgeFee, tokenStandard]);

  const transactionCost = useMemo(() => {
    if (tokenStandard === TokenStandard.Native) {
      if (isNaN(Number(estimateFee)) || isNaN(Number(estimateFee))) {
        return "--";
      }
      return Number(relayFee) + Number(estimateFee) + "";
    } else {
      let bridgeFee: string = "--";
      if (tokenStandard === TokenStandard.ERC20) {
        bridgeFee = erc20BridgeFee;
      } else if (tokenStandard === TokenStandard.BEP20) {
        bridgeFee = bep20BridgeFee;
      } else if (tokenStandard === TokenStandard.SPL) {
        bridgeFee = solBridgeFee;
      }

      if (
        isNaN(Number(estimateFee)) ||
        isNaN(Number(relayFee)) ||
        isNaN(Number(bridgeFee))
      ) {
        return "--";
      }
      return Number(relayFee) + Number(estimateFee) + Number(bridgeFee) + "";
    }
  }, [
    erc20BridgeFee,
    bep20BridgeFee,
    solBridgeFee,
    relayFee,
    estimateFee,
    tokenStandard,
  ]);

  const transactionCostValue = useMemo(() => {
    if (isNaN(Number(transactionCost)) || isNaN(Number(ethPrice))) return "--";
    return Number(transactionCost) * Number(ethPrice) + "";
  }, [transactionCost, ethPrice]);

  const [buttonDisabled, buttonText] = useMemo(() => {
    if (walletType === "MetaMask" && isWrongMetaMaskNetwork) {
      return [true, "Stake"];
    }
    if (
      !stakeAmount ||
      Number(stakeAmount) === 0 ||
      isNaN(Number(stakeAmount)) ||
      isNaN(Number(balance))
    ) {
      return [true, "Stake"];
    }
    if (Number(stakeAmount) < 0.01) {
      return [true, `Minimal Stake Amount is 0.01 ${tokenName}`];
    }

    if (tokenName === TokenName.ETH) {
      if (
        Number(stakeAmount) +
          (isNaN(Number(estimateFee)) ? 0 : Number(estimateFee) * 1.4) >
        Number(balance)
      ) {
        return [true, "Insufficient Balance"];
      }
    } else {
      if (Number(stakeAmount) > Number(balance)) {
        return [true, "Insufficient Balance"];
      }
      if (
        !isNaN(Number(transactionCost)) &&
        Number(polkadotBalance) <= Number(transactionCost)
      ) {
        return [true, "Insufficient FIS Balance"];
      }
      if (Number(ethBalance) <= Number(estimateFee)) {
        return [true, "Insufficient ETH Balance"];
      }
    }

    if (!addressCorrect) {
      return [true, "Invalid Receiving Address"];
    }
    return [false, "Stake"];
  }, [
    walletType,
    isWrongMetaMaskNetwork,
    balance,
    stakeAmount,
    addressCorrect,
    estimateFee,
    tokenName,
    ethBalance,
    polkadotBalance,
    transactionCost,
  ]);

  const newTotalStakedAmount = useMemo(() => {
    if (
      isNaN(Number(rTokenBalance)) ||
      isNaN(Number(stakeAmount)) ||
      isNaN(Number(rTokenRatio))
    ) {
      return "--";
    }
    return (
      Number(rTokenBalance) * Number(rTokenRatio) + Number(stakeAmount) + ""
    );
  }, [rTokenBalance, rTokenRatio, stakeAmount]);

  const resetState = () => {
    setEditAddress(false);
    setStakeAmount("");
  };

  const clickStake = () => {
    /*
    dispatch(mockProcess(stakeAmount, willReceiveAmount, tokenStandard, targetAddress, newTotalStakedAmount));
    return;
    */
    if (tokenName === TokenName.ETH) {
      dispatch(
        handleEthTokenStake(
          tokenStandard,
          Number(stakeAmount) + "",
          willReceiveAmount,
          newTotalStakedAmount,
          false,
          (success) => {
            if (success) {
              resetState();
              dispatch(updateRTokenBalance(tokenStandard, tokenName));
              props.onClose();
            }
          }
        )
      );
    } else if (tokenName === TokenName.MATIC) {
      let bridgeFee: string = "0";
      if (tokenStandard === TokenStandard.ERC20) {
        bridgeFee = erc20BridgeFee;
      } else if (tokenStandard === TokenStandard.BEP20) {
        bridgeFee = bep20BridgeFee;
      } else if (tokenStandard === TokenStandard.SPL) {
        bridgeFee = solBridgeFee;
      }
      let txFee = "--";
      if (!isNaN(Number(relayFee)) && !isNaN(Number(bridgeFee))) {
        txFee = (Number(relayFee) + Number(bridgeFee)).toString();
      }
      if (txFee === "--") {
        return;
      }
      dispatch(
        stakeMatic(
          Number(stakeAmount) + "",
          willReceiveAmount,
          tokenStandard,
          targetAddress,
          newTotalStakedAmount,
          txFee,
          false,
          (success) => {
            if (success) {
              resetState();
              dispatch(updateRTokenBalance(tokenStandard, tokenName));
              props.onClose();
            }
          }
        )
        //mockProcess(stakeAmount, willReceiveAmount, tokenStandard, newTotalStakedAmount)
      );
    } else if (tokenName === TokenName.KSM) {
      dispatch(
        handleKsmStake(
          Number(stakeAmount) + "",
          willReceiveAmount,
          tokenStandard,
          targetAddress,
          newTotalStakedAmount,
          false,
          (success) => {
            if (success) {
              resetState();
              dispatch(updateRTokenBalance(tokenStandard, tokenName));
              props.onClose();
            }
          }
        )
        //mockProcess(stakeAmount, willReceiveAmount, tokenStandard, newTotalStakedAmount)
      );
    } else if (tokenName === TokenName.DOT) {
      dispatch(
        handleDotStake(
          Number(stakeAmount) + "",
          willReceiveAmount,
          tokenStandard,
          targetAddress,
          newTotalStakedAmount,
          false,
          (success) => {
            if (success) {
              resetState();
              dispatch(updateRTokenBalance(tokenStandard, tokenName));
              props.onClose();
            }
          }
        )
        //mockProcess(stakeAmount, willReceiveAmount, tokenStandard, newTotalStakedAmount)
      );
    }
  };

  useEffect(() => {
    dispatch(getMaticBondTransactionFees(tokenStandard));
  }, [dispatch, targetAddress, tokenStandard]);

  const txCostPopupState = usePopupState({
    variant: "popover",
    popupId: "txCost",
  });

  const renderBridgeFee = () => {
    let bridgeFee: string = "--";
    if (tokenStandard === TokenStandard.ERC20) {
      bridgeFee = erc20BridgeFee;
    } else if (tokenStandard === TokenStandard.BEP20) {
      bridgeFee = bep20BridgeFee;
    } else if (tokenStandard === TokenStandard.SPL) {
      bridgeFee = solBridgeFee;
    }

    return (
      <div className="flex justify-between my-[.18rem]">
        <div>Bridge Fee</div>
        <div>{formatNumber(bridgeFee, { decimals: 4 })} ETH</div>
      </div>
    );
  };

  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      scroll="paper"
      sx={{
        borderRadius: "0.16rem",
        background: "#0A131Bba",
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
              Stake {tokenName}
            </div>

            <div className="mt-[.76rem] flex items-center justify-between">
              <div>
                <div
                  className="text-text1 text-[.24rem] inline-flex items-center cursor-pointer"
                  onClick={() => {
                    openLink(
                      "https://docs.stafi.io/rtoken-app/reth-solution/staker-guide"
                    );
                  }}
                >
                  {tokenName === TokenName.ETH ? (
                    <MyTooltip
                      title="Your mint address is the same as your stake account"
                      text="Mint Type"
                    />
                  ) : (
                    <>
                      <div>Mint Type</div>
                      <div className="flex items-center ml-[.08rem]">
                        <Icomoon
                          icon="question"
                          size="0.16rem"
                          color="#9DAFBE"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center mt-[.15rem]">
                  <TokenStandardSelector
                    tokenName={props.tokenName}
                    selectedStandard={tokenStandard}
                  />

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
                            value={targetAddress}
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
                  Available Balance:
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
                    {formatNumber(balance, { decimals: 6, toReadable: false })}{" "}
                    {tokenName}
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
                <Image
                  src={tokenName === TokenName.MATIC ? maticIcon : ethIcon}
                  alt="icon"
                  layout="fill"
                />
              </div>

              <div className="ml-[.35rem] text-text2 text-[.32rem]">
                {tokenName}
              </div>

              <div className="flex-1 mx-[.34rem]">
                <CustomNumberInput
                  fontSize=".32rem"
                  placeholder="Stake Amount"
                  value={stakeAmount}
                  handleValueChange={setStakeAmount}
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
                  let amount = Number(balance);
                  if (tokenName === TokenName.ETH) {
                    amount = Math.max(
                      Number(balance) - Number(estimateFee) * 1.5,
                      0
                    );
                  }
                  setStakeAmount(
                    formatNumber(amount.toString(), { toReadable: false })
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
              onClick={clickStake}
            >
              {buttonText}
            </Button>

            <div className="mt-[.8rem] flex items-center justify-center">
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">You Will Receive</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
									{formatLargeAmount(willReceiveAmount)} r{tokenName}
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Exchange Rate</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {!rTokenRatio ? (
                    <BubblesLoading color="#9DAFBE" />
                  ) : (
                    <>
                      {formatNumber(rTokenRatio, { decimals: 4 })} {tokenName} =
                      1 r{tokenName}
                    </>
                  )}
                </div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Transaction Cost</div>
                {tokenName === TokenName.ETH ? (
                  <div className="mt-[.15rem] text-text1 text-[.24rem]">
                    Est. {formatNumber(estimateFee)} ETH
                  </div>
                ) : (
                  <div
                    className="mt-[.15rem] text-text1 text-[.24rem] flex cursor-pointer"
                    {...bindHover(txCostPopupState)}
                  >
                    {formatNumber(transactionCost, { decimals: 4 })} ETH
                    <div className="w-[.19rem] h-[0.1rem] relative ml-[.19rem] self-center">
                      <Image src={downIcon} layout="fill" alt="down" />
                    </div>
                  </div>
                )}
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
                      <div>Bridge Fee</div>
                      <div>
                        {formatNumber(totalBridgeFee, { decimals: 4 })} ETH
                      </div>
                    </div>
                    <div className="flex justify-between my-[.18rem]">
                      <div>ETH Tx Fee</div>
                      <div>
                        {formatNumber(estimateFee, { decimals: 4 })} ETH
                      </div>
                    </div>
                    <div className="h-[1px] bg-text3 my-[.1rem]" />
                    <div className="text-text1">
                      Overall Transaction Cost: <span className="ml-[.1rem]" />{" "}
                      {formatNumber(transactionCost, { decimals: 4 })} ETH
                    </div>
                    <div className="mt-[.18rem] text-right">
                      ~${formatNumber(transactionCostValue, { decimals: 4 })}
                    </div>
                  </div>
                </HoverPopover>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">
                  <MyTooltip
                    text="Staking Reward"
                    title="Estimated staking reward based on your staking amount"
                  />
                </div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">
                  {!rTokenStakerApr ? (
                    <BubblesLoading color="#9DAFBE" />
                  ) : (
                    <> {formatNumber(rTokenStakerApr, { decimals: 2 })}% APR</>
                  )}
                </div>
              </div>
            </div>

            <div
              className={classNames(
                "self-center mt-[.8rem] text-[.24rem] flex items-center",
                { hidden: tokenName === TokenName.ETH }
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
          </div>
        </Card>

        <RTokenStakeLoadingSidebar />
      </DialogContent>
    </Dialog>
  );
};
