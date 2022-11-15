import { Card } from "components/common/card";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { TrustDepositLeftExplanation } from "components/reth/deposit/TrustDepositLeftExplanation";
import { TrustValidatorDepositForm } from "components/reth/deposit/TrustValidatorDepositForm";
import { ReactElement } from "react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const TrustValidatorDeposit = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/validator/reth/token-stake" },
      { name: "New Deposit", path: "/validator/reth/choose-validator" },
      { name: "Trusted Validator Deposit" },
    ]);
  }, [setNavigation]);

  return (
    <div>
      <Card background="rgba(26, 40, 53, 0.2)">
        <div className="flex h-[10.13rem] items-stretch">
          <TrustDepositLeftExplanation />

          <TrustValidatorDepositForm />
        </div>
      </Card>
    </div>
  );
};

TrustValidatorDeposit.getLayout = (page: ReactElement) => {
  return <ValidatorLayout>{page}</ValidatorLayout>;
};

export default TrustValidatorDeposit;
