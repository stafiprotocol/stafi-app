import { Button } from "components/common/button";
import { GradientText } from "components/common/GradientText";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { getMetamaskEthChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch } from "hooks/common";
import { useEthPoolData } from "hooks/useEthPoolData";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, WalletType } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import ethLogo from "public/eth_type_black.svg";
import circulate from "public/circulate.svg";
import { setConnectWalletModalParams } from "redux/reducers/AppSlice";
import { formatNumber } from "utils/number";
import { connectMetaMask } from "utils/web3Utils";

interface RTokenOverviewCardProps {
  tokenName: TokenName;
}

export const RTokenOverviewCard = (props: RTokenOverviewCardProps) => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const metaMaskChainId = useMetaMaskChainId();
  const { tokenName } = props;
  const { metaMaskAccount } = useWalletAccount();
  const router = useRouter();
  const { stakeApr, allEth, allEthValue } = useEthPoolData();

  const clickStake = () => {
    if (tokenName === TokenName.ETH) {
      if (!metaMaskAccount || metaMaskChainId !== getMetamaskEthChainId()) {
        dispatch(
          setConnectWalletModalParams({
            visible: true,
            walletList: [WalletType.MetaMask],
            targetMetaMaskChainId: getMetamaskEthChainId(),
          })
        );
        return;
      }
      router.push("/rtoken/stake/ETH");
    }
  };

  return (
    <div
      className="py-[0] px-[.24rem] h-[4.05rem] w-[3.35rem]"
      style={{
        background: "rgba(23, 38, 54, 0.2)",
        border: "1px solid #1a2835",
        backdropFilter: "blur(0.67rem)",
      }}
    >
      <div className="mt-[.36rem] flex items-center justify-between relative">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image src={ethLogo} layout="fill" alt="logo" />
        </div>

        <div
          className="w-[.38rem] h-[.38rem] absolute left-[.55rem] bottom-[.07rem] rounded-full z-10 p-[.1rem]"
          style={{
            background: "rgba(25, 38, 52, 0.4)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.13rem)",
          }}
        >
          <div className="w-full h-full relative">
            <Image src={circulate} layout="fill" alt="circulate" />
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
          {formatNumber(stakeApr, { decimals: 2 })}%
        </div>
      </div>

      <div className="mt-[.23rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Staked Value"
            title="Overall token staked value in USD, including restake value"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text2 text-[.16rem]">
          ${formatNumber(allEthValue, { decimals: 2 })}
        </div>
      </div>

      <div className="mt-[.23rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Total ETH Staked"
            title={`Overall ${tokenName} staked, including restaked ${tokenName}`}
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text2 text-[.16rem]">
          {formatNumber(allEth, { decimals: 2 })}
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
