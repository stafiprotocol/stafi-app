import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import { useRTokenReward } from "hooks/useRTokenReward";
import { TokenName } from "interfaces/common";
import { useState } from "react";

interface StakeMyRewardListProps {
  tokenName: TokenName;
}

export const StakeMyRewardList = (props: StakeMyRewardListProps) => {
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const list = [1, 2];

  const {} = useRTokenReward(props.tokenName, page, 0);

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
            <MyTooltip text="Stake ETH" title="Stake ETH" />
          </div>
          <div className="flex justify-center">
            <MyTooltip text="rETH/ETH" title="rETH/ETH" />
          </div>
          <div className="flex justify-center">
            <MyTooltip text="Get rETH" title="Get rETH" />
          </div>
          <div className="flex justify-center">
            <MyTooltip text="Est Reward" title="Est Reward" />
          </div>
        </div>
      )}

      {list.map((item, index) => (
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
            29384
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            24.5 ETH
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            1.03
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            1.03
          </div>
          <div className="flex justify-center items-center text-primary text-[.24rem]">
            +0.03 ETH
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
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center cursor-pointer">
            <EmptyContent mt="0.2rem" size=".8rem" />
            <div className="mt-[.3rem] flex items-center">
              <div className="text-text1 text-[.24rem] mr-[.1rem]">
                Make a stake
              </div>
              <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
