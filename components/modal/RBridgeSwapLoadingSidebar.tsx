import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import loading from "public/loading.png";
import { useEffect } from "react";
import { setRedeemLoadingParams } from "redux/reducers/AppSlice";
import { setBridgeSwapLoadingParams } from "redux/reducers/BridgeSlice";
import { RootState } from "redux/store";
import commonStyles from "../../styles/Common.module.scss";

export const RBridgeSwapLoadingSidebar = () => {
  const dispatch = useAppDispatch();
  const { bridgeSwapLoadingParams } = useAppSelector((state: RootState) => {
    return {
      bridgeSwapLoadingParams: state.bridge.bridgeSwapLoadingParams,
    };
  });

  // useEffect(() => {
  //   console.log("stakeLoadingParams", stakeLoadingParams);
  // }, [stakeLoadingParams]);

  return (
    <div
      className={classNames(
        "fixed right-0 top-[4rem] rounded-l-[.16rem] h-[.8rem] w-[2.2rem] flex items-center cursor-pointer",
        {
          hidden:
            bridgeSwapLoadingParams?.modalVisible === true ||
            !bridgeSwapLoadingParams,
        }
      )}
      style={{
        background: "rgba(26, 40, 53, 0.35)",
        border: "1px solid rgba(38, 73, 78, 0.5)",
        backdropFilter: "blur(.13rem)",
      }}
      onClick={() => {
        dispatch(setBridgeSwapLoadingParams({ modalVisible: true }));
      }}
    >
      <div
        className={classNames(
          "ml-[.16rem] relative w-[.32rem] h-[.32rem]",
          bridgeSwapLoadingParams?.status === "loading"
            ? commonStyles.loading
            : ""
        )}
      >
        <Image
          src={
            bridgeSwapLoadingParams?.status === "success"
              ? checkFileSuccess
              : bridgeSwapLoadingParams?.status === "error"
              ? checkFileError
              : loading
          }
          layout="fill"
          alt="loading"
        />
      </div>

      <div
        className={classNames(
          "ml-[.16rem] text-[.2rem] leading-normal",
          bridgeSwapLoadingParams?.status === "success"
            ? "text-primary"
            : bridgeSwapLoadingParams?.status === "error"
            ? "text-error"
            : "text-text1"
        )}
      >
        Swap
        <br />
        {bridgeSwapLoadingParams?.status === "success"
          ? "Succeed"
          : bridgeSwapLoadingParams?.status === "error"
          ? "Failed"
          : "Operating"}
      </div>

      <div className="ml-[.2rem] rotate-90">
        <Icomoon icon="right" color="#9DAFBE" size=".2rem" />
      </div>
    </div>
  );
};
