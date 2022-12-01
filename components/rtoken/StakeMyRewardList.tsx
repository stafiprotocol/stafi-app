import { Tooltip } from "@mui/material";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import dayjs from "dayjs";
import { EraRewardModel, useRTokenReward } from "hooks/useRTokenReward";
import { TokenName } from "interfaces/common";
import { useCallback, useMemo, useState } from "react";
import { formatNumber } from "utils/number";
import {
  getEraEstTimeTip,
  getExchangeRateUpdateTime,
  getRewardText,
} from "utils/rToken";

interface StakeMyRewardListProps {
  tokenName: TokenName;
}

export const StakeMyRewardList = (props: StakeMyRewardListProps) => {
  const { tokenName } = props;
  const [page, setPage] = useState(1);

  const { rewardList, totalCount } = useRTokenReward(tokenName, page, 0);

  const [filteredRewardList, filteredUnbondList] = useMemo(() => {
    const newRewardList: EraRewardModel[] = [];
    const newUnbondList: EraRewardModel[] = [];
    rewardList.forEach((item) => {
      if (Number(item.addedRTokenAmount) < 0) {
        newUnbondList.push(item);
      } else {
        newRewardList.push(item);
      }
    });
    return [newRewardList, newUnbondList];
  }, [rewardList]);

  const filteredTotalCount = useMemo(() => {
    return totalCount - filteredUnbondList.length;
  }, [filteredUnbondList, totalCount]);

  return (
    <div className="mt-[.56rem] min-h-[2rem]">
      {totalCount > 0 && (
        <div
          className="grid"
          style={{ height: "auto", gridTemplateColumns: "20% 20% 20% 20% 20%" }}
        >
          <div className="flex justify-center">
            <MyTooltip
              text="Era"
              title="UTC time record for the onchain transaction"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text={`Staked ${tokenName}`}
              title={`Your overall staked ${tokenName} amount, including compound ${tokenName}`}
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text={`r${tokenName}/${tokenName}`}
              title={`The Current Exchange Rate for r${tokenName} and ${tokenName}, the exchange rate of r${tokenName} will be updated every ${getExchangeRateUpdateTime(
                tokenName
              )} hours`}
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text={`r${tokenName} Balance`}
              title={`Your current r${tokenName} amount`}
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Est. Reward"
              title={`Estimated staking reward that generated in this time period`}
            />
          </div>
        </div>
      )}

      {filteredRewardList.map((item, index) => (
        <div
          key={index}
          className="grid h-[1.1rem]"
          style={{
            gridTemplateColumns: "20% 20% 20% 20% 20%",
            background:
              index % 2 === 0 ? "transparent" : "rgba(26, 40, 53, 0.3)",
          }}
        >
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            <Tooltip
              title={
                dayjs(item.startTimestamp).format("YYYY-MM-DD HH:mm:ss Z") +
                " - " +
                (item.endTimestamp === 0
                  ? "Now"
                  : dayjs(item.endTimestamp).format("YYYY-MM-DD HH:mm:ss Z"))
              }
            >
              <span>{item.era}</span>
            </Tooltip>
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {formatNumber(item.stakeValue)}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {formatNumber(item.rate, { decimals: 4 })}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {formatNumber(item.rTokenBalance)}
          </div>
          <div className="flex justify-center items-center text-primary text-[.24rem]">
            <Tooltip title={getEraEstTimeTip(item, tokenName)}>
              <span>
                {getRewardText(item.reward)} {tokenName}
              </span>
            </Tooltip>
          </div>
        </div>
      ))}

      {filteredTotalCount > 0 && (
        <div className="mt-[.36rem] flex justify-center">
          <CustomPagination
            totalCount={filteredTotalCount}
            page={page}
            onChange={setPage}
          />
        </div>
      )}

      {filteredTotalCount === 0 && (
        <div className="flex flex-col items-center pb-[.3rem]">
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
            {/* <div className="mt-[.3rem] flex items-center">
            <div className="text-text1 text-[.24rem] mr-[.1rem]">
              Make a stake
            </div>
            <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
          </div> */}
          </div>
        </div>
      )}
    </div>
  );
};
