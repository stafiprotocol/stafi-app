import classNames from "classnames";
import { CollapseCard } from "components/common/CollapseCard";
import { EmptyContent } from "components/common/EmptyContent";
import { Icomoon } from "components/icon/Icomoon";
import { MyTooltip } from "components/common/MyTooltip";
import { useEthMyReward } from "hooks/useEthMyReward";
import { RequestStatus } from "interfaces/common";
import Image from "next/image";
import Link from "next/link";
import ethIcon from "public/eth_type_green.svg";
import closeIcon from "public/icon_close.svg";
import warningIcon from "public/icon_warning.svg";
import { useState } from "react";
import { formatNumber } from "utils/number";
import styles from "../../../styles/reth/MyData.module.scss";
import { EthRewardChart } from "../EthRewardChart";
import { MyRewardList } from "./MyRewardList";

export const MyReward = () => {
  const [showWarning, setShowWarning] = useState(true);
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
    requestStatus,
    chartXData,
    chartYData,
    totalStakedEth,
    totalStakedEthValue,
    lastEraRewardEth,
    lastEraRewardEthValue,
    totalCount,
  } = useEthMyReward(getChartDuSeconds());

  if (requestStatus === RequestStatus.success && totalCount === 0) {
    return (
      <CollapseCard
        backgroundColor="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">My Reward</div>}
      >
        <div className="flex flex-col items-center">
          <Link href="/validator/reth/choose-validator">
            <div className="flex flex-col items-center cursor-pointer">
              <EmptyContent mt="0.2rem" size=".8rem" />
              <div className="mt-[.3rem] flex items-center">
                <div className="text-text1 text-[.24rem] mr-[.1rem]">
                  Make a deposit
                </div>
                <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-[.56rem] h-[1px] bg-text3" />

        <MyRewardList />
      </CollapseCard>
    );
  }

  return (
    <CollapseCard
      backgroundColor="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={<div className="text-white text-[.32rem]">My Rewards</div>}
    >
      {showWarning && (
        <div className={styles["warning-container"]}>
          <div
            className="absolute w-[.22rem] h-[.22rem] right-[.16rem] top-[.16rem] cursor-pointer"
            onClick={() => setShowWarning(false)}
          >
            <Image src={closeIcon} layout="fill" alt="close" />
          </div>

          <div className="relative w-[.24rem] h-[.24rem] min-w-[.24rem]">
            <Image src={warningIcon} layout="fill" alt="warning" />
          </div>

          <div className="ml-[.12rem] text-[.2rem] font-[400] text-warning">
            Holding rTokens still keeps generating staking reward while you
            depositing them to farm, mine and other yield generation protocols,
            but it can&apos;t be shown in the reward as the calculation limits.
          </div>
        </div>
      )}

      <div className="flex mt-[.2rem]">
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
            +{formatNumber(lastEraRewardEth)} ETH (Last era)
          </div>

          <div className="flex items-center justify-end text-[.16rem] absolute bottom-[40px] right-[10px]">
            <div
              className={classNames(
                "mr-[.5rem] cursor-pointer",
                chartDu === "1W" ? "text-primary font-[700]" : "text-text2"
              )}
              onClick={() => setChartDu("1W")}
            >
              1W
            </div>
            <div
              className={classNames(
                "mr-[.5rem] cursor-pointer",
                chartDu === "1M" ? "text-primary font-[700]" : "text-text2"
              )}
              onClick={() => setChartDu("1M")}
            >
              1M
            </div>
            <div
              className={classNames(
                "mr-[.5rem] cursor-pointer",
                chartDu === "3M" ? "text-primary font-[700]" : "text-text2"
              )}
              onClick={() => setChartDu("3M")}
            >
              3M
            </div>
            <div
              className={classNames(
                "mr-[.5rem] cursor-pointer",
                chartDu === "6M" ? "text-primary font-[700]" : "text-text2"
              )}
              onClick={() => setChartDu("6M")}
            >
              6M
            </div>
            <div
              className={classNames(
                "cursor-pointer",
                chartDu === "ALL" ? "text-primary font-[700]" : "text-text2"
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
              "flex-1 mt-[-18px] pt-[.78rem] pl-[.56rem]"
            )}
          >
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                title="Total staked ETH value, includes validator own stakes."
                text="Total Staked Value"
              />
            </div>

            <div className="flex items-center mt-[.23rem]">
              <div className="text-[.32rem] text-white">
                ${formatNumber(totalStakedEthValue, { decimals: 2 })}
              </div>
              <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
              <div className="text-text2 text-[.18rem]">
                {formatNumber(totalStakedEth)} ETH
              </div>
            </div>

            <div className="mt-[.4rem] text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                text="Reward in last Era"
                title="rTokens will continuously generate staking rewards even when deposited in farms, mines or other yield generation methods, however, it will not be visible in the Est. Reward column as calculations are limited."
              />
            </div>

            <div className="flex items-center mt-[.23rem]">
              <div className="text-[.32rem] text-white">
                ${formatNumber(lastEraRewardEthValue, { decimals: 2 })}
              </div>
              <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
              <div className="text-text2 text-[.18rem]">
                {formatNumber(lastEraRewardEth)} ETH
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[.1rem] h-[1px] bg-text3" />

      <MyRewardList />
    </CollapseCard>
  );
};
