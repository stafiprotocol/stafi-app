import classNames from "classnames";
import { Card } from "components/card";
import { Icomoon } from "components/Icomoon";
import { EthRewardChart } from "components/reth/EthRewardChart";
import { hooks } from "connectors/metaMask";
import { ReactElement } from "react";
import { useAppDispatch } from "hooks/common";
import { useEthPubkeyDetail } from "hooks/useEthPubkeyDetail";
import Image from "next/image";
import { useRouter } from "next/router";
import ethIcon from "public/eth_type_green.svg";
import arrowPath from "public/path_arrow.svg";
import rectangle from "public/rectangle1.svg";
import { useState } from "react";
import { formatNumber } from "utils/number";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import styles from "../../../styles/reth/PubkeyDetail.module.scss";
import { RethLayout } from "components/layout_reth";
import { RethStakeLayout } from "components/layout_reth_stake";
import { EmptyContent } from "components/EmptyContent";

const PubkeyDetail = () => {
  const router = useRouter();
  const { pubkey } = router.query;
  const { useAccount, useChainId } = hooks;

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
  } = useEthPubkeyDetail(pubkey as string);

  const getStatusText = (status: string) => {
    if (status === "2") {
      return "Deposited";
    }
    if (status === "3") {
      return "Staked";
    }
    if (status === "4") {
      return "Unmatched";
    }
    if (status === "8") {
      return "Waiting";
    }
    if (status === "9") {
      return "Active";
    }
    if (status === "10") {
      return "Exit";
    }
    return "";
  };

  return (
    <div className="pt-[.1rem]">
      <Card mt=".56rem" backgroundColor="#0A131B">
        <div className="flex flex-col items-stretch px-[.56rem] pb-[1rem]">
          <div className="self-center relative w-[2.4rem] h-[.9rem]">
            <Image src={rectangle} layout="fill" alt="rectangle" />
          </div>

          <div className="text-center mt-[0rem] text-white font-[700] text-[.42rem]">
            Public Key Detail
          </div>

          <div
            className={
              Number(status) === 9
                ? styles["active-status"]
                : Number(status) === 8
                ? styles["exit-status"]
                : styles["pending-status"]
            }
          >
            <Icomoon
              icon={
                Number(status) === 9
                  ? "active"
                  : Number(status) === 8
                  ? "exit"
                  : "pending"
              }
              size="0.36rem"
            />
            <div>{getStatusText(status + "")}</div>
          </div>

          <div className={classNames(styles["card-container"], "mt-[.36rem]")}>
            <div className="flex justify-between items-start px-[.5rem]">
              <div className="flex flex-col items-center">
                <div
                  className={classNames(
                    Number(status) >= 1
                      ? styles["status-dot-active"]
                      : styles["status-dot"]
                  )}
                />
                <div
                  className={classNames(
                    "text-active text-[.24rem] mt-[.16rem]"
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
                    Number(status) === 8 || Number(status) === 9
                      ? styles["status-dot-active"]
                      : styles["status-dot"]
                  )}
                />
                <div
                  className={classNames(
                    "text-[.24rem] mt-[.16rem]",
                    Number(status) === 8 || Number(status) === 9
                      ? "text-active"
                      : "text-text2"
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
                    Number(status) === 8
                      ? styles["status-dot-active"]
                      : styles["status-dot"]
                  )}
                />
                <div
                  className={classNames(
                    "text-[.24rem] mt-[.16rem]",
                    Number(status) === 8 ? "text-active" : "text-text2"
                  )}
                >
                  Exit
                </div>
              </div>
            </div>
          </div>

          <div
            className={classNames(
              classNames(styles["card-container"], "mt-[.36rem]")
            )}
          >
            <div className="flex items-center justify-between mx-[.56rem]">
              <div className="flex items-center">
                <div className="text-white text-[.32rem]">Address:</div>

                <div className="mt-[2px] ml-[.2rem] mr-[.1rem] text-text2 text-[.24rem]">
                  {getShortAddress(pubkey as string, 20)}
                </div>

                <div
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(pubkey as string).then(() => {
                      snackbarUtil.success("Copied");
                    });
                  }}
                >
                  <Icomoon icon="copy" size="0.2rem" color="#5B6872" />
                </div>
              </div>

              <div className="rotate-90">
                <Icomoon icon="right" size="0.19rem" color="#ffffff" />
              </div>
            </div>

            <div className="mt-[.8rem] mb-[.23rem] flex">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Current Balance</div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  {formatNumber(currentBalance)} ETH
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  $ {formatNumber(currentBalanceValue, { decimals: 2 })}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <div className="mr-[.08rem]">Deposit Balance</div>
                  <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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
          </div>

          <div
            className={classNames(
              classNames(styles["card-container"], "mt-[.36rem]")
            )}
          >
            <div className="ml-[.56rem] text-white font-[700] text-[.32rem]">
              Income
            </div>
            <div className="flex">
              <div className="relative w-[340px]">
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
                  +0.0006 ETH (Last era)
                </div>

                <div className="flex items-center text-[.16rem] absolute bottom-[40px] right-[10px]">
                  <div className="text-text2 mr-[.5rem]">1W</div>
                  <div className="text-text2 mr-[.5rem]">1M</div>
                  <div className="text-text2 mr-[.5rem]">3M</div>
                  <div className="text-text2 mr-[.5rem]">6M</div>
                  <div className="text-primary font-[700]">ALL</div>
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
                    <div className="mr-[.08rem]">APR</div>
                    <Icomoon icon="question" size="0.16rem" color="#5B6872" />
                  </div>

                  <div className="flex items-center mt-[.23rem]">
                    <div className="text-[.32rem] text-white">{apr}%</div>
                    <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
                    <div className="text-text2 text-[.18rem]">
                      estimated based on the last 7 days
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

          <div
            className={classNames(
              classNames(styles["card-container"], "mt-[.36rem]")
            )}
          >
            <div className="flex items-center justify-between mx-[.56rem]">
              <div className="text-white text-[.32rem]">History</div>

              <div className="rotate-90">
                <Icomoon icon="right" size="0.19rem" color="#ffffff" />
              </div>
            </div>

            <div className="mt-[.8rem] mb-[.23rem] flex">
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
          </div>
        </div>
      </Card>
    </div>
  );
};

PubkeyDetail.getLayout = (page: ReactElement) => {
  return <RethLayout>{page}</RethLayout>;
};

export default PubkeyDetail;
