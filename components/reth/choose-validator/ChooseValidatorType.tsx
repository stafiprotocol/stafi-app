import classNames from "classnames";
import { Button } from "components/button";
import Image from "next/image";
import { useRouter } from "next/router";
import leftArrowIcon from "public/icon_arrow_left.png";
import soloValidatorText from "public/soloValidator_text.svg";
import trustValidatorText from "public/trustValidator_text.svg";
import validatorSelected from "public/validator_selected.svg";
import validatorUnselected from "public/validator_unselected.svg";
import { useState } from "react";
import styles from "../../../styles/reth/ChooseValidator.module.scss";

export const ChooseValidatorType = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<
    "solo" | "trust" | undefined
  >();

  return (
    <div className="pl-[1.12rem] pr-[1.38rem] pt-[1.24rem]">
      <div className="text-white text-[.42rem] font-[700]">
        Choose your validator type
      </div>

      <div className="mt-[.3rem] inline-flex items-center cursor-pointer">
        <div className="text-link text-[.24rem]">Comparison</div>

        <div className="ml-[.16rem] w-[.27rem] h-[.18rem] relative rotate-180">
          <Image src={leftArrowIcon} layout="fill" alt="back" />
        </div>
      </div>

      <div className="mt-[.75rem] flex">
        <div
          className={classNames(
            styles["validator-type-container"],
            selectedType === "solo"
              ? styles["validator-type-container-selected"]
              : ""
          )}
          onClick={() => setSelectedType("solo")}
        >
          <div className="w-[.44rem] h-[.44rem] mt-[.68rem] relative">
            <Image
              src={
                selectedType === "solo"
                  ? validatorSelected
                  : validatorUnselected
              }
              layout="fill"
              alt="solo"
            />
          </div>

          <div className="mt-[.34rem] relative w-[2.62rem] h-[.23rem]">
            <Image src={soloValidatorText} layout="fill" alt="solo" />
          </div>

          <div className="mt-[.42rem] text-[.24rem] text-text2 text-center">
            Deposit ETH
            <br />
            to be delegated
          </div>
        </div>
        <div
          className={classNames(
            "ml-[.55rem]",
            styles["validator-type-container"],
            selectedType === "trust"
              ? styles["validator-type-container-selected"]
              : ""
          )}
          onClick={() => setSelectedType("trust")}
        >
          <div className="w-[.44rem] h-[.44rem] mt-[.68rem] relative">
            <Image
              src={
                selectedType === "trust"
                  ? validatorSelected
                  : validatorUnselected
              }
              layout="fill"
              alt="trust"
            />
          </div>

          <div className="mt-[.34rem] relative w-[2.62rem] h-[.23rem]">
            <Image src={trustValidatorText} layout="fill" alt="trust" />
          </div>

          <div className="mt-[.42rem] text-[.24rem] text-text2 text-center">
            Apply to be delegated
          </div>
        </div>
      </div>

      <Button
        disabled={!selectedType}
        mt=".76rem"
        onClick={() => {
          if (selectedType === "trust") {
            router.push("/reth/trust-validator-deposit");
          } else {
            router.push("/reth/solo-validator-deposit");
          }
        }}
      >
        Next Step
      </Button>
    </div>
  );
};
