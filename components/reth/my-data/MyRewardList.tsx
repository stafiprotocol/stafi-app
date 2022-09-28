import classNames from "classnames";
import { Icomoon } from "components/Icomoon";
import { CustomPagination } from "components/pagination";
import dayjs from "dayjs";
import { EthRewardInfo } from "hooks/useEthMyReward";
import { useState } from "react";
import { formatNumber } from "utils/number";
import Web3 from "web3";
import styles from "../../../styles/reth/MyData.module.scss";

interface MyRewardListProps {
  totalCount: number;
  rewardList: EthRewardInfo[];
}

export const MyRewardList = (props: MyRewardListProps) => {
  const [page, setPage] = useState(1);

  return (
    <div>
      <div className="mx-[.56rem] flex items-center mt-[.76rem]">
        <div className="text-white text-[.32rem]">Reward Details</div>
        <div className="text-text2 text-[.24rem] ml-[.26rem] mr-[.06rem]">
          (Epoch updated every 8 hours)
        </div>
        <Icomoon icon="question" size="0.16rem" color="#5B6872" />
      </div>

      <div
        className={classNames(
          styles["my-reward-table-item"],
          "mt-[.2rem] h-[1rem]"
        )}
      >
        <div className="flex justify-center">
          <section className="flex-1 flex justify-center items-center">
            <div className="mr-[.07rem] text-[.2rem] text-text2">Time</div>
            <Icomoon icon="question" size="0.16rem" color="#5B6872" />
          </section>
        </div>
        <div className="flex justify-center">
          <section className="flex-1 flex justify-center items-center">
            <div className="mr-[.07rem] text-[.2rem] text-text2">
              Total-staked &amp; Self-staked ETH
            </div>
            <Icomoon icon="question" size="0.16rem" color="#5B6872" />
          </section>
        </div>
        <div className="flex justify-center">
          <section className="flex-1 flex justify-center items-center">
            <div className="mr-[.07rem] text-[.2rem] text-text2">
              Commission
            </div>
            <Icomoon icon="question" size="0.16rem" color="#5B6872" />
          </section>
        </div>
        <div className="flex justify-center">
          <section className="flex-1 flex justify-center items-center">
            <div className="mr-[.07rem] text-[.2rem] text-text2">
              Total-staked &amp; Self-staked Reward
            </div>
            <Icomoon icon="question" size="0.16rem" color="#5B6872" />
          </section>
        </div>
      </div>
      {props.rewardList.map((rewardInfo, index) => (
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
                {formatNumber(Web3.utils.fromWei(rewardInfo.totalStakedEth))} :{" "}
                {formatNumber(Web3.utils.fromWei(rewardInfo.selfStakedEth))}
              </div>
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-text1">
                {rewardInfo.commission}%
              </div>
            </section>
          </div>
          <div className="flex justify-center">
            <section className="flex-1 flex justify-center items-center">
              <div className="mr-[.07rem] text-[.2rem] text-primary">
                {formatNumber(Web3.utils.fromWei(rewardInfo.totalEraRewardEth))}{" "}
                :{" "}
                {formatNumber(Web3.utils.fromWei(rewardInfo.selfEraRewardEth))}
              </div>
            </section>
          </div>
        </div>
      ))}

      <div className="mt-[.36rem] flex justify-center">
        <CustomPagination
          totalCount={props.totalCount}
          page={page}
          onChange={setPage}
        />
      </div>
    </div>
  );
};
