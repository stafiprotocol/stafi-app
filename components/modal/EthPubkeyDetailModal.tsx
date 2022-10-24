import { Dialog, DialogContent } from "@mui/material";
import classNames from "classnames";
import { Card } from "components/card";
import { CollapseCard } from "components/CollapseCard";
import { EmptyContent } from "components/EmptyContent";
import { Icomoon } from "components/Icomoon";
import { MyTooltip } from "components/MyTooltip";
import { EthRewardChart } from "components/reth/EthRewardChart";
import { useEthPubkeyDetail } from "hooks/useEthPubkeyDetail";
import Image from "next/image";
import ethIcon from "public/eth_type_green.svg";
import arrowPath from "public/path_arrow.svg";
import rectangle from "public/rectangle1.svg";
import { useState } from "react";
import { getEthPubkeyStatusText } from "utils/eth";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import styles from "../../styles/reth/PubkeyDetail.module.scss";

interface EthPubkeyDetailModalProps {
  pubkey: string;
  visible: boolean;
  onClose: () => void;
}

export const EthPubkeyDetailModal = (props: EthPubkeyDetailModalProps) => {
  const { pubkey } = props;
  const [chartDu, setChartDu] = useState<"1W" | "1M" | "3M" | "6M" | "ALL">(
    "ALL"
  );

  const getChartDuSeconds = () => {
    if (chartDu === "1W") {
      return 24 * 3600 * 7;
    } else if (chartDu === "1M") {
      return 24 * 3600 * 30;
    } else if (chartDu === "3M") {
      return 24 * 3600 * 90;
    } else if (chartDu === "6M") {
      return 24 * 3600 * 180;
    }
    return 0;
  };

  const {
    status,
    currentBalance,
    currentBalanceValue,
    depositBalance,
    depositBalanceValue,
    effectiveBalance,
    effectiveBalanceValue,
    apr,
    last24hRewardEth,
    last24hRewardEthValue,
    eligibleDays,
    eligibleEpoch,
    activeDays,
    activeEpoch,
    chartXData,
    chartYData,
  } = useEthPubkeyDetail(pubkey as string, getChartDuSeconds());

  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      scroll="paper"
      sx={{
        borderRadius: "0.16rem",
        background: "transparent",
        "& .MuiDialog-container": {
          padding: "0",
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "14.88rem", // Set your width here
            backgroundColor: "transparent",
            padding: "0",
          },
          "& .MuiDialogContent-root": {
            padding: "0",
          },
        },
      }}
    >
      {/* <div
        className="pt-[.1rem] w-[14.88rem]"
        style={{
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          overflow: "auto",
          height: "100%",
        }}
      > */}
      <DialogContent sx={{ width: "14.88rem" }}>
        <Card mt=".56rem" mb=".56rem" backgroundColor="#0A131B">
          <div className="flex flex-col items-stretch px-[.56rem] pb-[1rem] overflow-auto relative">
            <div className="self-center relative w-[2.4rem] h-[.9rem]">
              <Image src={rectangle} layout="fill" alt="rectangle" />
            </div>

            <div
              className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
              onClick={props.onClose}
            >
              <Icomoon icon="close" size="0.24rem" color="#5B6872" />
            </div>

            <div className="text-center mt-[0rem] text-white font-[700] text-[.42rem]">
              Public Key Detail
            </div>

            <div
              className={
                Number(status) === 9
                  ? styles["active-status"]
                  : Number(status) === 4
                  ? styles["exit-status"]
                  : styles["pending-status"]
              }
            >
              <Icomoon
                icon={
                  Number(status) === 9
                    ? "active"
                    : Number(status) === 4
                    ? "exit"
                    : "pending"
                }
                size="0.36rem"
              />
              <div>{getEthPubkeyStatusText(status + "")}</div>
            </div>

            <div
              className={classNames(styles["card-container"], "mt-[.36rem]")}
            >
              <div className="flex justify-between items-start px-[.5rem]">
                <div className="flex flex-col items-center">
                  <div
                    className={classNames(
                      Number(status) >= 1 && Number(status) !== 4
                        ? styles["status-dot-active"]
                        : styles["status-dot"]
                    )}
                  />
                  <div
                    className={classNames(
                      "text-[.24rem] mt-[.16rem]",
                      Number(status) >= 1 && Number(status) !== 4
                        ? "text-active"
                        : "text-text2"
                    )}
                  >
                    Deposited
                  </div>
                </div>

                <div className="w-[1.8rem] h-[.1rem] relative mt-[.08rem]">
                  <Image src={arrowPath} alt="path" layout="fill" />
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={classNames(
                      Number(status) > 2 && Number(status) !== 4
                        ? styles["status-dot-active"]
                        : styles["status-dot"]
                    )}
                  />
                  <div
                    className={classNames(
                      "text-[.24rem] mt-[.16rem]",
                      Number(status) > 2 && Number(status) !== 4
                        ? "text-active"
                        : "text-text2"
                    )}
                  >
                    Staked
                  </div>
                </div>

                <div className="w-[1.8rem] h-[.1rem] relative mt-[.08rem]">
                  <Image src={arrowPath} alt="path" layout="fill" />
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={classNames(
                      Number(status) > 4
                        ? styles["status-dot-active"]
                        : styles["status-dot"]
                    )}
                  />
                  <div
                    className={classNames(
                      "text-[.24rem] mt-[.16rem]",
                      Number(status) > 4 ? "text-active" : "text-text2"
                    )}
                  >
                    Waiting
                  </div>
                </div>

                <div className="w-[1.8rem] h-[.1rem] relative mt-[.08rem]">
                  <Image src={arrowPath} alt="path" layout="fill" />
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={classNames(
                      Number(status) === 9
                        ? styles["status-dot-active"]
                        : styles["status-dot"]
                    )}
                  />
                  <div
                    className={classNames(
                      "text-[.24rem] mt-[.16rem]",
                      Number(status) === 9 ? "text-active" : "text-text2"
                    )}
                  >
                    Active
                  </div>
                </div>

                <div className="w-[1.8rem] h-[.1rem] relative mt-[.08rem]">
                  <Image src={arrowPath} alt="path" layout="fill" />
                </div>

                <div className="flex flex-col items-center">
                  <div
                    className={classNames(
                      Number(status) === 10
                        ? styles["status-dot-active"]
                        : styles["status-dot"]
                    )}
                  />
                  <div
                    className={classNames(
                      "text-[.24rem] mt-[.16rem]",
                      Number(status) === 10 ? "text-active" : "text-text2"
                    )}
                  >
                    Exit
                  </div>
                </div>
              </div>
            </div>

            <CollapseCard
              backgroundColor="rgba(26, 40, 53, 0.2)"
              mt=".36rem"
              title={
                <div className="flex items-center">
                  <div className="text-white text-[.32rem]">Address:</div>

                  <div className="mt-[2px] ml-[.2rem] mr-[.1rem] text-text2 text-[.24rem]">
                    {getShortAddress(pubkey as string, 20)}
                  </div>

                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      navigator.clipboard
                        .writeText(pubkey as string)
                        .then(() => {
                          snackbarUtil.success("Copied");
                        });
                    }}
                  >
                    <Icomoon icon="copy" size="0.2rem" color="#5B6872" />
                  </div>
                </div>
              }
            >
              <div className="mt-[.4rem] mb-[.23rem] flex">
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-text2 text-[.24rem]">
                    Current Balance
                  </div>

                  <div className="mt-[.23rem] text-white text-[.32rem]">
                    {formatNumber(currentBalance)} ETH
                  </div>

                  <div className="mt-[.16rem] text-text2 text-[.24rem]">
                    $ {formatNumber(currentBalanceValue, { decimals: 2 })}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-text2 text-[.24rem] flex items-center">
                    <MyTooltip
                      title="Overall deposited ETH amount"
                      text="Deposit Balance"
                    />
                  </div>

                  <div className="mt-[.23rem] text-primary text-[.32rem]">
                    {formatNumber(depositBalance)} ETH
                  </div>

                  <div className="mt-[.16rem] text-text2 text-[.24rem]">
                    $ {formatNumber(depositBalanceValue, { decimals: 2 })}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-text2 text-[.24rem] flex items-center">
                    <div className="mr-[.08rem]">Effective Balance</div>
                    <Icomoon icon="question" size="0.16rem" color="#5B6872" />
                  </div>

                  <div className="mt-[.23rem] text-primary text-[.32rem]">
                    {formatNumber(effectiveBalance)} ETH
                  </div>

                  <div className="mt-[.16rem] text-text2 text-[.24rem]">
                    $ {formatNumber(effectiveBalanceValue, { decimals: 2 })}
                  </div>
                </div>
              </div>
            </CollapseCard>

            <div
              className={classNames(
                classNames(styles["card-container"], "mt-[.36rem]")
              )}
            >
              <div className="ml-[.56rem] text-white font-[700] text-[.32rem]">
                Income
              </div>
              <div className="flex">
                <div className="relative w-[340px] ml-[.56rem]">
                  {chartXData.length === 0 && (
                    <div className="absolute left-[.56rem] right-0 flex justify-center top-[140px]">
                      <EmptyContent size="0.6rem" />
                    </div>
                  )}

                  <EthRewardChart
                    width="340px"
                    height="330px"
                    xData={chartXData}
                    yData={chartYData}
                  />

                  <div className="text-[.18rem] text-text2 absolute left-[.64rem] top-[33px]">
                    +{formatNumber(last24hRewardEth)} ETH (Last era)
                  </div>

                  <div className="flex items-center justify-end text-[.16rem] absolute bottom-[40px] right-[10px]">
                    <div
                      className={classNames(
                        "mr-[.5rem] cursor-pointer",
                        chartDu === "1W"
                          ? "text-primary font-[700]"
                          : "text-text2"
                      )}
                      onClick={() => setChartDu("1W")}
                    >
                      1W
                    </div>
                    <div
                      className={classNames(
                        "mr-[.5rem] cursor-pointer",
                        chartDu === "1M"
                          ? "text-primary font-[700]"
                          : "text-text2"
                      )}
                      onClick={() => setChartDu("1M")}
                    >
                      1M
                    </div>
                    <div
                      className={classNames(
                        "mr-[.5rem] cursor-pointer",
                        chartDu === "3M"
                          ? "text-primary font-[700]"
                          : "text-text2"
                      )}
                      onClick={() => setChartDu("3M")}
                    >
                      3M
                    </div>
                    <div
                      className={classNames(
                        "mr-[.5rem] cursor-pointer",
                        chartDu === "6M"
                          ? "text-primary font-[700]"
                          : "text-text2"
                      )}
                      onClick={() => setChartDu("6M")}
                    >
                      6M
                    </div>
                    <div
                      className={classNames(
                        "cursor-pointer",
                        chartDu === "ALL"
                          ? "text-primary font-[700]"
                          : "text-text2"
                      )}
                      onClick={() => setChartDu("ALL")}
                    >
                      ALL
                    </div>
                  </div>
                </div>

                <div className="ml-[1.8rem] mr-[.56rem] mt-[35px] flex-1 h-[253px] flex flex-col">
                  <div className="w-[36px] h-[36px] self-center relative z-10">
                    <Image src={ethIcon} alt="eth" layout="fill" />
                  </div>
                  <div
                    className={classNames(
                      styles["eth-reward-container"],
                      "flex-1 mt-[-18px] pl-[.56rem] pt-[.78rem]"
                    )}
                  >
                    <div className="text-text2 text-[.24rem] flex items-center">
                      <MyTooltip
                        title="APR estimated based on the last 7 days"
                        text="APR"
                      />
                    </div>

                    <div className="flex items-center mt-[.23rem]">
                      <div className="text-[.32rem] text-white">
                        {formatNumber(apr, { decimals: 2 })}%
                      </div>
                      <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
                      <div className="text-text2 text-[.18rem]">
                        est. last 7 days
                      </div>
                    </div>

                    <div className="mt-[.4rem] text-text2 text-[.24rem] flex items-center">
                      <div className="mr-[.08rem]">Income in last 24hr</div>
                      <Icomoon icon="question" size="0.16rem" color="#5B6872" />
                    </div>

                    <div className="flex items-center mt-[.23rem]">
                      <div className="text-[.32rem] text-white">
                        {formatNumber(last24hRewardEth)} ETH
                      </div>
                      <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
                      <div className="text-text2 text-[.18rem]">
                        ${formatNumber(last24hRewardEthValue, { decimals: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CollapseCard
              backgroundColor="rgba(26, 40, 53, 0.2)"
              mt=".36rem"
              title={<div className="text-white text-[.32rem]">History</div>}
            >
              <div className="mt-[.4rem] mb-[.23rem] flex">
                <div className="flex-1 flex flex-col items-center">
                  <div className="text-text2 text-[.24rem]">
                    Eligible for Activation
                  </div>

                  <div className="mt-[.23rem] text-white text-[.32rem]">
                    {eligibleDays} days ago
                  </div>

                  <div className="mt-[.16rem] text-text2 text-[.24rem]">
                    Epoch {eligibleEpoch}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-text2 text-[.24rem] flex items-center">
                    <div className="mr-[.08rem]">Active Since</div>
                  </div>

                  <div className="mt-[.23rem] text-white text-[.32rem]">
                    {activeDays} days ago
                  </div>

                  <div className="mt-[.16rem] text-text2 text-[.24rem]">
                    Epoch {activeEpoch}
                  </div>
                </div>
              </div>
            </CollapseCard>
          </div>
        </Card>
      </DialogContent>
      {/* </div> */}
    </Dialog>
  );
};
