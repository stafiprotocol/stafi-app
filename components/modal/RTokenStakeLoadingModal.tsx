import { Box, Modal } from "@mui/material";
import classNames from "classnames";
import { PrimaryLoading } from "components/common/PrimaryLoading";
import { Icomoon } from "components/icon/Icomoon";
import { StakeLoadingProgressItem } from "components/rtoken/StakeLoadingProgressItem";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { TokenName } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import checkFileSuccess from "public/check_file_success.svg";
import checkFileError from "public/transaction_error.svg";
import { useEffect, useMemo, useState } from "react";
import {
  resetStakeLoadingParams,
  updateStakeLoadingParams,
} from "redux/reducers/AppSlice";
import { handleEthTokenStake } from "redux/reducers/EthSlice";
import { stakeMatic } from "redux/reducers/MaticSlice";
import { bond } from "redux/reducers/FisSlice";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { handleKsmStake } from "redux/reducers/KsmSlice";
import { getStakeTransactionCount } from "utils/rToken";

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
    setShowDetail(false);
  }, [stakeLoadingParams?.modalVisible]);

  const closeModal = () => {
    if (stakeLoadingParams?.status !== "loading") {
      dispatch(resetStakeLoadingParams(undefined));
    } else {
      dispatch(updateStakeLoadingParams({ modalVisible: false }));
    }
  };

  const clickRetry = () => {
    if (
      !stakeLoadingParams ||
      !stakeLoadingParams.progressDetail ||
      !stakeLoadingParams.errorStep
    ) {
      return;
    }
    const { errorStep } = stakeLoadingParams;
    const { sendingParams, stakingParams } = stakeLoadingParams.progressDetail;

    if (errorStep === "sending") {
      if (!sendingParams) {
        snackbarUtil.error("Invalid params, please retry manually");
        return;
      }
      if (stakeLoadingParams.tokenName === TokenName.ETH) {
        dispatch(
          handleEthTokenStake(
            sendingParams.tokenStandard,
            sendingParams.amount,
            sendingParams.willReceiveAmount,
            sendingParams.newTotalStakedAmount,
            true
          )
        );
      } else if (stakeLoadingParams.tokenName === TokenName.MATIC) {
        dispatch(
          stakeMatic(
            sendingParams.amount,
            sendingParams.willReceiveAmount,
            sendingParams.tokenStandard,
            sendingParams.targetAddress,
            sendingParams.newTotalStakedAmount,
            sendingParams.txFee || "0.002",
            true
          )
        );
      } else if (stakeLoadingParams.tokenName === TokenName.KSM) {
        dispatch(
          handleKsmStake(
            sendingParams.amount,
            sendingParams.willReceiveAmount,
            sendingParams.tokenStandard,
            sendingParams.targetAddress,
            sendingParams.newTotalStakedAmount,
            true
          )
        );
      }
    }

    if (errorStep === "staking") {
      if (!stakingParams) {
        snackbarUtil.error("Invalid params, please retry manually");
        return;
      }
      dispatch(
        bond(
          stakingParams.address,
          stakingParams.txHash,
          stakingParams.blockHash,
          stakingParams.amount,
          stakingParams.willReceiveAmount,
          stakingParams.poolAddress,
          stakingParams.type,
          stakingParams.chainId,
          stakingParams.targetAddress
        )
      );
    }
  };

  return (
    <Modal
      open={stakeLoadingParams?.modalVisible === true}
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
            {stakeLoadingParams?.status === "success"
              ? `Your new staking balance is ${formatNumber(
                  stakeLoadingParams?.newTotalStakedAmount
                )} ${stakeLoadingParams?.tokenName}`
              : stakeLoadingParams?.status === "error"
              ? "Transaction Failed"
              : `You are now staking ${stakeLoadingParams?.amount} ${stakeLoadingParams?.tokenName}`}
          </div>

          <div
            className={classNames(
              "mt-[.24rem] text-[.2rem] text-text2 text-center leading-[.3rem]"
            )}
          >
            {stakeLoadingParams?.customMsg
              ? stakeLoadingParams.customMsg
              : stakeLoadingParams?.status === "success"
              ? `Staking operation was successful`
              : stakeLoadingParams?.status === "error"
              ? stakeLoadingParams?.displayMsg ||
                "Something went wrong, please try again"
              : stakeLoadingParams?.displayMsg ||
                `Staking ${stakeLoadingParams?.amount} ${
                  stakeLoadingParams?.tokenName
                }, you will receive ${formatNumber(
                  stakeLoadingParams?.willReceiveAmount
                )} 
                r${stakeLoadingParams?.tokenName}${
                  getStakeTransactionCount(stakeLoadingParams?.tokenName) > 1
                    ? `, overall ${getStakeTransactionCount(
                        stakeLoadingParams?.tokenName
                      )} transactions are requested for staking transaction`
                    : ``
                }`}
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
              <Image
                src={checkFileError}
                layout="fill"
                alt="error"
                style={{ color: "#FF52C4" }}
              />
            </div>
          )}

          <div className="mt-[.42rem] flex flex-col items-center">
            {stakeLoadingParams?.scanUrl && (
              <a
                className="mt-[.15rem] text-warning text-[.24rem]"
                href={stakeLoadingParams?.scanUrl || ""}
                target="_blank"
                rel="noreferrer"
              >
                View on explorer
              </a>
            )}

            {stakeLoadingParams?.status === "error" && (
              <div
                className="mt-[.15rem] text-warning text-[.24rem] cursor-pointer"
                onClick={clickRetry}
              >
                Retry
              </div>
            )}
          </div>

          <div
            className={classNames(
              "mt-[.24rem] flex items-center cursor-pointer",
              { hidden: stakeLoadingParams?.tokenName === TokenName.ETH }
            )}
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
              {stakeLoadingParams?.steps &&
                stakeLoadingParams?.steps.includes("sending") && (
                  <StakeLoadingProgressItem
                    name="Sending"
                    stepIndex={stakeLoadingParams?.steps.indexOf("sending")}
                    tokenName={stakeLoadingParams?.tokenName}
                    data={stakeLoadingParams?.progressDetail?.sending}
                    txHash={stakeLoadingParams?.txHash}
                    scanUrl={stakeLoadingParams?.scanUrl}
                  />
                )}

              {/* Approving progress */}
              {stakeLoadingParams?.steps &&
                stakeLoadingParams?.steps.includes("approving") && (
                  <StakeLoadingProgressItem
                    name="Approving"
                    stepIndex={stakeLoadingParams?.steps.indexOf("approving")}
                    tokenName={stakeLoadingParams?.tokenName}
                    data={stakeLoadingParams?.progressDetail?.approving}
                  />
                )}

              {/* Staking progress */}
              {stakeLoadingParams?.steps &&
                stakeLoadingParams?.steps.includes("staking") && (
                  <StakeLoadingProgressItem
                    name="Staking"
                    tokenName={stakeLoadingParams?.tokenName}
                    stepIndex={stakeLoadingParams?.steps.indexOf("staking")}
                    data={stakeLoadingParams?.progressDetail?.staking}
                    scanUrl={stakeLoadingParams?.scanUrl}
                    txHash={stakeLoadingParams?.txHash}
                  />
                )}

              {/* Minting progress */}
              {stakeLoadingParams?.steps &&
                stakeLoadingParams?.steps.includes("minting") && (
                  <StakeLoadingProgressItem
                    name="Minting"
                    stepIndex={stakeLoadingParams?.steps.indexOf("minting")}
                    tokenName={stakeLoadingParams?.tokenName}
                    data={stakeLoadingParams?.progressDetail?.minting}
                  />
                )}

              {/* Swapping progress */}
              {stakeLoadingParams?.steps &&
                stakeLoadingParams?.steps.includes("swapping") && (
                  <StakeLoadingProgressItem
                    name="Swapping"
                    stepIndex={stakeLoadingParams?.steps.indexOf("swapping")}
                    tokenName={stakeLoadingParams?.tokenName}
                    data={stakeLoadingParams?.progressDetail?.swapping}
                  />
                )}
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};
