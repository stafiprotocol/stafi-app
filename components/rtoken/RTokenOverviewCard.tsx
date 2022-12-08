import { Button } from "components/common/button";
import { GradientText } from "components/common/GradientText";
import { MyTooltip } from "components/common/MyTooltip";
import {
  getMetamaskBscChainId,
  getMetamaskEthChainId,
  getMetamaskMaticChainId,
} from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch } from "hooks/common";
import { useEthPoolData } from "hooks/useEthPoolData";
import { useMaticPoolData } from "hooks/useMaticPoolData";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, WalletType } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import circulate from "public/circulate.svg";
import ethLogo from "public/eth_type_black.svg";
import maticLogo from "public/matic_type_black.svg";
import maticChainLogo from "public/matic_logo_black.svg";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";
import { formatNumber } from "utils/number";
import { setRouteNextPage } from "redux/reducers/FisSlice";
import { useTokenPoolData } from "hooks/useTokenPoolData";
import { useRTokenStakerApr } from "hooks/useRTokenStakerApr";
import { BubblesLoading } from "components/common/BubblesLoading";
import { useMemo } from "react";

interface RTokenOverviewCardProps {
  tokenName: TokenName;
}

export const RTokenOverviewCard = (props: RTokenOverviewCardProps) => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const { tokenName } = props;
  const { metaMaskAccount, polkadotAccount } = useWalletAccount();
  const router = useRouter();
  const { stakeApr, allEth, allEthValue } = useEthPoolData();

  const { stakedAmount, stakedValue } = useTokenPoolData(tokenName);
  const apr = useRTokenStakerApr(tokenName);

  const displayApr = useMemo(() => {
    return tokenName === TokenName.ETH ? stakeApr : apr;
  }, [tokenName, stakeApr, apr]);

  const displayStakedValue = useMemo(() => {
    return tokenName === TokenName.ETH ? allEthValue : stakedValue;
  }, [tokenName, allEthValue, stakedValue]);

  const displayStakedAmount = useMemo(() => {
    return tokenName === TokenName.ETH ? allEth : stakedAmount;
  }, [tokenName, allEth, stakedAmount]);

  const clickStake = () => {
    if (tokenName === TokenName.ETH) {
      if (!metaMaskAccount || metaMaskChainId !== getMetamaskEthChainId()) {
        dispatch(setRouteNextPage("/rtoken/stake/ETH"));
        dispatch(
          setConnectWalletModalParams({
            visible: true,
            walletList: [WalletType.MetaMask],
            targetMetaMaskChainId: getMetamaskEthChainId(),
            targetUrl: "/rtoken/stake/ETH",
          })
        );
        return;
      }
      router.push("/rtoken/stake/ETH");
    } else if (tokenName === TokenName.MATIC) {
      if (
        metaMaskAccount &&
        polkadotAccount &&
        metaMaskChainId === getMetamaskMaticChainId()
      ) {
        router.push("/rtoken/stake/MATIC");
        return;
      }
      let walletTypes: WalletType[] = [];
      walletTypes.push(WalletType.MetaMask);
      walletTypes.push(WalletType.Polkadot);
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: walletTypes,
          targetMetaMaskChainId: getMetamaskMaticChainId(),
          targetUrl: "/rtoken/stake/MATIC",
        })
      );
    } else if (tokenName === TokenName.BNB) {
      if (!metaMaskAccount || metaMaskChainId !== getMetamaskBscChainId()) {
        dispatch(setRouteNextPage("/rtoken/stake/BNB"));
        dispatch(
          setConnectWalletModalParams({
            visible: true,
            walletList: [WalletType.MetaMask],
            targetMetaMaskChainId: getMetamaskBscChainId(),
            targetUrl: "/rtoken/stake/BNB",
          })
        );
        return;
      }
      router.push("/rtoken/stake/BNB");
    }
  };

  return (
    <div
      className="py-[0] px-[.24rem] h-[4.05rem] w-[3.35rem] rounded-[.16rem] bg-[#1a283533] hover:bg-[#58779826]"
      style={{
        border: "1px solid #1a2835",
        backdropFilter: "blur(0.67rem)",
      }}
    >
      <div className="mt-[.36rem] flex items-center justify-between relative">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image
            src={tokenName === TokenName.MATIC ? maticLogo : ethLogo}
            layout="fill"
            alt="logo"
          />
        </div>

        <div
          className="w-[.38rem] h-[.38rem] absolute left-[.55rem] bottom-[.07rem] rounded-full z-10 p-[.04rem] hidden"
          style={{
            background: "rgba(25, 38, 52, 0.4)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.13rem)",
          }}
        >
          <div className="w-full h-full relative">
            <Image
              src={tokenName === TokenName.MATIC ? maticChainLogo : ethLogo}
              layout="fill"
              alt="circulate"
            />
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="mt-[.1rem] text-text1 text-[.12rem]">Ethereum</div>
          <div className="mt-[.12rem]">
            <GradientText size=".4rem">{tokenName}</GradientText>
          </div>
        </div>
      </div>

      <div className="mt-[.3rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="APR"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text1 font-[700] text-[.28rem]">
          {!displayApr ? (
            <BubblesLoading size=".12rem" color="#9DAFBE" />
          ) : (
            <>
              {formatNumber(displayApr, {
                decimals: 2,
              })}
              %
            </>
          )}
        </div>
      </div>

      <div className="mt-[.23rem] flex items-center justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Staked Value"
            title={`Overall token staked value in USD, including compound ${tokenName}`}
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text2 text-[.16rem] flex items-center">
          {!displayStakedValue ? (
            <BubblesLoading />
          ) : (
            <>${formatNumber(displayStakedValue, { decimals: 2 })}</>
          )}
        </div>
      </div>

      <div className="mt-[.23rem] flex items-center justify-between">
        <div className="flex items-center">
          <MyTooltip
            text={`Total ${tokenName} Staked`}
            title={`Overall ${tokenName} staked, including compound ${tokenName}`}
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text2 text-[.16rem]">
          {!displayStakedAmount ? (
            <BubblesLoading />
          ) : (
            <>
              {formatNumber(displayStakedAmount, {
                decimals: 2,
              })}
            </>
          )}
        </div>
      </div>

      <Button
        mt="0.5rem"
        height="0.65rem"
        fontSize="0.24rem"
        onClick={clickStake}
      >
        Stake
      </Button>
    </div>
  );
};
