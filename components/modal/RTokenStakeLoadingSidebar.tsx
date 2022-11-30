import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import loading from "public/loading.png";
import { useEffect } from "react";
import { updateStakeLoadingParams } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import commonStyles from "../../styles/Common.module.scss";

export const RTokenStakeLoadingSidebar = () => {
  const dispatch = useAppDispatch();
  const { stakeLoadingParams } = useAppSelector((state: RootState) => {
    return {
      stakeLoadingParams: state.app.stakeLoadingParams,
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
            stakeLoadingParams?.modalVisible === true || !stakeLoadingParams,
        }
      )}
      style={{
        background: "rgba(26, 40, 53, 0.35)",
        border: "1px solid rgba(38, 73, 78, 0.5)",
        backdropFilter: "blur(.13rem)",
      }}
      onClick={() => {
        dispatch(updateStakeLoadingParams({ modalVisible: true }));
      }}
    >
      <div
        className={classNames(
          "ml-[.16rem] relative w-[.32rem] h-[.32rem]",
          stakeLoadingParams?.status === "loading" ? commonStyles.loading : ""
        )}
      >
        <Image
          src={
            stakeLoadingParams?.status === "success"
              ? checkFileSuccess
              : stakeLoadingParams?.status === "error"
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
          stakeLoadingParams?.status === "success"
            ? "text-primary"
            : stakeLoadingParams?.status === "error"
            ? "text-error"
            : "text-text1"
        )}
      >
        Stake
        <br />
        {stakeLoadingParams?.status === "success"
          ? "Succeed"
          : stakeLoadingParams?.status === "error"
          ? "Failed"
          : "Operating"}
      </div>

      <div className="ml-[.2rem] rotate-90">
        <Icomoon icon="right" color="#9DAFBE" size=".2rem" />
      </div>
    </div>
  );
};
