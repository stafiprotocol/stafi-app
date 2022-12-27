import classNames from "classnames";
import { BubblesLoading } from "components/common/BubblesLoading";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { GradientText } from "components/common/GradientText";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenRedeemModal } from "components/modal/RTokenRedeemModal";
import { TradeModal } from "components/modal/TradeModal";
import { WarningModal } from "components/modal/WarningModal";
import { getValidatorSiteHost } from "config/env";
import { useAppDispatch } from "hooks/common";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useRTokenRatio } from "hooks/useRTokenRatio";
import { useRTokenReward } from "hooks/useRTokenReward";
import { useTokenPrice } from "hooks/useTokenPrice";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import rectangle from "public/rectangle_v.svg";
import rectangleError from "public/rectangle_v_error.svg";
import { useContext, useMemo, useState } from "react";
import { connectMetaMask } from "redux/reducers/WalletSlice";
import { isEmptyValue, isInvalidValue, openLink } from "utils/common";
import { getChainIcon, getWhiteTokenIcon } from "utils/icon";
import { formatNumber, getDecimals } from "utils/number";
import { transformSs58Address } from "utils/polkadotUtils";
import { getExchangeRateUpdateTime, getTokenSymbol } from "utils/rToken";
import { TokenStandardSelector } from "./TokenStandardSelector";

interface StakeOverviewProps {
  tokenName: TokenName;
  onClickStake: () => void;
  onClickConnectWallet: () => void;
}

export const StakeOverview = (props: StakeOverviewProps) => {
  const dispatch = useAppDispatch();
  const {
    walletType,
    isWrongNetwork,
    isWrongMetaMaskNetwork,
    walletNotConnected,
    targetMetaMaskChainId,
  } = useContext(MyLayoutContext);

  const tokenStandard = useTokenStandard(props.tokenName);
  const router = useRouter();
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [ethRedeemWarningModalVisible, setEthRedeemWarningModalVisible] =
    useState(false);
  const [rTokenRedeemModalVisible, setRTokenRedeemModalVisible] =
    useState(false);

  const { metaMaskAccount, ksmAccount, dotAccount } = useWalletAccount();

  const defaultReceivingAddress = useMemo(() => {
    if (props.tokenName === TokenName.KSM) {
      return transformSs58Address(ksmAccount, WalletType.Polkadot_KSM);
    } else if (props.tokenName === TokenName.DOT) {
      return transformSs58Address(dotAccount, WalletType.Polkadot_DOT);
    }
    return metaMaskAccount;
  }, [props.tokenName, metaMaskAccount, ksmAccount, dotAccount]);

  const selectedStandard = useTokenStandard(props.tokenName);
  const rTokenBalance = useRTokenBalance(selectedStandard, props.tokenName);
  const rTokenRatio = useRTokenRatio(props.tokenName);
  const tokenPrice = useTokenPrice(props.tokenName);
  const { totalReward } = useRTokenReward(props.tokenName, 0, 0);

  // Total reward value.
  const totalRewardValue = useMemo(() => {
    if (isEmptyValue(totalReward) || isEmptyValue(tokenPrice)) {
      return undefined;
    }
    if (isInvalidValue(totalReward) || isInvalidValue(tokenPrice)) {
      return "--";
    }
    return Number(totalReward) * Number(tokenPrice) + "";
  }, [totalReward, tokenPrice]);

  // User staked token amount.
  const stakedAmount = useMemo(() => {
    if (isEmptyValue(rTokenBalance) || isEmptyValue(rTokenRatio)) {
      return undefined;
    }
    if (isInvalidValue(rTokenBalance) || isInvalidValue(rTokenRatio)) {
      return "--";
    }

    const stakedAmount = Number(rTokenBalance) * Number(rTokenRatio);
    const decimals = getDecimals(getTokenSymbol(props.tokenName));

    return (
      Math.ceil((((stakedAmount * 1000000) / decimals) * decimals) / 1000000) +
      ""
    );
  }, [rTokenBalance, rTokenRatio, props.tokenName]);

  // User staked token value.
  const stakedValue = useMemo(() => {
    if (isEmptyValue(stakedAmount) || isEmptyValue(tokenPrice)) {
      return undefined;
    }
    if (isInvalidValue(stakedAmount) || isInvalidValue(tokenPrice)) {
      return "--";
    }
    return Number(stakedAmount) * Number(tokenPrice) + "";
  }, [stakedAmount, tokenPrice]);

  return (
    <div>
      <div
        className="rounded-t-[.16rem] h-[3rem] flex items-center justify-between"
        style={{
          background: isWrongNetwork
            ? "linear-gradient(164.58deg, rgba(255, 122, 220, 0.218887) 45.57%, rgba(43, 122, 211, 0.270214) 319.15%)"
            : "linear-gradient(153.03deg, rgba(50, 220, 218, 0.282752) 2.46%, rgba(43, 122, 211, 0.270214) 86.13%)",
          backdropFilter: "blur(.7rem)",
        }}
      >
        <div className="flex items-center">
          <div className="h-[2.2rem] w-[1rem] relative">
            <Image
              src={isWrongNetwork ? rectangleError : rectangle}
              alt="rectangle"
              layout="fill"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-[.72rem] w-[.72rem] relative">
                <Image
                  src={getWhiteTokenIcon(props.tokenName)}
                  alt="icon"
                  layout="fill"
                />
              </div>

              <GradientText size=".72rem" ml=".24rem" isError={isWrongNetwork}>
                {walletNotConnected
                  ? "Wallet Unconnected"
                  : isWrongNetwork
                  ? "Wrong Network"
                  : `r${props.tokenName}`}
              </GradientText>
            </div>

            {walletNotConnected ? (
              <div
                className="mt-[.24rem] ml-[1rem] h-[.6rem] self-start flex items-center justify-center px-[.24rem] rounded-[.16rem] cursor-pointer"
                style={{
                  border: "1px solid rgba(91, 104, 114, 0.5)",
                  background: "rgba(26, 40, 53, 0.15)",
                }}
                onClick={props.onClickConnectWallet}
              >
                <div className="text-white text-[.24rem] mr-[.14rem]">
                  Connect {walletType}
                </div>
                <Icomoon icon="arrow-right" size=".26rem" color="#9DAFBE" />
              </div>
            ) : isWrongNetwork ? (
              <div
                className="mt-[.24rem] ml-[1rem] h-[.6rem] self-start flex items-center justify-center px-[.24rem] rounded-[.16rem] cursor-pointer"
                style={{
                  border: "1px solid rgba(91, 104, 114, 0.5)",
                  background: "rgba(26, 40, 53, 0.15)",
                }}
                onClick={() => {
                  if (isWrongMetaMaskNetwork) {
                    dispatch(connectMetaMask(targetMetaMaskChainId));
                  }
                }}
              >
                <div className="text-white text-[.24rem] mr-[.14rem]">
                  Switch to Ethereum Network
                </div>
                <Icomoon icon="arrow-right" size=".26rem" color="#9DAFBE" />
              </div>
            ) : (
              <div
                className="flex items-center mt-[.4rem] cursor-pointer"
                onClick={() => {
                  openLink(
                    `https://docs.stafi.io/rtoken-app/r${props.tokenName.toLowerCase()}-solution`
                  );
                }}
              >
                <div className="text-text1 text-[.24rem]">
                  Stake {props.tokenName} and receive r{props.tokenName} in
                  return
                </div>

                <div className="flex items-center ml-[.08rem]">
                  <Icomoon icon="question" size="0.16rem" color="#9DAFBE" />
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className={classNames("flex items-center mr-[.7rem] opacity-60", {
            hidden: isWrongNetwork,
          })}
        >
          <div className="flex flex-col mr-[.45rem] items-end">
            <div className="text-primary text-[.6rem] font-[600]">
              {!rTokenBalance ? (
                <BubblesLoading size=".15rem" color="#00F3AB" />
              ) : (
                <>{formatNumber(rTokenBalance)}</>
              )}
            </div>

            <div className="text-primary text-[.2rem] mr-[.1rem] mt-[.1rem]">
              r{props.tokenName} Balance
            </div>
          </div>
          <div className="w-[.8rem] relative">
            <Image
              src={getChainIcon(props.tokenName)}
              alt="chain"
              layout="responsive"
            />
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-[-.16rem]">
        <Card background="rgba(26, 40, 53, 0.2)">
          <div className="px-[.56rem]">
            <div className="flex items-center justify-between mt-[.46rem]">
              <div className="flex items-center">
                <div className="text-text1 text-[.24rem] mr-[.26rem]">
                  Current Token Standard
                </div>
                <TokenStandardSelector
                  tokenName={props.tokenName}
                  selectedStandard={selectedStandard}
                />
              </div>

              <div
                className={classNames("flex items-center cursor-pointer", {
                  hidden: props.tokenName !== TokenName.ETH,
                })}
                onClick={() => {
                  openLink(
                    `${getValidatorSiteHost()}/validator/reth/pool-data`
                  );
                }}
              >
                <div className="text-text1 text-[.24rem] mr-[.12rem]">
                  Pool Data
                </div>

                <Icomoon icon="arrow-right" color="#9DAFBE" size=".25rem" />
              </div>
            </div>

            <div className="mt-[.6rem] flex">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    text="Staked Value"
                    title={`Your overall ${props.tokenName} staked value in USD, including compound ${props.tokenName}`}
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  {isWrongMetaMaskNetwork ? (
                    <>--</>
                  ) : isEmptyValue(stakedValue) ? (
                    <BubblesLoading color="white" />
                  ) : (
                    <>$ {formatNumber(stakedValue)}</>
                  )}
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem] flex items-center">
                  {isWrongMetaMaskNetwork ? (
                    <>--</>
                  ) : isEmptyValue(stakedAmount) ? (
                    <BubblesLoading color="#5B6872" />
                  ) : (
                    <>{formatNumber(stakedAmount)}</>
                  )}
                  <div className="ml-[.06rem]">{props.tokenName}</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    text={`Total ${props.tokenName} Rewards`}
                    title={`Your overall ${props.tokenName} rewards value in USD`}
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  {isWrongMetaMaskNetwork ? (
                    <>--</>
                  ) : isEmptyValue(totalRewardValue) ? (
                    <BubblesLoading color="white" />
                  ) : (
                    <>$ {formatNumber(totalRewardValue)}</>
                  )}
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem] flex items-center">
                  {isWrongMetaMaskNetwork ? (
                    <>--</>
                  ) : isEmptyValue(totalReward) ? (
                    <BubblesLoading />
                  ) : (
                    <>
                      {isWrongMetaMaskNetwork
                        ? "--"
                        : formatNumber(totalReward)}
                    </>
                  )}
                  <div className="ml-[.06rem]">{props.tokenName}</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    text="Current Exchange Rate"
                    title={`The number of ${
                      props.tokenName
                    }s that can be exchanged for 1 r${
                      props.tokenName
                    }, the exchange rate of r${
                      props.tokenName
                    } will be updated every ${getExchangeRateUpdateTime(
                      props.tokenName
                    )} hours`}
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  {isWrongMetaMaskNetwork ? (
                    <>--</>
                  ) : !rTokenRatio ? (
                    <BubblesLoading color="white" />
                  ) : (
                    <>{formatNumber(rTokenRatio)}</>
                  )}
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  r{props.tokenName}/{props.tokenName}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-[.8rem] mb-[.86rem]">
              <Button
                disabled={isWrongNetwork}
                height=".86rem"
                width="4rem"
                radius=".5rem"
                fontSize=".24rem"
                onClick={props.onClickStake}
              >
                Stake
              </Button>
              <Button
                disabled={isWrongNetwork}
                height=".86rem"
                width="4rem"
                radius=".5rem"
                fontSize=".24rem"
                onClick={() => setTradeModalVisible(true)}
              >
                Trade
              </Button>
              <div
                className={classNames(
                  "h-[.86rem] rounded-[.45rem] w-[4rem] border-solid border-[1px] border-[] text-[.24rem]",
                  "flex items-center justify-center",
                  isWrongNetwork || tokenStandard !== TokenStandard.Native
                    ? "cursor-default"
                    : "cursor-pointer",
                  { "opacity-50": tokenStandard !== TokenStandard.Native }
                )}
                style={{
                  border: "1px solid rgba(91, 104, 114, 0.5)",
                }}
                onClick={() => {
                  if (
                    isWrongNetwork ||
                    tokenStandard !== TokenStandard.Native
                  ) {
                    return;
                  }
                  if (props.tokenName === TokenName.ETH) {
                    setEthRedeemWarningModalVisible(true);
                    return;
                  } else {
                    setRTokenRedeemModalVisible(true);
                    return;
                  }
                }}
              >
                Unstake
              </div>
            </div>
          </div>
        </Card>
      </div>

      <TradeModal
        visible={tradeModalVisible}
        onClose={() => setTradeModalVisible(false)}
        tokenName={props.tokenName}
      />

      <WarningModal
        visible={ethRedeemWarningModalVisible}
        onClose={() => {
          setEthRedeemWarningModalVisible(false);
        }}
        content="Unstake function will be supported once Ethereum withdraw is enabled"
      />

      <RTokenRedeemModal
        visible={rTokenRedeemModalVisible}
        onClose={() => setRTokenRedeemModalVisible(false)}
        tokenName={props.tokenName}
        balance={rTokenBalance}
        defaultReceivingAddress={defaultReceivingAddress}
        onClickConnectWallet={props.onClickConnectWallet}
      />
    </div>
  );
};
