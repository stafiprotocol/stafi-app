import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { ReactElement } from "hoist-non-react-statics/node_modules/@types/react";
import Image from "next/image";
import { Card } from "components/card";
import { ChooseValidatorLeftExplanation } from "components/reth/choose-validator/ChooseValidatorLeftExplanation";
import { TrustValidatorDepositForm } from "components/reth/deposit/TrustValidatorDepositForm";
import leftArrowIcon from "public/icon_arrow_left.png";
import { useRouter } from "next/router";

const TrustValidatorDeposit = () => {
  const router = useRouter();

  return (
    <div className="pt-[.56rem]">
      <div
        className="inline-flex items-center cursor-pointer"
        onClick={() => {
          router.push("/reth/choose-validator");
        }}
      >
        <div className="w-[.27rem] h-[.18rem] relative">
          <Image src={leftArrowIcon} layout="fill" alt="back" />
        </div>

        <div className="ml-[.16rem] text-link text-[.32rem]">
          Choose Validator Type
        </div>
      </div>

      <Card mt=".56rem">
        <div className="flex h-[10.13rem] items-stretch">
          <ChooseValidatorLeftExplanation />

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
