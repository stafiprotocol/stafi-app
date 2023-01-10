import classNames from "classnames";
import { BubblesLoading } from "components/common/BubblesLoading";
import { EmptyContent } from "components/common/EmptyContent";
import { CustomBarChart } from "components/data/CustomBarChart";
import { CustomChart } from "components/data/CustomChart";
import { useRPoolChart } from "hooks/useRPoolChart";
import { useRPoolRewardChart } from "hooks/useRPoolRewardChart";
import { ChartDu } from "interfaces/common";
import { useEffect, useState } from "react";
import { getChartDuSeconds, isEmptyValue } from "utils/common";

interface Props {
  totalMintedValue?: string;
  totalRewardFis?: string;
}

const MintChart = (props: Props) => {
  const [chartDu, setChartDu] = useState<"1W" | "1M" | "3M" | "6M" | "ALL">(
    "ALL"
  );
  const [chartDuReward, setChartDuReward] = useState<
    "1W" | "1M" | "3M" | "6M" | "ALL"
  >("ALL");

  const [chartWidth, setChartWidth] = useState("");
  const [chartHeight, setChartHeight] = useState("");

  const { mintedValueChartXData, mintedValueChartYData } = useRPoolChart(
    getChartDuSeconds(chartDu)
  );

  const { rewardChartXData, rewardChartYData } = useRPoolRewardChart(
    getChartDuSeconds(chartDuReward)
  );

  const resizeListener = () => {
    let designSize = 2048;
    let html = document.documentElement;
    let clientW = html.clientWidth;
    let htmlRem = (clientW * 100) / designSize;

    let widthFactor = 6.7;
    if (htmlRem > 1800) {
      widthFactor = 6;
    }
    setChartWidth(htmlRem * widthFactor + "px");
    setChartHeight(htmlRem * 2.8 + "px");
  };

  useEffect(() => {
    window.addEventListener("resize", resizeListener);
    resizeListener();

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  return (
    <div className="flex justify-between mt-[.36rem]">
      <div
        className="rounded-[.16rem] w-[49%] min-h-[1rem] p-[.32rem] relative pb-[.64rem]"
        style={{
          background: "rgba(23, 38, 54, 0.15)",
          border: "1px solid #1A2835",
          backdropFilter: "blur(.7rem)",
        }}
      >
        <div className="flex flex-col">
          <div className="text-[.2rem] text-text2">Total Minted Value</div>
          <div className="text-[.32rem] mt-[.11rem]">
            {isEmptyValue(props.totalMintedValue) ? (
              <BubblesLoading />
            ) : (
              `$${props.totalMintedValue}`
            )}
          </div>
        </div>

        {mintedValueChartXData.length === 0 && (
          <div className="absolute left-[.56rem] right-0 flex justify-center top-[140px]">
            <EmptyContent size="0.6rem" />
          </div>
        )}

        <CustomChart
          height={chartHeight}
          width={chartWidth}
          xData={mintedValueChartXData}
          yData={mintedValueChartYData}
          isDataValue
          isYellowLine
        />

        <div
          className={classNames(
            "flex items-center justify-end text-[.16rem] absolute bottom-[.16rem] right-[10px]",
            { invisible: mintedValueChartXData.length === 0 }
          )}
        >
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["1W"] ? "text-text1 font-[700]" : "text-text2"
            )}
            onClick={() => setChartDu(ChartDu["1W"])}
          >
            1W
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["1M"] ? "text-text1 font-[700]" : "text-text2"
            )}
            onClick={() => setChartDu(ChartDu["1M"])}
          >
            1M
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["3M"] ? "text-text1 font-[700]" : "text-text2"
            )}
            onClick={() => setChartDu(ChartDu["3M"])}
          >
            3M
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["6M"] ? "text-text1 font-[700]" : "text-text2"
            )}
            onClick={() => setChartDu(ChartDu["6M"])}
          >
            6M
          </div>
          <div
            className={classNames(
              "cursor-pointer",
              chartDu === ChartDu.ALL ? "text-text1 font-[700]" : "text-text2"
            )}
            onClick={() => setChartDu(ChartDu.ALL)}
          >
            ALL
          </div>
        </div>
      </div>

      <div
        className="rounded-[.16rem] w-[49%] min-h-[1rem] p-[.32rem]"
        style={{
          background: "rgba(23, 38, 54, 0.15)",
          border: "1px solid #1A2835",
          backdropFilter: "blur(.7rem)",
        }}
      >
        <div className="flex flex-col">
          <div className="text-[.2rem] text-text2">Total Reward FIS</div>
          <div className="text-[.32rem] mt-[.11rem]">
            {isEmptyValue(props.totalRewardFis) ? (
              <BubblesLoading />
            ) : (
              props.totalRewardFis
            )}
          </div>
        </div>

        {rewardChartXData.length === 0 && (
          <div className="absolute left-[.56rem] right-0 flex justify-center top-[140px]">
            <EmptyContent size="0.6rem" />
          </div>
        )}

        <CustomBarChart
          height={chartHeight}
          width={chartWidth}
          xData={rewardChartXData}
          yData={rewardChartYData}
        />

        <div
          className={classNames(
            "flex items-center justify-end text-[.16rem] absolute bottom-[.16rem] right-[10px]",
            { invisible: mintedValueChartXData.length === 0 }
          )}
        >
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDuReward === ChartDu["1W"]
                ? "text-text1 font-[700]"
                : "text-text2"
            )}
            onClick={() => setChartDuReward(ChartDu["1W"])}
          >
            1W
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDuReward === ChartDu["1M"]
                ? "text-text1 font-[700]"
                : "text-text2"
            )}
            onClick={() => setChartDuReward(ChartDu["1M"])}
          >
            1M
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDuReward === ChartDu["3M"]
                ? "text-text1 font-[700]"
                : "text-text2"
            )}
            onClick={() => setChartDuReward(ChartDu["3M"])}
          >
            3M
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDuReward === ChartDu["6M"]
                ? "text-text1 font-[700]"
                : "text-text2"
            )}
            onClick={() => setChartDuReward(ChartDu["6M"])}
          >
            6M
          </div>
          <div
            className={classNames(
              "cursor-pointer",
              chartDuReward === ChartDu.ALL
                ? "text-text1 font-[700]"
                : "text-text2"
            )}
            onClick={() => setChartDuReward(ChartDu.ALL)}
          >
            ALL
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintChart;
