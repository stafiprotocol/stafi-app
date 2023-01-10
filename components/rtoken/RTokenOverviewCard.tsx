import { BubblesLoading } from "components/common/BubblesLoading";
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
import { useRTokenStakerApr } from "hooks/useRTokenStakerApr";
import { useTokenPoolData } from "hooks/useTokenPoolData";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, WalletType } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import dotLogo from "public/dot_type_black.png";
import ethLogo from "public/eth_type_black.svg";
import ksmLogo from "public/ksm_type_black.png";
import maticLogo from "public/matic_type_black.png";
import solLogo from "public/sol_type_black.png";
import bnbLogo from "public/bnb_type_black.png";
import { useMemo } from "react";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";
import { setRouteNextPage } from "redux/reducers/FisSlice";
import { formatNumber } from "utils/number";

interface RTokenOverviewCardProps {
  tokenName: TokenName;
}

export const RTokenOverviewCard = (props: RTokenOverviewCardProps) => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const { tokenName } = props;
  const {
    metaMaskAccount,
    polkadotAccount,
    ksmAccount,
    dotAccount,
    solanaAccount,
  } = useWalletAccount();
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

  const getLogo = () => {
    if (tokenName === TokenName.MATIC) {
      return maticLogo;
    }
    if (tokenName === TokenName.KSM) {
      return ksmLogo;
    }
    if (tokenName === TokenName.DOT) {
      return dotLogo;
    }
    if (tokenName === TokenName.SOL) {
      return solLogo;
    }
    if (tokenName === TokenName.BNB) {
      return bnbLogo;
    }
    return ethLogo;
  };

  const getPlatform = () => {
    if (tokenName === TokenName.MATIC) {
      return "Ethereum";
    }
    if (tokenName === TokenName.ETH) {
      return "Ethereum";
    }
    if (tokenName === TokenName.KSM) {
      return "Kusama";
    }
    if (tokenName === TokenName.DOT) {
      return "Polkadot";
    }
    if (tokenName === TokenName.SOL) {
      return "Solana";
    }
    if (tokenName === TokenName.BNB) {
      return "BSC";
    }
    return "Ethereum";
  };

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
      if (
        metaMaskAccount &&
        polkadotAccount &&
        metaMaskChainId === getMetamaskBscChainId()
      ) {
        router.push("/rtoken/stake/BNB");
        return;
      }
      let walletTypes: WalletType[] = [];
      walletTypes.push(WalletType.MetaMask);
      walletTypes.push(WalletType.Polkadot);
      dispatch(
        setConnectWalletModalParams({
          visible: true,
          walletList: walletTypes,
          targetMetaMaskChainId: getMetamaskBscChainId(),
          targetUrl: "/rtoken/stake/BNB",
        })
      );
    } else if (tokenName === TokenName.KSM) {
      if (!ksmAccount || !polkadotAccount) {
        dispatch(
          setConnectWalletModalParams({
            visible: true,
            walletList: [WalletType.Polkadot, WalletType.Polkadot_KSM],
            targetUrl: "/rtoken/stake/KSM",
          })
        );
        return;
      }
      router.push("/rtoken/stake/KSM");
    } else if (tokenName === TokenName.DOT) {
      if (!dotAccount || !polkadotAccount) {
        dispatch(
          setConnectWalletModalParams({
            visible: true,
            walletList: [WalletType.Polkadot, WalletType.Polkadot_DOT],
            targetUrl: "/rtoken/stake/DOT",
          })
        );
        return;
      }
      router.push("/rtoken/stake/DOT");
    } else if (tokenName === TokenName.SOL) {
      if (!solanaAccount || !polkadotAccount) {
        dispatch(
          setConnectWalletModalParams({
            visible: true,
            walletList: [WalletType.Polkadot, WalletType.Phantom],
            targetUrl: "/rtoken/stake/SOL",
          })
        );
        return;
      }
      router.push("/rtoken/stake/SOL");
    }
  };

  return (
    <div
      className="py-[0] px-[.24rem] h-[4.05rem] w-full rounded-[.16rem] bg-[#1a283533] hover:bg-[#58779826]"
      style={{
        border: "1px solid #1a2835",
        backdropFilter: "blur(0.67rem)",
        cursor: "pointer",
      }}
      onClick={clickStake}
    >
      <div className="mt-[.36rem] flex items-center justify-between relative">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image src={getLogo()} layout="fill" alt="logo" />
        </div>

        <div className="flex flex-col items-end">
          <div className="mt-[.1rem] text-text1 text-[.12rem]">
            {getPlatform()}
          </div>
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
                toReadable: false,
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
        // onClick={clickStake}
      >
        Stake
      </Button>
    </div>
  );
};
