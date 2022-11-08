import { Box, Modal } from "@mui/material";
import classNames from "classnames";
import { PrimaryLoading } from "components/common/PrimaryLoading";
import { Icomoon } from "components/icon/Icomoon";
import { StakeLoadingProgressItem } from "components/rtoken/StakeLoadingProgressItem";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import { useRouter } from "next/router";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import { useEffect, useState } from "react";
import { setStakeLoadingParams } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";

export const RTokenStakeLoadingModal = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);

  const { stakeLoadingParams } = useAppSelector((state: RootState) => {
    return {
      stakeLoadingParams: state.app.stakeLoadingParams,
    };
  });

  useEffect(() => {
    if (!stakeLoadingParams) {
      return;
    }
    if (
      (stakeLoadingParams.status === "success" ||
        stakeLoadingParams.status === "error") &&
      !stakeLoadingParams.modalVisible
    ) {
      dispatch(setStakeLoadingParams(undefined));
    }
  }, [dispatch, stakeLoadingParams]);

  return (
    <Modal open={stakeLoadingParams?.modalVisible === true}>
      <Box
        pt="0"
        pl=".32rem"
        pr=".32rem"
        pb="0.56rem"
        sx={{
          border: "1px solid #1A2835",
          backgroundColor: "#0A131B",
          width: "6rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex-1 flex flex-col items-center">
          <div
            className="self-end mr-[-0.16rem] mt-[.16rem] cursor-pointer"
            onClick={() => {
              dispatch(
                setStakeLoadingParams({
                  ...(stakeLoadingParams || {}),
                  modalVisible: false,
                })
              );
            }}
          >
            <Icomoon icon="close" size=".22rem" />
          </div>

          <div
            className={classNames(
              "mt-[.56rem] text-[.32rem] text-center leading-tight"
            )}
          >
            {stakeLoadingParams?.status === "success"
              ? `Your new balance is ${formatNumber(
                  stakeLoadingParams?.newTotalStakedAmount
                )} ${stakeLoadingParams?.tokenName}`
              : stakeLoadingParams?.status === "error"
              ? "Transaction Failed"
              : `You are now staking ${stakeLoadingParams?.amount} ${stakeLoadingParams?.tokenName}`}
          </div>

          <div
            className={classNames(
              "mt-[.24rem] text-[.2rem] text-text2 text-center"
            )}
          >
            {stakeLoadingParams?.status === "success"
              ? `Staking operation was successful`
              : stakeLoadingParams?.status === "error"
              ? "Something went wrong, please try again"
              : `Staking ${stakeLoadingParams?.amount} ${
                  stakeLoadingParams?.tokenName
                }, you will receive ${formatNumber(
                  stakeLoadingParams?.willReceiveAmount
                )} r${stakeLoadingParams?.tokenName}`}
          </div>

          {stakeLoadingParams?.status === "loading" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem]">
              <PrimaryLoading size="1.2rem" />
            </div>
          )}

          {stakeLoadingParams?.status === "success" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem] relative">
              <Image src={checkFileSuccess} layout="fill" alt="success" />
            </div>
          )}

          {stakeLoadingParams?.status === "error" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem] relative">
              <Image src={checkFileError} layout="fill" alt="error" />
            </div>
          )}

          {stakeLoadingParams?.scanUrl && (
            <a
              className="mt-[.57rem] text-warning text-[.24rem]"
              href={stakeLoadingParams?.scanUrl || ""}
              target="_blank"
              rel="noreferrer"
            >
              View on explorer
            </a>
          )}

          <div
            className="mt-[.24rem] flex items-center cursor-pointer"
            onClick={() => setShowDetail(!showDetail)}
          >
            <div
              className={classNames(
                "text-[.24rem]",
                showDetail ? "text-white" : "text-text1"
              )}
            >
              Details
            </div>
            <div
              className={classNames(
                "ml-[.16rem]",
                showDetail ? "-rotate-90" : "rotate-90"
              )}
            >
              <Icomoon
                icon="right"
                size="0.19rem"
                color={showDetail ? "#ffffff" : "#9DAFBE"}
              />
            </div>
          </div>

          {showDetail && (
            <div
              className="mt-[.17rem] grid rounded-[.32rem] self-stretch pt-[.3rem]"
              style={{
                gridTemplateColumns: "50% 50%",
                background: "rgba(9, 15, 23, 0.25)",
                border: "1px solid rgba(38, 73, 78, 0.5)",
                backdropFilter: "blur(.4rem)",
              }}
            >
              {/* Sending progress */}
              <StakeLoadingProgressItem
                name="Sending"
                data={stakeLoadingParams?.progressDetail?.sending}
                txHash={stakeLoadingParams?.txHash}
                scanUrl={stakeLoadingParams?.scanUrl}
              />

              {/* Staking progress */}
              <StakeLoadingProgressItem
                name="Staking"
                data={stakeLoadingParams?.progressDetail?.staking}
              />

              {/* Minting progress */}
              <StakeLoadingProgressItem
                name="Minting"
                data={stakeLoadingParams?.progressDetail?.minting}
              />

              {/* Swapping progress */}
              <StakeLoadingProgressItem
                name="Swapping"
                data={stakeLoadingParams?.progressDetail?.swapping}
              />
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};
