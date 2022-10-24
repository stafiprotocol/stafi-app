import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";
import rectangle from "public/rectangle1.svg";
import { CustomPagination } from "../pagination";
import styles from "../../styles/reth/ChooseValidator.module.scss";

export const RunNodesLeftExplanation = () => {
  const [page, setPage] = useState(1);

  const text =
    page === 1 ? (
      "If you are the trusted validator or solo validator pro, only after you upload your files and stake, you could check if the 32 ETH is matched in the pubkey."
    ) : page === 2 ? (
      <div>
        Please upload the deposit_data-*.json file, then click the
        &quot;Stake&quot; button. As for the deposit_data-*.json file generation
        you can refer the{" "}
        <a
          className="text-link underline"
          href="https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide#2.-use-deposit-cli-to-generate-a-key-file"
          target="_blank"
          rel="noreferrer"
        >
          instruction
        </a>
        .
      </div>
    ) : (
      <div>
        Please upload the stake_data-*.json file if your deposit progress is
        successful, then click the &quot;Stake&quot; button. As for the
        stake_data-*.json file generation you can refer the{" "}
        <a
          className="text-link underline"
          href="https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide#2.-use-deposit-cli-to-generate-a-key-file"
          target="_blank"
          rel="noreferrer"
        >
          instruction
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
              ? "Please Notice"
              : page === 2
              ? "deposit_data-*.json file"
              : "stake_data-*.json file"}
          </div>
        </div>

        <div className="h-[4rem] mt-[.2rem] text-white opacity-40 text-[.22rem] leading-relaxed">
          {text}
        </div>

        <div className="ml-[-.1rem]">
          <CustomPagination totalCount={30} page={page} onChange={setPage} />
        </div>

        <div className="mt-[1rem] text-white text-[.22rem] opacity-40 underline">
          <a
            href="https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide"
            target="_blank"
            rel="noreferrer"
          >
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
};
