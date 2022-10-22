import Image from "next/image";
import styles from "../../styles/rTokenPage.module.scss";
import ethLogo from "../../public/eth_token.svg";
import ETH from "../../public/tokenName/ETH.svg";
import { Icomoon } from "components/Icomoon";
import { Button } from "components/button";
import { useRouter } from "next/router";
import { useEthPoolData } from "hooks/useEthPoolData";
import { formatNumber } from "utils/number";

export const RTokenOverviewCard = () => {
  const router = useRouter();
  const { validatorApr, allEth, allEthValue } = useEthPoolData();

  return (
    <div className={styles["all-stakes-card"]}>
      <div className="mt-[.36rem] flex items-center justify-between">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image src={ethLogo} layout="fill" alt="logo" />
        </div>

        <div className="flex flex-col items-end">
          <div className="mt-[.1rem] text-text1 text-[.12rem]">Ethereum</div>
          <div className="mt-[.12rem] h-[.32rem] w-[.54rem] relative">
            <Image src={ETH} alt="token name" layout="fill" />
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
        onClick={() => {
          router.push("/reth/token-stake");
        }}
      >
        Stake
      </Button>
    </div>
  );
};
