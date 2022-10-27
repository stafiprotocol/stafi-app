import classNames from "classnames";
import { EmptyContent } from "components/common/EmptyContent";
import { Icomoon } from "components/icon/Icomoon";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { PrimaryLoading } from "components/common/PrimaryLoading";
import dayjs from "dayjs";
import { useEthMyRewardList } from "hooks/useEthMyRewardList";
import { RequestStatus } from "interfaces";
import Link from "next/link";
import { useState } from "react";
import { formatNumber } from "utils/number";
import { openLink } from "utils/common";
import Web3 from "web3";
import styles from "../../../styles/reth/MyData.module.scss";

interface MyRewardListProps { }

export const MyRewardList = (props: MyRewardListProps) => {
  const [page, setPage] = useState(1);
  const { requestStatus, rewardList, totalCount } = useEthMyRewardList(page);

  return (
    <div className="relative">
      {requestStatus === RequestStatus.loading && (
        <div className="flex justify-center absolute left-0 right-0 top-[1.2rem]">
          <PrimaryLoading size="1rem" />
        </div>
      )}

      <div className="mx-[.56rem] flex items-center mt-[.76rem]">
        <div className="text-white text-[.32rem]">Reward Details</div>

        <div
          className="text-text2 text-[.24rem] ml-[.16rem] cursor-pointer"
          onClick={() => {
            openLink(
              "https://docs.stafi.io/rtoken-app/reth-solution/original-validator-faq#1.ov-commission-and-reward-related-reth"
            );
          }}
        >
          <Icomoon icon="question" size="0.16rem" color="#5B6872" />
        </div>
      </div>

      {totalCount === 0 && (
        <div className="flex flex-col items-center">
          <Link href="/validator/reth/choose-validator">
            <div className="flex flex-col items-center cursor-pointer">
              <EmptyContent mt="0.76rem" size=".8rem" />
              <div className="mt-[.3rem] flex items-center">
                <div className="text-text1 text-[.24rem] mr-[.1rem]">
                  Make a deposit
                </div>
                <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {rewardList.length > 0 && (
        <div
          className={classNames(
            styles["my-reward-table-item"],
            "mt-[.2rem] h-[1rem]"
          )}
        >
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text2">Time</div>
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center text-text2 text-[.2rem]">
              <MyTooltip
                text="Total-staked ETH"
                title="The amount of validators staked ETH and stakers staked ETH"
              />
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center text-text2 text-[.2rem]">
              <MyTooltip
                text="Self-staked ETH"
                title="The amount of validators staked ETH"
              />
            </section>
          </div>
          {/* <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center text-[.2rem] text-text2">
              <MyTooltip title="Commission Fee" text="Commission" />
            </section>
          </div> */}
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center text-[.2rem] text-text2">
              <MyTooltip
                text="Total-staked Reward"
                title="The reward that includes validators staked ETH and stakers staked ETH"
              />
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center text-[.2rem] text-text2">
              <MyTooltip
                text="Self-staked Reward"
                title="The reward that includes validators staked ETH only"
              />
            </section>
          </div>
        </div>
      )}

      {rewardList.map((rewardInfo, index) => (
        <div
          key={index}
          className={classNames(styles["my-reward-table-item"], "h-[1.1rem]", {
            "bg-[#1A283570]": index % 2 === 0,
          })}
        >
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text1">
                {dayjs.unix(rewardInfo.timestamp).format("YYYY-MM-DD HH:mm:ss")}
              </div>
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text1">
                {formatNumber(Web3.utils.fromWei(rewardInfo.totalStakedEth))}
              </div>
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text1">
                {formatNumber(Web3.utils.fromWei(rewardInfo.selfStakedEth))}
              </div>
            </section>
          </div>
          {/* <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text1">
                {rewardInfo.commission}%
              </div>
            </section>
          </div> */}
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-primary">
                {formatNumber(Web3.utils.fromWei(rewardInfo.totalEraRewardEth))}
              </div>
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text1">
                {formatNumber(Web3.utils.fromWei(rewardInfo.selfEraRewardEth))}
              </div>
            </section>
          </div>
        </div>
      ))}

      {totalCount > 0 && (
        <div className="mt-[.36rem] flex justify-center">
          <CustomPagination
            totalCount={totalCount}
            page={page}
            onChange={setPage}
          />
        </div>
      )}

      <div className="text-center text-text2 mt-[.56rem] text-[.2rem]">
        Rewards data updates every 8 hours
      </div>
    </div>
  );
};
