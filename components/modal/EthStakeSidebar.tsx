import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import loading from "public/loading.png";
import { setEthStakeModalVisible } from "redux/reducers/EthSlice";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import { RootState } from "redux/store";
import commonStyles from "../../styles/Common.module.scss";

export const EthStakeSidebar = () => {
  const dispatch = useAppDispatch();
  const { ethStakeModalVisible, ethStakeParams } = useAppSelector(
    (state: RootState) => {
      return {
        ethStakeModalVisible: state.eth.ethStakeModalVisible,
        ethStakeParams: state.eth.ethStakeParams,
      };
    }
  );

  return (
    <div
      className={classNames(
        "fixed right-0 top-[4rem] rounded-l-[.16rem] h-[.8rem] w-[2.2rem] flex items-center cursor-pointer",
        { hidden: ethStakeModalVisible || !ethStakeParams }
      )}
      style={{
        background: "rgba(26, 40, 53, 0.35)",
        border: "1px solid rgba(38, 73, 78, 0.5)",
        backdropFilter: "blur(.13rem)",
      }}
      onClick={() => {
        dispatch(setEthStakeModalVisible(true));
      }}
    >
      <div
        className={classNames(
          "ml-[.16rem] relative w-[.32rem] h-[.32rem]",
          ethStakeParams?.status !== "active" &&
            ethStakeParams?.status !== "error"
            ? commonStyles.loading
            : ""
        )}
      >
        <Image
          src={
            ethStakeParams?.status === "active"
              ? checkFileSuccess
              : ethStakeParams?.status === "error"
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
          ethStakeParams?.status === "active"
            ? "text-primary"
            : ethStakeParams?.status === "error"
              ? "text-error"
              : "text-text1"
        )}
      >
        Staking
        <br />
        {ethStakeParams?.status === "active"
          ? "Succeed"
          : ethStakeParams?.status === "error"
            ? "Failed"
            : "Operating"}
      </div>

      <div className="ml-[.2rem] rotate-90">
        <Icomoon icon="right" color="#9DAFBE" size=".2rem" />
      </div>
    </div>
  );
};
