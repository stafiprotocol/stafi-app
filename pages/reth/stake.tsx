import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { StakeForm } from "components/reth/stake/StakeForm";
import { StakeLeftExplanation } from "components/reth/stake/StakeLeftExplanation";
import Image from "next/image";
import { useRouter } from "next/router";
import { ReactElement } from "react";
import { Card } from "../../components/card";
import leftArrowIcon from "../../public/icon_arrow_left.png";

const EthStake = () => {
  const router = useRouter();

  return (
    <div className="pt-[.56rem]">
      <div
        className="inline-flex items-center cursor-pointer"
        onClick={() => {
          router.push("/reth/token-stake");
        }}
      >
        <div className="w-[.27rem] h-[.18rem] relative">
          <Image src={leftArrowIcon} layout="fill" alt="back" />
        </div>

        <div className="ml-[.16rem] text-link text-[.32rem]">Token Stake</div>
      </div>

      <Card mt=".56rem">
        <div className="flex h-[10.13rem] items-stretch">
          <StakeLeftExplanation />

          <StakeForm />
        </div>
      </Card>
    </div>
  );
};

EthStake.getLayout = (page: ReactElement) => {
  return <RethLayout>{page}</RethLayout>;
};

export default EthStake;
