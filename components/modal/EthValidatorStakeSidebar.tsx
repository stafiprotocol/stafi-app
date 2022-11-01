import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import loading from "public/loading.png";
import { setEthValiatorStakeModalVisible } from "redux/reducers/EthSlice";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import { RootState } from "redux/store";
import commonStyles from "../../styles/Common.module.scss";

export const EthValidatorStakeSidebar = () => {
  const dispatch = useAppDispatch();
  const { ethValidatorStakeModalVisible, ethValidatorStakeParams } =
    useAppSelector((state: RootState) => {
      return {
        ethValidatorStakeModalVisible: state.eth.ethValidatorStakeModalVisible,
        ethValidatorStakeParams: state.eth.ethValidatorStakeParams,
      };
    });

  return (
    <div
      className={classNames(
        "fixed right-0 top-[4rem] rounded-l-[.16rem] h-[.8rem] w-[2.2rem] flex items-center cursor-pointer",
        { hidden: ethValidatorStakeModalVisible || !ethValidatorStakeParams }
      )}
      style={{
        background: "rgba(26, 40, 53, 0.35)",
        border: "1px solid rgba(38, 73, 78, 0.5)",
        backdropFilter: "blur(.13rem)",
      }}
      onClick={() => {
        dispatch(setEthValiatorStakeModalVisible(true));
      }}
    >
      <div
        className={classNames(
          "ml-[.16rem] relative w-[.32rem] h-[.32rem]",
          ethValidatorStakeParams?.status !== "active" &&
            ethValidatorStakeParams?.status !== "error"
            ? commonStyles.loading
            : ""
        )}
      >
        <Image
          src={
            ethValidatorStakeParams?.status === "active"
              ? checkFileSuccess
              : ethValidatorStakeParams?.status === "error"
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
          ethValidatorStakeParams?.status === "active"
            ? "text-primary"
            : ethValidatorStakeParams?.status === "error"
            ? "text-error"
            : "text-text1"
        )}
      >
        Staking
        <br />
        {ethValidatorStakeParams?.status === "active"
          ? "Succeed"
          : ethValidatorStakeParams?.status === "error"
          ? "Failed"
          : "Operating"}
      </div>

      <div className="ml-[.2rem] rotate-90">
        <Icomoon icon="right" color="#9DAFBE" size=".2rem" />
      </div>
    </div>
  );
};
