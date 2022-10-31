import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";
import rectangle from "public/rectangle_h.svg";
import { CustomPagination } from "../../common/pagination";
import styles from "../../../styles/reth/ChooseValidator.module.scss";

export const StakingLeftExplanation = () => {
  const [page, setPage] = useState(1);

  const text = (
    <div>
      After Staking, please join in the ETH2 mainnet network, kindly read{" "}
      <a
        className="text-link underline"
        href="https://docs.prylabs.network/docs/install/install-with-script"
        target="_blank"
        rel="noreferrer"
      >
        Prysm ETH2 Docs
      </a>
      .
    </div>
  );

  return (
    <div className={classNames(styles["left-container"], "flex flex-col")}>
      <div className="self-center relative w-[2.4rem] h-[.9rem]">
        <Image src={rectangle} layout="fill" alt="rectangle" />
      </div>

      <div className="mt-[1.6rem] mx-[.36rem]">
        <div className="flex items-start">
          <div className="rounded-full w-[.28rem] h-[.28rem] bg-primary flex items-center justify-center text-text3 font-[700] text-[.22rem]">
            {page}
          </div>

          <div className="mt-[.02rem] ml-[.16rem] text-primary font-[700] text-[.28rem]">
            {page === 1
              ? "After staking"
              : page === 2
              ? "Deposit_data-*.json file"
              : "Status"}
          </div>
        </div>

        <div className="h-[4rem] mt-[.2rem] text-white opacity-40 text-[.22rem] leading-relaxed">
          {text}
        </div>

        <div className="ml-[-.1rem]">
          <CustomPagination totalCount={10} page={page} onChange={setPage} />
        </div>

        <div className="mt-[1rem] text-white text-[.22rem] opacity-40 underline">
          <a
            href="https://discord.com/invite/jB77etn"
            target="_blank"
            rel="noreferrer"
          >
            Go for community help
          </a>
        </div>
      </div>
    </div>
  );
};
