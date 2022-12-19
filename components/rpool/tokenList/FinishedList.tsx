import { Button } from "components/common/button";
import { MyTooltip } from "components/common/MyTooltip";
import { ProgramTab } from "pages/rpool";
import { formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";

interface Props {
  programTab: ProgramTab;
  list: any[];
}

const RPoolFinishedList = (props: Props) => {
  const { list } = props;

  return (
    <div
      className="mt-[.36rem] rounded-[.16rem]"
      style={{
        border: "1px solid #1A2835",
        backdropFilter: "blur(.7rem)",
        background: "rgba(26, 40, 53, 0.2)",
      }}
    >
      <div
        className="grid mb-[.5rem] mt-[.56rem] mx-[.56rem]"
        style={{ gridTemplateColumns: "16% 16% 16% 16% 16% 20%" }}
      >
        <div className="flex justify-start text-text2 text-[.2rem]">
          Token Name
        </div>
        <div className="flex justify-center">
          <MyTooltip
            text="Minted Value"
            title=""
            className="text-text2 text-[.2rem]"
          />
        </div>
        <div className="flex justify-center">
          <MyTooltip
            text="Reward"
            title=""
            className="text-text2 text-[.2rem]"
          />
        </div>
        <div className="flex justify-center">
          <MyTooltip
            text="Reward Ratio"
            title=""
            className="text-text2 text-[.2rem]"
          />
        </div>
        <div className="flex justify-center">
          <MyTooltip text="APR" title="" className="text-text2 text-[.2rem]" />
        </div>
      </div>

      {!!list &&
        list.filter((data: any) => data.children && data.children.length > 0).map((data: any, i: number) => (
          <div
            key={`${data.rToken}${i}`}
            className="px-[.56rem]"
            style={{
              borderTop: i % 2 === 1 ? "1px solid #1A2835" : "none",
              borderBottom: i % 2 === 1 ? "1px solid #1A2835" : "none",
              background:
                i % 2 === 0 ? "transparent" : "rgba(26, 40, 53, 0.3)",
            }}
          >
            {data.children.map((item: any, index: number) => (
              <div
                key={`${data.rToken}${i}${index}`}
                className="grid h-[1.1rem] text-[.24rem] text-text1"
                style={{
                  gridTemplateColumns: "16% 16% 16% 16% 16% 20%",
                }}
              >
                <div className="flex justify-start items-center">
                  {index === 0 && data.rToken}
                </div>
                <div className="flex justify-center items-center">
                  {formatNumber(item.mintedValue)}
                </div>
                <div className="flex justify-center items-center">
                  {formatNumber(numberUtil.fisAmountToHuman(item.total_reward))}
                </div>
                <div className="flex justify-center items-center">
                  1:
                  {numberUtil.tokenMintRewardRateToHuman(
                    item.reward_rate,
                    data.rToken
                  )}
                </div>
                <div className="flex justify-center items-center">1.03%</div>
                <div className="flex justify-end items-center">
                  <div
                    className="h-[.48rem] rounded-[.43rem] w-[1.58rem] text-text1 text-[.24rem] flex items-center justify-center cursor-pointer mr-[.16rem]"
                    style={{
                      border: "1px solid rgba(91, 104, 114, 0.5)",
                    }}
                    onClick={() => {}}
                  >
                    Unstake
                  </div>
                  <Button height="0.48rem" fontSize="0.24rem" width="1.58rem">
                    Claim
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default RPoolFinishedList;
