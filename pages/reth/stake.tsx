import { MyLayoutContext } from "components/layout";
import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { RunNodesLeftExplanation } from "components/reth/RunNodesLeftExplanation";
import { StakeForm } from "components/reth/stake/StakeForm";
import { StakeLeftExplanation } from "components/reth/stake/StakeLeftExplanation";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";
import { Card } from "../../components/card";
import leftArrowIcon from "../../public/icon_arrow_left.png";

const EthStake = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/reth/token-stake" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  return (
    <div>
      <Card>
        <div className="flex h-[10.13rem] items-stretch">
          <RunNodesLeftExplanation />

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
