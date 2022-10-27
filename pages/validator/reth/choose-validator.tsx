import { Card } from "components/card";
import { MyLayoutContext } from "components/layout";
import { RethLayout } from "components/layout_reth";
import { ChooseValidatorLeftExplanation } from "components/reth/choose-validator/ChooseValidatorLeftExplanation";
import { ChooseValidatorType } from "components/reth/choose-validator/ChooseValidatorType";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";

const ChooseValidator = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/validator/reth/token-stake" },
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
