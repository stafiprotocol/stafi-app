import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { GradientText } from "components/common/GradientText";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useRTokenRatio } from "hooks/useRTokenRatio";
import { useSelectedTokenStandard } from "hooks/useSelectedTokenStandard";
import { useTokenPrice } from "hooks/useTokenPrice";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import rectangle from "public/rectangle_v.svg";
import rectangleError from "public/rectangle_v_error.svg";
import { useContext, useState, useMemo, useEffect } from "react";
import { openLink } from "utils/common";
import { getChainIcon, getWhiteTokenIcon } from "utils/icon";
import { formatNumber } from "utils/number";
import { getSupportedTokenStandards } from "utils/rToken";
import { connectMetaMask } from "utils/web3Utils";
import { TokenStandardSelector } from "./TokenStandardSelector";

interface StakeOverviewProps {
  tokenName: TokenName;
  onClickStake: () => void;
  onClickConnectWallet: () => void;
}

export const StakeOverview = (props: StakeOverviewProps) => {
  const {
    walletType,
    isWrongNetwork,
    isWrongMetaMaskNetwork,
    walletNotConnected,
    targetMetaMaskChainId,
  } = useContext(MyLayoutContext);

  const router = useRouter();

  const selectedStandard = useSelectedTokenStandard(props.tokenName);
  const rTokenBalance = useRTokenBalance(selectedStandard, props.tokenName);
  const rTokenRatio = useRTokenRatio(props.tokenName);
  const rTokenPrice = useTokenPrice("r" + props.tokenName);
  // console.log("xxx", rTokenBalance, rTokenRatio);

  // User staked token amount.
  const stakedAmount = useMemo(() => {
    if (isNaN(Number(rTokenBalance)) || isNaN(Number(rTokenRatio))) {
      return "--";
    }
    return Number(rTokenBalance) * Number(rTokenRatio);
  }, [rTokenBalance, rTokenRatio]);

  // User staked token value.
  const stakedValue = useMemo(() => {
    if (isNaN(Number(rTokenBalance)) || isNaN(Number(rTokenPrice))) {
      return "--";
    }
    return Number(rTokenBalance) * Number(rTokenPrice);
  }, [rTokenBalance, rTokenPrice]);

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
                    connectMetaMask(targetMetaMaskChainId);
                  }
                }}
              >
                <div className="text-white text-[.24rem] mr-[.14rem]">
                  Switch to Ethereum Network
                </div>
                <Icomoon icon="arrow-right" size=".26rem" color="#9DAFBE" />
              </div>
            ) : (
              <div className="text-text1 text-[.24rem] mt-[.4rem]">
                Stake {props.tokenName} and receive r{props.tokenName} in return
              </div>
            )}
          </div>
        </div>
        <div className="flex items-end mr-[.7rem]">
          <div className="w-[.8rem] h-[1.3rem] relative">
            <Image
              src={getChainIcon(props.tokenName)}
              alt="chain"
              layout="fill"
            />
          </div>

          <div className="ml-[.24rem] w-[.33rem] h-[.53rem] relative">
            <Image
              src={getChainIcon(props.tokenName)}
              alt="chain"
              layout="fill"
            />
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-[-.16rem]">
        <Card background="#0A131B">
          <div className="px-[.56rem]">
            <div className="flex items-center justify-between mt-[.46rem]">
              <div className="flex items-center">
                <div className="text-text1 text-[.24rem] mr-[.26rem]">
                  Current Token Standard
                </div>
                <TokenStandardSelector
                  tokenName={props.tokenName}
                  selectedStandard={selectedStandard}
                  onSelect={(standard) => {
                    router.replace(
                      `${router.pathname}?tokenStandard=${standard}`
                    );
                  }}
                />
              </div>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => {
                  openLink("https://www.google.com");
                }}
              >
                <div className="text-text1 text-[.24rem] mr-[.12rem]">
                  rETH Dashboard
                </div>

                <Icomoon icon="arrow-right" color="#9DAFBE" size=".25rem" />
              </div>
            </div>

            <div className="mt-[.6rem] flex">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip title="Staked Value" text="Staked Value" />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  $ {formatNumber(stakedValue, { decimals: 2 })}
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  {formatNumber(stakedAmount)} {props.tokenName}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    title="Total rETH Rewards"
                    text="Total rETH Rewards"
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  $ 1827.19
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  {formatNumber(stakedAmount)} {props.tokenName}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    title="Current Exchange Rate"
                    text="Current Exchange Rate"
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  {formatNumber(rTokenRatio, { decimals: 4 })}
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  rETH/ETH
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-[.8rem] mb-[.86rem]">
              <Button
                disabled={false}
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
              >
                Trade
              </Button>
              <Button
                disabled={isWrongNetwork}
                height=".86rem"
                width="4rem"
                stroke
                radius=".5rem"
                fontSize=".24rem"
              >
                Redeem
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
