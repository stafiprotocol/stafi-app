import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { ReactElement } from "hoist-non-react-statics/node_modules/@types/react";
import Image from "next/image";
import { Card } from "components/card";
import { ChooseValidatorLeftExplanation } from "components/reth/choose-validator/ChooseValidatorLeftExplanation";
import { TrustValidatorDepositForm } from "components/reth/deposit/TrustValidatorDepositForm";
import leftArrowIcon from "public/icon_arrow_left.png";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { MyLayoutContext } from "components/layout";
import { TrustDepositLeftExplanation } from "components/reth/deposit/TrustDepositLeftExplanation";

const TrustValidatorDeposit = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/reth/token-stake" },
      { name: "New Deposit", path: "/reth/choose-validator" },
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
