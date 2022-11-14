import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import { useRTokenReward } from "hooks/useRTokenReward";
import { TokenName } from "interfaces/common";
import { useState } from "react";
import { formatNumber } from "utils/number";
import { getRewardText } from "utils/rToken";

interface StakeMyRewardListProps {
  tokenName: TokenName;
}

export const StakeMyRewardList = (props: StakeMyRewardListProps) => {
  const { tokenName } = props;
  const [page, setPage] = useState(1);

  const { rewardList, totalCount } = useRTokenReward(tokenName, page, 0);

  return (
    <div className="mt-[.56rem] min-h-[2rem]">
      {totalCount > 0 && (
        <div
          className="grid"
          style={{ height: "auto", gridTemplateColumns: "20% 20% 20% 20% 20%" }}
        >
          <div className="flex justify-center">
            <MyTooltip text="Era" title="Era" />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text={`Staked ${tokenName}`}
              title={`Your overall staked ${tokenName} amount, including restaked ${tokenName}`}
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text={`r${tokenName}/${tokenName}`}
              title={`The Current Exchange Rate for r${tokenName} and ${tokenName}, the exchange rate of r${tokenName} will be updated every 8 hours`}
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
            {item.era}
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
            {getRewardText(item.reward)} {tokenName}
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
