import classNames from "classnames";
import { Icomoon } from "components/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import diamond from "public/diamond.svg";
import { RootState } from "redux/store";
import { openLink } from "utils/common";

export const EthGoStakeSidebar = () => {
  return (
    <div
      className={classNames(
        "fixed right-0 top-[1.7rem] rounded-l-[.16rem] h-[.8rem] w-[2.2rem] flex items-center cursor-pointer"
      )}
      style={{
        background: "rgba(26, 40, 53, 0.35)",
        border: "1px solid rgba(38, 73, 78, 0.5)",
        backdropFilter: "blur(.13rem)",
      }}
      onClick={() => {
        openLink("https://www.google.com");
      }}
    >
      <div className={classNames("ml-[.16rem] relative w-[.33rem] h-[.28rem]")}>
        <Image src={diamond} layout="fill" alt="loading" />
      </div>

      <div
        className={classNames(
          "ml-[.12rem] text-[.24rem] leading-normal text-text1"
        )}
      >
        Go Stake
      </div>

      <div className="ml-[.16rem] rotate-90">
        <Icomoon icon="right" color="#9DAFBE" size=".2rem" />
      </div>
    </div>
  );
};
