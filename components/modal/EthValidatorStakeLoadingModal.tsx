import { Box, Modal } from "@mui/material";
import classNames from "classnames";
import { Button } from "components/common/button";
import { CircularLoading } from "components/common/CircularLoading";
import { Icomoon } from "components/icon/Icomoon";
import { StakingLeftExplanation } from "components/reth/stake/StakingLeftExplanation";
import { getApiHost } from "config/env";
import { getErc20ContractConfig } from "config/erc20Contract";
import { getStafiLightNodeAbi, getStafiSuperNodeAbi } from "config/erc20Abi";
import { getEtherScanTxUrl } from "config/explorer";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useInterval } from "hooks/useInterval";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import bee from "public/bee.png";
import beeLight from "public/bee_light.png";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import { useCallback, useEffect, useState } from "react";
import {
  setEthValiatorStakeModalVisible,
  setEthValidatorStakeParams,
} from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { getShortAddress } from "utils/string";
import { createWeb3 } from "utils/web3Utils";
import styles from "../../styles/reth/CheckFile.module.scss";
import { useEthStakeCheckInterval } from "hooks/useEthStakeCheckInterval";

interface EthStakeLoadingModalProps {}

export const EthValidatorStakeLoadingModal = (
  props: EthStakeLoadingModalProps
) => {
  useEthStakeCheckInterval();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);

  const { ethValidatorStakeParams, ethValidatorStakeModalVisible } =
    useAppSelector((state: RootState) => {
      return {
        ethValidatorStakeParams: state.eth.ethValidatorStakeParams,
        ethValidatorStakeModalVisible: state.eth.ethValidatorStakeModalVisible,
      };
    });

  useEffect(() => {
    if (
      (ethValidatorStakeParams?.status === "active" ||
        ethValidatorStakeParams?.status === "error") &&
      !ethValidatorStakeModalVisible
    ) {
      dispatch(setEthValidatorStakeParams(undefined));
    }
  }, [
    dispatch,
    ethValidatorStakeModalVisible,
    ethValidatorStakeParams?.status,
  ]);

  const fetchStatus = useCallback(async () => {
    if (
      ethValidatorStakeParams?.status === "active" ||
      ethValidatorStakeParams?.status === "error"
    ) {
      return;
    }

    if (!ethValidatorStakeParams) {
      return;
    }

    const web3 = createWeb3();
    const ethContractConfig = getErc20ContractConfig();
    let contract = new web3.eth.Contract(
      ethValidatorStakeParams.type === "solo"
        ? getStafiLightNodeAbi()
        : getStafiSuperNodeAbi(),
      ethValidatorStakeParams.type === "solo"
        ? ethContractConfig.stafiLightNode
        : ethContractConfig.stafiSuperNode
    );

    const requests = ethValidatorStakeParams.pubkeys.map((pubkey) => {
      return (async () => {
        const method =
          ethValidatorStakeParams.type === "solo"
            ? contract.methods.getLightNodePubkeyStatus
            : contract.methods.getSuperNodePubkeyStatus;
        const status = await method(pubkey).call();
        console.log("statusstatus", status);
        if (Number(status) >= 3) {
          const params = {
            pubkey,
          };
          const response = await fetch(`${getApiHost()}/reth/v1/pubkeyDetail`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
          });
          const resJson = await response.json();
          if (resJson && resJson.status === "80000") {
            return resJson.data.status;
          } else {
            return "";
          }
        } else {
          return status;
        }
      })();
    });

    try {
      const statusList = await Promise.all(requests);
      // console.log("statusList", statusList);
      let changeStatus = true;
      let newStatus = "";
      statusList.every((status) => {
        console.log("status", status);

        if (status) {
          if (status === "4") {
            changeStatus = true;
            newStatus = "4";
            return false;
          }
          if (!newStatus) {
            newStatus = status;
          } else if (newStatus !== status) {
            changeStatus = false;
          }
        }
      });
      console.log("prev", newStatus);
      if (changeStatus) {
        dispatch(
          setEthValidatorStakeParams({
            ...ethValidatorStakeParams,
            status:
              Number(newStatus) === 4
                ? "error"
                : Number(newStatus) < 3
                ? "staking"
                : Number(newStatus) === 3
                ? "active"
                : Number(newStatus) < 8
                ? "staked"
                : Number(newStatus) === 8
                ? "waiting"
                : Number(newStatus) === 9
                ? "active"
                : "exit",
          })
        );
      }
    } catch (err: unknown) {}
  }, [dispatch, ethValidatorStakeParams]);

  useInterval(fetchStatus, 8000);

  return (
    <Modal
      open={ethValidatorStakeModalVisible}
      sx={{
        backgroundColor: "#0A131Bba",
      }}
    >
      <Box
        pt="0"
        pl="0"
        pr="0"
        pb="0"
        sx={{
          border: "1px solid #1A2835",
          backgroundColor: "#0A131B",
          width: "14.88rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex h-[9.65rem] items-stretch">
          <StakingLeftExplanation />

          <div className="flex-1 flex flex-col items-center">
            <div
              className="self-end mr-[.56rem] mt-[.56rem] cursor-pointer"
              onClick={() => {
                dispatch(setEthValiatorStakeModalVisible(false));
              }}
            >
              <Icomoon icon="close" size=".22rem" />
            </div>

            <div
              className={classNames(
                "mt-[.12rem] font-[700] text-[.42rem]",
                ethValidatorStakeParams?.status === "active"
                  ? "text-primary"
                  : ethValidatorStakeParams?.status === "error"
                  ? "text-error"
                  : "text-white"
              )}
            >
              {ethValidatorStakeParams?.status === "active"
                ? `${
                    Number(ethValidatorStakeParams?.pubkeys.length) * 32
                  } ETH staked successfully!`
                : ethValidatorStakeParams?.status === "error"
                ? "Transaction Failed"
                : `You are now staking ${
                    Number(ethValidatorStakeParams?.pubkeys.length) * 32
                  } ETH`}
            </div>

            <div
              className={classNames(
                "mt-[.3rem] text-[.24rem]",
                ethValidatorStakeParams?.status === "active"
                  ? "text-primary hidden"
                  : ethValidatorStakeParams?.status === "error"
                  ? "text-error"
                  : "text-text2"
              )}
            >
              {ethValidatorStakeParams?.status === "active"
                ? "You are now onboard"
                : ethValidatorStakeParams?.status === "error"
                ? "File check failed"
                : `File is uploading onchain, ${
                    Number(ethValidatorStakeParams?.pubkeys.length) * 32
                  } ETH is being staked in your account`}
            </div>

            <a
              className="mt-[.57rem] text-warning text-[.24rem]"
              href={getEtherScanTxUrl(ethValidatorStakeParams?.txHash || "")}
              target="_blank"
              rel="noreferrer"
            >
              View on Etherscan
            </a>

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

            <div className="self-stretch relative flex flex-col items-center">
              <div
                className={classNames("relative flex justify-center w-[3rem]", {
                  hidden:
                    ethValidatorStakeParams?.status === "active" ||
                    ethValidatorStakeParams?.status === "error",
                })}
              >
                <div className={styles["bee-light"]}>
                  <Image src={beeLight} layout="fill" alt="beeLight" />
                </div>
                <div className={styles.bee}>
                  <Image src={bee} layout="fill" alt="bee" />
                </div>
              </div>

              {ethValidatorStakeParams?.status === "active" && (
                <div className="mt-[.56rem] w-[1.8rem] h-[1.8rem] relative">
                  <Image src={checkFileSuccess} layout="fill" alt="success" />
                </div>
              )}

              {ethValidatorStakeParams?.status === "error" && (
                <div className="mt-[.56rem] w-[1.8rem] h-[1.8rem] relative">
                  <Image src={checkFileError} layout="fill" alt="error" />
                </div>
              )}

              {ethValidatorStakeParams?.status === "error" && (
                <Link href="/validator/reth/choose-validator">
                  <div className="mt-[.56rem] flex items-center text-[.24rem] text-text1 font-[400] cursor-pointer">
                    Reupload file now
                    <div className="ml-[.12rem]">
                      <Icomoon
                        icon="arrow-right"
                        size=".26rem"
                        color="#9DAFBE"
                      />
                    </div>
                  </div>
                </Link>
              )}

              {ethValidatorStakeParams?.status !== "active" && (
                <a
                  className="mt-[.8rem] text-link underline text-[.24rem]"
                  href="https://discord.com/invite/jB77etn"
                  target="_blank"
                  rel="noreferrer"
                >
                  Go for community help
                </a>
              )}

              {ethValidatorStakeParams?.status === "active" && (
                <div className="self-stretch mx-[.75rem] mt-[.56rem]">
                  <Button
                    fontSize="0.32rem"
                    onClick={() => {
                      dispatch(setEthValiatorStakeModalVisible(false));
                      router.push("/validator/reth/token-stake?tab=staked");
                    }}
                  >
                    Go Check My Stake
                  </Button>
                </div>
              )}

              {showDetail && (
                <div className={styles["detail-container"]}>
                  <div className={styles["detail-item"]}>
                    <div className="flex items-center">
                      <div className={styles["detail-indicator-dot"]} />
                      <div className="text-active text-[.2rem] font-[700] ml-[.08rem]">
                        Stake
                      </div>

                      {ethValidatorStakeParams?.status === "staking" ? (
                        <div className="ml-[.26rem]">
                          <CircularLoading color="info" size=".24rem" />
                        </div>
                      ) : (
                        <div className="ml-[.26rem]">
                          <Icomoon icon="nike" size=".27rem" color="#0095EB" />
                        </div>
                      )}
                    </div>

                    <div
                      className={classNames(
                        "ml-[.32rem] mt-[.14rem] text-active text-[.16rem]",
                        ethValidatorStakeParams?.txHash ? "" : "hidden"
                      )}
                    >
                      <div>Broadcasting...</div>
                      <div className="mt-[.08rem]">Packing...</div>
                      <div className="mt-[.08rem]">
                        Check Tx{" "}
                        <a
                          className="underline"
                          href={getEtherScanTxUrl(
                            ethValidatorStakeParams?.txHash || ""
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {getShortAddress(ethValidatorStakeParams?.txHash, 4)}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className={styles["detail-item"]}>
                    <div className="flex items-center">
                      <div
                        className={styles["detail-indicator-dot"]}
                        style={{
                          border:
                            ethValidatorStakeParams?.status !== "staking"
                              ? "solid 1px #0095eb"
                              : "solid 1px #ffffff",
                        }}
                      />
                      <div
                        className={classNames(
                          "text-[.2rem] font-[700] ml-[.08rem]",
                          ethValidatorStakeParams?.status !== "staking"
                            ? "text-active"
                            : "text-white"
                        )}
                      >
                        Wait
                      </div>

                      {(ethValidatorStakeParams?.status === "staked" ||
                        ethValidatorStakeParams?.status === "waiting") && (
                        <div className="ml-[.26rem]">
                          <CircularLoading color="info" size=".24rem" />
                        </div>
                      )}

                      {ethValidatorStakeParams?.status === "active" && (
                        <div className="ml-[.26rem]">
                          <Icomoon icon="nike" size=".27rem" color="#0095EB" />
                        </div>
                      )}
                    </div>

                    <div className="ml-[.32rem] mt-[.14rem] text-active text-[.16rem]">
                      {/* {status === "error" && (
                        <div className="text-error">Error</div>
                      )} */}
                    </div>
                  </div>

                  <div className={classNames(styles["detail-item"], "hidden")}>
                    <div className="flex items-center">
                      <div
                        className={styles["detail-indicator-dot"]}
                        style={{
                          border:
                            ethValidatorStakeParams?.status === "active"
                              ? "solid 1px #0095eb"
                              : "solid 1px #ffffff",
                        }}
                      />
                      <div
                        className={classNames(
                          "text-[.2rem] font-[700] ml-[.08rem]",
                          ethValidatorStakeParams?.status === "active"
                            ? "text-active"
                            : "text-white"
                        )}
                      >
                        Active
                      </div>

                      {/* {status === "loading" && (
                        <div className="ml-[.26rem]">
                          <CustomLoading color="#0095EB" size=".24rem" />
                        </div>
                      )} */}

                      {ethValidatorStakeParams?.status === "active" && (
                        <div className="ml-[.26rem]">
                          <Icomoon icon="nike" size=".27rem" color="#0095EB" />
                        </div>
                      )}
                    </div>

                    <div className="ml-[.32rem] mt-[.14rem] text-active text-[.16rem]">
                      {/* {status === "error" && (
                        <div className="text-error">Error</div>
                      )} */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
