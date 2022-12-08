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
  setRedeemLoadingParams,
  updateStakeLoadingParams,
} from "redux/reducers/AppSlice";
import { handleEthTokenStake } from "redux/reducers/EthSlice";
import {
  unbondRMatic,
} from "redux/reducers/MaticSlice";
import { updateRTokenBalance } from "redux/reducers/RTokenSlice";
import { bond } from "redux/reducers/FisSlice";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { RedeemLoadingProgressItem } from "components/rtoken/RedeemLoadingProgressItem";

export const RTokenRedeemLoadingModal = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);

  const { redeemLoadingParams } = useAppSelector((state: RootState) => {
    return {
      redeemLoadingParams: state.app.redeemLoadingParams,
    };
  });

  useEffect(() => {
    setShowDetail(false);
  }, [redeemLoadingParams?.modalVisible]);

  const closeModal = () => {
    if (redeemLoadingParams?.status !== "loading") {
      dispatch(setRedeemLoadingParams(undefined));
    } else {
      dispatch(setRedeemLoadingParams({ modalVisible: false }));
    }
  };

  const clickRetry = () => {
    if (!redeemLoadingParams) {
      return;
    }

    if (redeemLoadingParams.tokenName === TokenName.MATIC) {
      const { amount, targetAddress, willReceiveAmount, newTotalStakedAmount } =
        redeemLoadingParams;

      if (
        !amount ||
        !targetAddress ||
        !willReceiveAmount ||
        !newTotalStakedAmount
      ) {
        snackbarUtil.error("Invalid params, please retry manually");
        return;
      }
      dispatch(
        unbondRMatic(
          amount as string,
          targetAddress as string,
          willReceiveAmount as string,
          newTotalStakedAmount
        )
      );
    }
  };

  return (
    <Modal
      open={redeemLoadingParams?.modalVisible === true}
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
            {redeemLoadingParams?.status === "success"
              ? `Your new staking balance is ${formatNumber(
                  redeemLoadingParams?.newTotalStakedAmount
                )} ${redeemLoadingParams?.tokenName}`
              : redeemLoadingParams?.status === "error"
              ? "Transaction Failed"
              : `You are now unstaking ${redeemLoadingParams?.amount} r${redeemLoadingParams?.tokenName}`}
          </div>

          <div
            className={classNames(
              "mt-[.24rem] text-[.2rem] text-text2 text-center leading-[.3rem]"
            )}
          >
            {redeemLoadingParams?.status === "success"
              ? `Unstake operation was successful`
              : redeemLoadingParams?.status === "error"
              ? redeemLoadingParams?.errorMsg ||
                "Something went wrong, please try again"
              : `Unstake ${redeemLoadingParams?.amount} r${
                  redeemLoadingParams?.tokenName
                }, you will receive ${formatNumber(
                  redeemLoadingParams?.willReceiveAmount
                )} ${redeemLoadingParams?.tokenName}`}
          </div>

          {redeemLoadingParams?.status === "loading" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem]">
              <PrimaryLoading size="1.2rem" />
            </div>
          )}

          {redeemLoadingParams?.status === "success" && (
            <div className="mt-[.56rem] w-[1.2rem] h-[1.2rem] relative">
              <Image src={checkFileSuccess} layout="fill" alt="success" />
            </div>
          )}

          {redeemLoadingParams?.status === "error" && (
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
            {redeemLoadingParams?.scanUrl && (
              <a
                className="mt-[.15rem] text-warning text-[.24rem]"
                href={redeemLoadingParams?.scanUrl || ""}
                target="_blank"
                rel="noreferrer"
              >
                View on explorer
              </a>
            )}

            {redeemLoadingParams?.status === "error" && (
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
              { hidden: redeemLoadingParams?.tokenName === TokenName.ETH }
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
              <RedeemLoadingProgressItem
							name="Sending"
							stepIndex={1}
                tokenName={redeemLoadingParams?.tokenName}
                data={redeemLoadingParams}
                txHash={redeemLoadingParams?.txHash}
                scanUrl={redeemLoadingParams?.scanUrl}
              />

              {/* Unstaking progress */}
              <RedeemLoadingProgressItem
							stepIndex={2}
							name="Unstaking"
                tokenName={redeemLoadingParams?.tokenName}
                data={{
									...redeemLoadingParams,
									status: redeemLoadingParams?.status === 'success' ? 'success' : undefined,
									broadcastStatus: redeemLoadingParams?.status === 'success' ? 'success' : undefined,
									packStatus: redeemLoadingParams?.status === 'success' ? 'success' : undefined,
									finalizeStatus: redeemLoadingParams?.status === 'success' ? 'success' : undefined,
								}}
              />
            </div>
          )}
        </div>
      </Box>
    </Modal>
  );
};
