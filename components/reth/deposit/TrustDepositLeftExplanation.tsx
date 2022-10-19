import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";
import rectangle from "public/rectangle1.svg";
import styles from "../../../styles/reth/ChooseValidator.module.scss";
import { CustomPagination } from "components/pagination";

export const TrustDepositLeftExplanation = () => {
  const [page, setPage] = useState(1);

  const text =
    "As the trust validator, there is no need for the ETH deposit, while you should deposit 1 json file here that includes all the pubkeys needed. Click [learn more] for the detailed deposit file generating instructions.";

  return (
    <div className={classNames(styles["left-container"], "flex flex-col")}>
      <div className="self-center relative w-[2.4rem] h-[.9rem]">
        <Image src={rectangle} layout="fill" alt="rectangle" />
      </div>

      <div className="mt-[1.6rem] mx-[.36rem]">
        <div className="flex items-center">
          <div className="rounded-full w-[.28rem] h-[.28rem] bg-primary flex items-center justify-center text-text3 font-[700] text-[.22rem]">
            {page}
          </div>

          <div className="ml-[.16rem] text-primary font-[700] text-[.28rem]">
            {page === 1 ? "Upload 1 File" : page === 2 ? "Stake" : "Status"}
          </div>
        </div>

        <div className="h-[3.68rem] mt-[.2rem] text-white opacity-40 text-[.22rem] leading-relaxed">
          {text}
        </div>

        <div className="ml-[-.1rem]">
          <CustomPagination totalCount={10} page={page} onChange={setPage} />
        </div>

        <div className="mt-[1rem] text-white text-[.22rem] opacity-40 underline">
          <a href="https://www.google.com" target="_blank" rel="noreferrer">
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
};
