import classNames from "classnames";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { ChartDu, TokenName } from "interfaces/common";
import Image from "next/image";
import { formatNumber } from "utils/number";
import { CustomChart } from "./CustomChart";
import ethIcon from "public/eth_type_green.svg";
import { Card } from "components/common/card";
import { useEffect, useState } from "react";
import { useEraReward } from "hooks/useRTokenReward";

interface RewardChartPanelProps {
  chartXData: string[];
  chartYData: string[];
  lastEraReward: string;
  chartDu: ChartDu;
  setChartDu: (v: ChartDu) => void;
  totalToken: string;
  totalTokenValue: string;
  last24hToken: string;
  last24hTokenValue: string;
}

export const RewardChartPanel = (props: RewardChartPanelProps) => {
  const [chartWidth, setChartWidth] = useState("");
  const [chartHeight, setChartHeight] = useState("");

  const {} = useEraReward(TokenName.ETH);

  const resizeListener = () => {
    // 1rem:100px
    let designSize = 2048;
    let html = document.documentElement;
    // let clientW = html.clientWidth;
    let clientW = 1440;
    let htmlRem = (clientW * 100) / designSize;
    // html.style.fontSize = htmlRem + "px";

    setChartWidth(htmlRem * 6.7 + "px");
    setChartHeight(htmlRem * 2.8 + "px");
  };

  useEffect(() => {
    window.addEventListener("resize", resizeListener);
    resizeListener();

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const {
    chartXData,
    chartYData,
    lastEraReward,
    chartDu,
    totalToken,
    totalTokenValue,
    last24hToken,
    last24hTokenValue,
  } = props;
  return (
    <div className="flex">
      <div className="relative ml-[.56rem]" style={{ width: chartWidth }}>
        {chartXData.length === 0 && (
          <div className="absolute left-[.56rem] right-0 flex justify-center top-[140px]">
            <EmptyContent size="0.6rem" />
          </div>
        )}

        <CustomChart
          width={chartWidth}
          height={chartHeight}
          xData={chartXData}
          yData={chartYData}
        />

        <div className="text-[.18rem] text-text2 absolute top-[.36rem] left-0">
          +{formatNumber(lastEraReward)} ETH (Last era)
        </div>

        <div
          className={classNames(
            "flex items-center justify-end text-[.16rem] absolute bottom-[20px] right-[10px]",
            { invisible: chartXData.length === 0 }
          )}
        >
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["1W"]
                ? "text-primary font-[700]"
                : "text-text2"
            )}
            onClick={() => props.setChartDu(ChartDu["1W"])}
          >
            1W
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["1M"]
                ? "text-primary font-[700]"
                : "text-text2"
            )}
            onClick={() => props.setChartDu(ChartDu["1M"])}
          >
            1M
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["3M"]
                ? "text-primary font-[700]"
                : "text-text2"
            )}
            onClick={() => props.setChartDu(ChartDu["3M"])}
          >
            3M
          </div>
          <div
            className={classNames(
              "mr-[.5rem] cursor-pointer",
              chartDu === ChartDu["6M"]
                ? "text-primary font-[700]"
                : "text-text2"
            )}
            onClick={() => props.setChartDu(ChartDu["6M"])}
          >
            6M
          </div>
          <div
            className={classNames(
              "cursor-pointer",
              chartDu === ChartDu.ALL ? "text-primary font-[700]" : "text-text2"
            )}
            onClick={() => props.setChartDu(ChartDu.ALL)}
          >
            ALL
          </div>
        </div>
      </div>

      <div className="ml-[1.3rem] mr-[.9rem] flex-1 h-[253px] flex flex-col">
        <div className="w-[.72rem] h-[.72rem] self-center relative z-10">
          <Image src={ethIcon} alt="eth" layout="fill" />
        </div>

        <Card
          background="linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)"
          borderColor="#26494E"
          mt="-0.36rem"
          style={{ flex: 1 }}
        >
          <div className={classNames("pt-[.78rem] pl-[.56rem]")} style={{}}>
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                title="Total staked ETH value, includes validator own stakes."
                text="Total Staked Value"
              />
            </div>

            <div className="flex items-center mt-[.23rem]">
              <div className="text-[.32rem] text-white">${totalTokenValue}</div>
              <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
              <div className="text-text2 text-[.18rem]">
                {formatNumber(totalToken)} ETH
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
                ${last24hTokenValue}
              </div>
              <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
              <div className="text-text2 text-[.18rem]">{last24hToken} ETH</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
