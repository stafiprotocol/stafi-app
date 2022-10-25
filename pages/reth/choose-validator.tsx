import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { ReactElement, useEffect } from "react";
import Image from "next/image";
import { Card } from "components/card";
import { ChooseValidatorLeftExplanation } from "components/reth/choose-validator/ChooseValidatorLeftExplanation";
import { ChooseValidatorType } from "components/reth/choose-validator/ChooseValidatorType";
import leftArrowIcon from "public/icon_arrow_left.png";
import { useRouter } from "next/router";
import React from "react";
import { MyLayoutContext } from "components/layout";

const ChooseValidator = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/reth/token-stake" },
      { name: "New Deposit" },
    ]);
  }, [setNavigation]);

  return (
    <div>
      <Card backgroundColor="#0A131B">
        <div className="flex h-[10.13rem] items-stretch">
          <ChooseValidatorLeftExplanation />

          <ChooseValidatorType />
        </div>
      </Card>
    </div>
  );
};

ChooseValidator.getLayout = (page: ReactElement) => {
  return <RethLayout>{page}</RethLayout>;
};

export default ChooseValidator;
