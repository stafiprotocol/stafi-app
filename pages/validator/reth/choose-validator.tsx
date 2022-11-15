import { Card } from "components/common/card";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
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
      <Card background="rgba(26, 40, 53, 0.2)">
        <div className="flex h-[10.13rem] items-stretch">
          <ChooseValidatorLeftExplanation />

          <ChooseValidatorType />
        </div>
      </Card>
    </div>
  );
};

ChooseValidator.getLayout = (page: ReactElement) => {
  return <ValidatorLayout>{page}</ValidatorLayout>;
};

export default ChooseValidator;
