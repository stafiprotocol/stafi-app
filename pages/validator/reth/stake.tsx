import { Card } from "components/card";
import { MyLayoutContext } from "components/layout";
import { RethLayout } from "components/layout_reth";
import { RunNodesLeftExplanation } from "components/reth/RunNodesLeftExplanation";
import { StakeForm } from "components/reth/stake/StakeForm";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";

const EthStake = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/validator/reth/token-stake" },
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
