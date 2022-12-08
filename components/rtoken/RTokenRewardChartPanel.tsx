import classNames from "classnames";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { ChartDu, RequestStatus, TokenName } from "interfaces/common";
import Image from "next/image";
import { formatNumber } from "utils/number";
import { CustomChart } from "../data/CustomChart";
import ethIcon from "public/eth_type_green.svg";
import maticIcon from "public/matic_type_green.svg";
import { Card } from "components/common/card";
import { useContext, useEffect, useMemo, useState } from "react";
import { useRTokenReward } from "hooks/useRTokenReward";
import { getChartDuSeconds } from "utils/common";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useRTokenRatio } from "hooks/useRTokenRatio";
import { useTokenPrice } from "hooks/useTokenPrice";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { Tooltip } from "@mui/material";

interface RewardChartPanelProps {
  tokenName: TokenName;
  onClickStake: () => void;
}

export const RewardChartPanel = (props: RewardChartPanelProps) => {
  const { tokenName } = props;

  const [chartWidth, setChartWidth] = useState("");
  const [chartHeight, setChartHeight] = useState("");
  const [chartDu, setChartDu] = useState<"1W" | "1M" | "3M" | "6M" | "ALL">(
    "ALL"
  );

  const selectedTokenStandard = useTokenStandard(tokenName);
  const rTokenRatio = useRTokenRatio(tokenName);
  const tokenPrice = useTokenPrice(props.tokenName);
  const { requestStatus, totalCount, totalReward, lastEraReward } =
    useRTokenReward(tokenName, 1, getChartDuSeconds(chartDu));

  const { chartXData, chartYData } = useRTokenReward(
    tokenName,
    1,
    getChartDuSeconds(chartDu),
    true
  );

  const { isWrongMetaMaskNetwork } = useContext(MyLayoutContext);

  // Total reward value.
  const totalRewardValue = useMemo(() => {
    if (isNaN(Number(totalReward)) || isNaN(Number(tokenPrice))) {
      return "--";
    }
    return Number(totalReward) * Number(tokenPrice);
  }, [totalReward, tokenPrice]);

  // Last era reward token value.
  const lastEraRewardValue = useMemo(() => {
    if (isNaN(Number(lastEraReward)) || isNaN(Number(tokenPrice))) {
      return "--";
    }
    return Number(lastEraReward) * Number(tokenPrice);
  }, [lastEraReward, tokenPrice]);

  const resizeListener = () => {
    // 1rem:100px
    let designSize = 2048;
    let html = document.documentElement;
    let clientW = html.clientWidth;
    // let clientW = 1440;
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

  if (isWrongMetaMaskNetwork || totalCount === 0) {
    return (
      <div className="flex flex-col items-center pb-[.3rem]">
        <div
          className="flex flex-col items-center"
          // onClick={props.onClickStake}
        >
          <EmptyContent mt="0.2rem" size=".8rem" />
          {/* <div className="mt-[.3rem] flex items-center">
            <div className="text-text1 text-[.24rem] mr-[.1rem]">
              Make a stake
            </div>
            <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
          </div> */}
        </div>
      </div>
    );
  }

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
          tokenName={tokenName}
        />

        <div className="text-[.18rem] text-text2 absolute top-[.36rem] left-0 invisible">
          +{formatNumber(lastEraReward)} {tokenName} (Last era)
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
            onClick={() => setChartDu(ChartDu["1W"])}
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
            onClick={() => setChartDu(ChartDu["1M"])}
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
            onClick={() => setChartDu(ChartDu["3M"])}
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
            onClick={() => setChartDu(ChartDu["6M"])}
          >
            6M
          </div>
          <div
            className={classNames(
              "cursor-pointer",
              chartDu === ChartDu.ALL ? "text-primary font-[700]" : "text-text2"
            )}
            onClick={() => setChartDu(ChartDu.ALL)}
          >
            ALL
          </div>
        </div>
      </div>

      <div className="ml-[1.3rem] mr-[.9rem] flex-1  flex flex-col">
        <div className="w-[.72rem] h-[.72rem] self-center relative z-10">
          <Image
            src={tokenName === TokenName.MATIC ? maticIcon : ethIcon}
            alt="eth"
            layout="fill"
          />
        </div>

        <Card
          background="linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)"
          borderColor="#26494E"
          mt="-0.36rem"
          style={{ flex: 1 }}
        >
          <div
            className={classNames("pt-[.78rem] pl-[.56rem] pb-[.4rem]")}
            style={{}}
          >
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                text="Total reward"
                title="Your overall staking reward generated"
              />
            </div>

            <div className="flex items-center mt-[.23rem]">
              <div className="text-[.32rem] text-white">
                {formatNumber(totalReward)} {tokenName}
              </div>
              <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
              <div className="text-text2 text-[.18rem]">
                {isNaN(Number(totalRewardValue)) ||
                Number(totalRewardValue) >= 0.01 ? (
                  <Tooltip title={"$" + formatNumber(totalRewardValue)}>
                    <span>
                      ${formatNumber(totalRewardValue, { decimals: 2 })}
                    </span>
                  </Tooltip>
                ) : (
                  <></>
                )}
              </div>
            </div>

            <div className="mt-[.4rem] text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                text="Reward in last Era"
                title="Your staking reward generated in last era, data update may have time delays for a while"
              />
            </div>

            <div className="flex items-center mt-[.23rem]">
              <div className="text-[.32rem] text-white">
                {formatNumber(lastEraReward)} {tokenName}
              </div>
              <div className="h-[.2rem] w-[1px] bg-text2 mx-[.18rem] opacity-50" />
              <div className="text-text2 text-[.18rem]">
                {isNaN(Number(lastEraRewardValue)) ||
                Number(lastEraRewardValue) >= 0.01 ? (
                  <Tooltip title={"$" + formatNumber(lastEraRewardValue)}>
                    <span>
                      ${formatNumber(lastEraRewardValue, { decimals: 2 })}
                    </span>
                  </Tooltip>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
