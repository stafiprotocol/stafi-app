import classNames from "classnames";
import { CollapseCard } from "components/CollapseCard";
import { EmptyContent } from "components/EmptyContent";
import { Icomoon } from "components/Icomoon";
import { useEthMyReward } from "hooks/useEthMyReward";
import { RequestStatus } from "interfaces";
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
  const {
    requestStatus,
    chartXData,
    chartYData,
    totalStakedEth,
    totalStakedEthValue,
    lastEraRewardEth,
    lastEraRewardEthValue,
    rewardList,
    totalCount,
  } = useEthMyReward();

  const [showWarning, setShowWarning] = useState(true);

  if (requestStatus === RequestStatus.success && totalCount === 0) {
    return (
      <CollapseCard
        backgroundColor="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">My Reward</div>}
      >
        <div className="flex flex-col items-center">
          <EmptyContent mt="0.2rem" size=".8rem" />
          <Link href="/reth/choose-validator">
            <div className="mt-[.3rem] flex items-center cursor-pointer">
              <div className="text-text1 text-[.24rem] mr-[.1rem]">
                Make a deposit
              </div>
              <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
            </div>
          </Link>
        </div>

        <div className="mt-[.56rem] h-[1px] bg-text3" />

        <MyRewardList
          rewardList={rewardList}
          totalCount={totalCount}
          requestStatus={requestStatus}
        />
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
            but it can&apos;t be shown in the est.Reward as the calculation
            limits.
          </div>
        </div>
      )}

      <div className="flex mt-[.2rem]">
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
              "flex-1 mt-[-18px] pt-[.78rem] pl-[.56rem]"
            )}
          >
            <div className="text-text2 text-[.24rem] flex items-center">
              <div className="mr-[.08rem]">Total Staked Value</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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
              <div className="mr-[.08rem]">Reward in last Era</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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

      <MyRewardList
        rewardList={rewardList}
        totalCount={totalCount}
        requestStatus={requestStatus}
      />
    </CollapseCard>
  );
};
