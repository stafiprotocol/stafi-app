import { Tooltip } from "@mui/material";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import dayjs from "dayjs";
import { EraRewardModel, useRTokenReward } from "hooks/useRTokenReward";
import { TokenName } from "interfaces/common";
import { useCallback, useState } from "react";
import { formatNumber } from "utils/number";
import {
  getEraEstTimeTip,
  getExchangeRateUpdateTime,
  getRewardText,
} from "utils/rToken";

interface StakeOverallListProps {
  tokenName: TokenName;
}

export const StakeOverallList = (props: StakeOverallListProps) => {
  const { tokenName } = props;
  const [page, setPage] = useState(1);
  const list = [1, 2];

  const { rewardList, totalCount } = useRTokenReward(tokenName, page, 0);

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

      {rewardList.map((item, index) => (
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
                dayjs(item.startTimestamp).format("YYYY-MM-DD HH:mm +UTC") +
                " - " +
                (item.endTimestamp === 0
                  ? "Now"
                  : dayjs(item.endTimestamp).format("YYYY-MM-DD HH:mm +UTC"))
              }
            >
              <span>{item.era}</span>
            </Tooltip>
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {formatNumber(item.stakeValue)}{" "}
            {Number(formatNumber(item.addedStakeAmount)) > 0 && (
              <span className="text-primary ml-[.1rem]">
                +{formatNumber(item.addedStakeAmount)}
              </span>
            )}
            {Number(formatNumber(item.addedStakeAmount)) < 0 && (
              <span className="text-error ml-[.1rem]">
                {formatNumber(item.addedStakeAmount)}
              </span>
            )}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {formatNumber(item.rate, { decimals: 4 })}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {formatNumber(item.rTokenBalance)}
            {Number(formatNumber(item.addedRTokenAmount)) > 0 && (
              <span className="text-primary ml-[.1rem]">
                +{formatNumber(item.addedRTokenAmount)}
              </span>
            )}
            {Number(formatNumber(item.addedRTokenAmount)) < 0 && (
              <span className="text-error ml-[.1rem]">
                {formatNumber(item.addedRTokenAmount)}
              </span>
            )}
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

      {totalCount > 0 && (
        <div className="mt-[.36rem] flex justify-center">
          <CustomPagination
            totalCount={totalCount}
            page={page}
            onChange={setPage}
          />
        </div>
      )}

      {totalCount === 0 && (
        <div className="flex flex-col items-center pb-[.3rem]">
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
          </div>
        </div>
      )}
    </div>
  );
};
