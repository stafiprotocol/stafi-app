import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import loading from "public/loading.png";
import { useEffect } from "react";
import { setRedeemLoadingParams } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import commonStyles from "../../styles/Common.module.scss";

export const RTokenRedeemLoadingSidebar = () => {
  const dispatch = useAppDispatch();
  const { redeemLoadingParams } = useAppSelector((state: RootState) => {
    return {
      redeemLoadingParams: state.app.redeemLoadingParams,
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
            redeemLoadingParams?.modalVisible === true || !redeemLoadingParams,
        }
      )}
      style={{
        background: "rgba(26, 40, 53, 0.35)",
        border: "1px solid rgba(38, 73, 78, 0.5)",
        backdropFilter: "blur(.13rem)",
      }}
      onClick={() => {
        dispatch(setRedeemLoadingParams({ modalVisible: true }));
      }}
    >
      <div
        className={classNames(
          "ml-[.16rem] relative w-[.32rem] h-[.32rem]",
          redeemLoadingParams?.status === "loading" ? commonStyles.loading : ""
        )}
      >
        <Image
          src={
            redeemLoadingParams?.status === "success"
              ? checkFileSuccess
              : redeemLoadingParams?.status === "error"
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
          redeemLoadingParams?.status === "success"
            ? "text-primary"
            : redeemLoadingParams?.status === "error"
            ? "text-error"
            : "text-text1"
        )}
      >
        Unstake
        <br />
        {redeemLoadingParams?.status === "success"
          ? "Succeed"
          : redeemLoadingParams?.status === "error"
          ? "Failed"
          : "Operating"}
      </div>

      <div className="ml-[.2rem] rotate-90">
        <Icomoon icon="right" color="#9DAFBE" size=".2rem" />
      </div>
    </div>
  );
};
