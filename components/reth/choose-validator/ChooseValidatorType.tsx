import classNames from "classnames";
import { Button } from "components/button";
import { getMetamaskChainId } from "config/eth";
import { hooks, metaMask } from "connectors/metaMask";
import { useEthValidatorType } from "hooks/useEthValidatorType";
import Image from "next/image";
import { useRouter } from "next/router";
import leftArrowIcon from "public/icon_arrow_left.png";
import permissioned from "public/permissioned.svg";
import permissionless from "public/permissionless.svg";
import soloValidatorText from "public/soloValidator_text.svg";
import trustValidatorText from "public/trustValidator_text.svg";
import validatorSelected from "public/validator_selected.svg";
import validatorUnselected from "public/validator_unselected.svg";
import { useState } from "react";
import { openLink } from "utils/common";
import { connectMetaMask } from "utils/web3Utils";
import styles from "../../../styles/reth/ChooseValidator.module.scss";

export const ChooseValidatorType = () => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<
    "solo" | "trusted" | undefined
  >();
  const { useAccount, useChainId } = hooks;
  const account = useAccount();
  const chainId = useChainId();

  const { isTrust } = useEthValidatorType();

  return (
    <div className="pl-[1.12rem] pr-[1.38rem] pt-[1.24rem] flex-1">
      <div className="text-white text-[.42rem] font-[700]">
        Choose your validator type
      </div>

      <div className="mt-[.3rem] inline-flex items-center cursor-pointer">
        <div
          className="text-link text-[.24rem]"
          onClick={() =>
            openLink("https://docs.stafi.io/rtoken-app/reth-solution#532d")
          }
        >
          Comparison
        </div>

        <div className="ml-[.16rem] w-[.27rem] h-[.18rem] relative rotate-180">
          <Image src={leftArrowIcon} layout="fill" alt="back" />
        </div>
      </div>

      <div className="mt-[.75rem] flex justify-center">
        <div
          className={classNames(
            styles["validator-type-container"],
            selectedType === "solo"
              ? styles["validator-type-container-selected"]
              : ""
          )}
          onClick={() => setSelectedType("solo")}
        >
          <div className="w-[1.59rem] h-[.91rem] absolute right-[-1.5px] top-[-1px]">
            <Image src={permissionless} layout="fill" alt="permissionless" />
          </div>

          <div className="w-[.44rem] h-[.44rem] mt-[.48rem] relative">
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

          <div className="mt-[.4rem] relative w-[1.5rem] h-[.6rem]">
            <Image src={soloValidatorText} layout="fill" alt="solo" />
          </div>

          <div className="mt-[.3rem] text-[.24rem] text-text2 text-center leading-normal">
            Deposit ETH
            <br />
            to be delegated
          </div>
        </div>
        <div
          className={classNames(
            "ml-[.55rem]",
            styles["validator-type-container"],
            selectedType === "trusted"
              ? styles["validator-type-container-selected"]
              : ""
          )}
          onClick={() => setSelectedType("trusted")}
        >
          <div className="w-[1.59rem] h-[.91rem] absolute right-[-1.5px] top-[-1px]">
            <Image src={permissioned} layout="fill" alt="permissioned" />
          </div>

          <div className="w-[.44rem] h-[.44rem] mt-[.48rem] relative">
            <Image
              src={
                selectedType === "trusted"
                  ? validatorSelected
                  : validatorUnselected
              }
              layout="fill"
              alt="trust"
            />
          </div>

          <div className="mt-[.4rem] relative w-[1.5rem] h-[.6rem]">
            <Image src={trustValidatorText} layout="fill" alt="trust" />
          </div>

          <div className="mt-[.3rem] text-[.24rem] text-text2 text-center leading-normal">
            Apply to be delegated
            <br />0 ETH needed
          </div>
        </div>
      </div>

      <Button
        disabled={
          !(
            !account ||
            (selectedType === "trusted" && !isTrust) ||
            !!selectedType
          )
        }
        mt=".76rem"
        onClick={() => {
          if (!account || chainId !== getMetamaskChainId()) {
            connectMetaMask();
            return;
          }
          if (selectedType === "trusted" && !isTrust) {
            openLink("https://forms.gle/W2E8kczfdnybKYL97");
            return;
          }
          if (selectedType === "trusted") {
            router.push("/validator/reth/trust-validator-deposit");
          } else {
            router.push("/validator/reth/solo-validator-deposit");
          }
        }}
      >
        {!account
          ? "Connect Wallet"
          : selectedType === "trusted" && !isTrust
            ? "Apply for trusted validator"
            : "Next Step"}
      </Button>
    </div>
  );
};
