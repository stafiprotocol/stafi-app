import { Button } from "components/common/button";
import { GradientText } from "components/common/GradientText";
import { Icomoon } from "components/icon/Icomoon";
import { getMetamaskEthChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useEthPoolData } from "hooks/useEthPoolData";
import { useWalletAccount } from "hooks/useWalletAccount";
import Image from "next/image";
import { useRouter } from "next/router";
import ethLogo from "public/eth_token.svg";
import { formatNumber } from "utils/number";
import { connectMetaMask } from "utils/web3Utils";

export const RTokenOverviewCard = () => {
  const { metaMaskAccount } = useWalletAccount();
  const router = useRouter();
  const { validatorApr, allEth, allEthValue } = useEthPoolData();

  const clickStake = () => {
    if (!metaMaskAccount) {
      connectMetaMask(getMetamaskEthChainId());
      return;
    }
    router.push("/rtoken/stake/ETH");
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
      <div className="mt-[.36rem] flex items-center justify-between">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image src={ethLogo} layout="fill" alt="logo" />
        </div>

        <div className="flex flex-col items-end">
          <div className="mt-[.1rem] text-text1 text-[.12rem]">Ethereum</div>
          <div className="mt-[.12rem]">
            <GradientText size=".4rem">ETH</GradientText>
          </div>
        </div>
      </div>

      <div className="mt-[.3rem] flex items-end justify-between">
        <div className="flex items-center">
          <div className="text-text2 text-[.16rem] mr-[.07rem]">APR</div>
          <Icomoon icon="question" size=".16rem" color="#5B6872" />
        </div>
        <div className="text-text1 font-[700] text-[.28rem]">
          {formatNumber(validatorApr, { decimals: 2 })}%
        </div>
      </div>

      <div className="mt-[.23rem] flex items-end justify-between">
        <div className="flex items-center">
          <div className="text-text2 text-[.16rem] mr-[.07rem]">
            Staked Value
          </div>
          <Icomoon icon="question" size=".16rem" color="#5B6872" />
        </div>
        <div className="text-text2 text-[.16rem]">
          ${formatNumber(allEthValue, { decimals: 2 })}
        </div>
      </div>

      <div className="mt-[.23rem] flex items-end justify-between">
        <div className="flex items-center">
          <div className="text-text2 text-[.16rem] mr-[.07rem]">
            Total ETH Staked
          </div>
          <Icomoon icon="question" size=".16rem" color="#5B6872" />
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
