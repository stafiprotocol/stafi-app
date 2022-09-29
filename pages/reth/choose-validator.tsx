import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { ReactElement } from "react";
import Image from "next/image";
import { Card } from "components/card";
import { ChooseValidatorLeftExplanation } from "components/reth/choose-validator/ChooseValidatorLeftExplanation";
import { ChooseValidatorType } from "components/reth/choose-validator/ChooseValidatorType";
import leftArrowIcon from "public/icon_arrow_left.png";
import { useRouter } from "next/router";

const ChooseValidator = () => {
  const router = useRouter();

  return (
    <div className="pt-[.56rem]">
      <div
        className="inline-flex items-center cursor-pointer"
        onClick={() => {
          router.push("/rtoken");
        }}
      >
        <div className="w-[.27rem] h-[.18rem] relative">
          <Image src={leftArrowIcon} layout="fill" alt="back" />
        </div>

        <div className="ml-[.16rem] text-link text-[.32rem]">rToken List</div>
      </div>

      <Card mt=".56rem" backgroundColor="#0A131B">
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
