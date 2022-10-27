import { Card } from "components/card";
import { MyLayoutContext } from "components/layout";
import { RethLayout } from "components/layout_reth";
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
      <Card>
        <div className="flex h-[10.13rem] items-stretch">
          <TrustDepositLeftExplanation />

          <TrustValidatorDepositForm />
        </div>
      </Card>
    </div>
  );
};

TrustValidatorDeposit.getLayout = (page: ReactElement) => {
  return <RethLayout>{page}</RethLayout>;
};

export default TrustValidatorDeposit;
