import { Box, Modal } from "@mui/material";
import classNames from "classnames";
import { PrimaryLoading } from "components/common/PrimaryLoading";
import { Icomoon } from "components/icon/Icomoon";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import { useRouter } from "next/router";
import checkFileSuccess from "public/check_file_success.svg";
import checkFileError from "public/transaction_error.svg";
import { useState } from "react";
import { setBridgeSwapLoadingParams } from "redux/reducers/BridgeSlice";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";

export const RBridgeSwapLoadingModal = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);

  const { bridgeSwapLoadingParams } = useAppSelector((state: RootState) => {
    return {
      bridgeSwapLoadingParams: state.bridge.bridgeSwapLoadingParams,
    };
  });

  const closeModal = () => {
    if (bridgeSwapLoadingParams?.status !== "loading") {
      dispatch(setBridgeSwapLoadingParams(undefined));
    } else {
      dispatch(setBridgeSwapLoadingParams({ modalVisible: false }));
    }
  };

  return (
    <Modal
      open={bridgeSwapLoadingParams?.modalVisible === true}
      onClose={closeModal}
      sx={{
        backgroundColor: "#0A131Bba",
      }}
    >
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
            onClick={closeModal}
          >
            <Icomoon icon="close" size=".22rem" />
          </div>

          <div
            className={classNames(
              "mt-[.56rem] text-[.32rem] text-center leading-normal"
            )}
          >
            {bridgeSwapLoadingParams?.status === "success"
              ? `Swap Success`
              : bridgeSwapLoadingParams?.status === "error"
              ? "Swap Failed"
              : `You are now swapping ${Number(
                  bridgeSwapLoadingParams?.swapAmount
                )} ${bridgeSwapLoadingParams?.tokenName} from ${
                  bridgeSwapLoadingParams?.srcTokenStandard
                } to ${bridgeSwapLoadingParams?.dstTokenStandard}`}
          </div>

          <div
            className={classNames(
              "mt-[.24rem] text-[.2rem] text-text2 text-center leading-[.3rem]"
            )}
          >
            {bridgeSwapLoadingParams?.status === "success"
              ? `Swap operation was successful.`
              : bridgeSwapLoadingParams?.status === "error"
              ? "Something went wrong, please try again"
              : `You will receive ${formatNumber(
                  bridgeSwapLoadingParams?.swapAmount
                )} ${bridgeSwapLoadingParams?.dstTokenStandard} ${
                  bridgeSwapLoadingParams?.tokenName
                }`}
          </div>

          {bridgeSwapLoadingParams?.status === "loading" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem]">
              <PrimaryLoading size="1.2rem" />
            </div>
          )}

          {bridgeSwapLoadingParams?.status === "success" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem] relative">
              <Image src={checkFileSuccess} layout="fill" alt="success" />
            </div>
          )}

          {bridgeSwapLoadingParams?.status === "error" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem] relative">
              <Image
                src={checkFileError}
                layout="fill"
                alt="error"
                style={{ color: "#FF52C4" }}
              />
            </div>
          )}

          <div className="mt-[.42rem] flex flex-col items-center">
            {bridgeSwapLoadingParams?.scanUrl && (
              <a
                className="mt-[.15rem] text-warning text-[.24rem]"
                href={bridgeSwapLoadingParams?.scanUrl || ""}
                target="_blank"
                rel="noreferrer"
              >
                View on explorer
              </a>
            )}

            {/* {redeemLoadingParams?.status === "error" && (
              <div
                className="mt-[.15rem] text-warning text-[.24rem] cursor-pointer"
                onClick={clickRetry}
              >
                Retry
              </div>
            )} */}
          </div>
        </div>
      </Box>
    </Modal>
  );
};
