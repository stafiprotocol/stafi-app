import ReactEcharts from "echarts-for-react";
import React from "react";
import { graphic } from "echarts";

interface EthRewardChartProps {
  xData: string[];
  yData: string[];
  width: string;
  height: string;
}

export const EthRewardChart = (props: EthRewardChartProps) => {
  const getChartOption = () => {
    return {
      animation: false,
      color: ["#14494E"],
      // lenend: {
      //   height: "320px",
      // },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
        backgroundColor: "rgba(25, 38, 52, 1)",
        borderColor: "#1A2835",
        formatter: (params: any) => {
          if (params && params.length > 0) {
            const stakedValue = params[0].data;
            let formatStakedValue = stakedValue;
            const parts = formatStakedValue.split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            formatStakedValue = parts.join(".");

            return `<div style="font-size:0.24rem;display:flex;flex-direction:column;align-items:center;">
            <div style="color:#9DAFBE;">${params[0].axisValue}</div>
            <span style="color:#00F3AB;margin-top:0.05rem">+${formatStakedValue} ETH<span>
          </div>`;
          }
          // console.log(params, "======params");
        },
      },
      xAxis: [
        {
          show: false,
          type: "category",
          data: props.xData,
          boundaryGap: false,
          axisTick: {
            show: false,
            alignWithLabel: true,
          },
          axisLabel: {
            padding: [0, 10, 0, 10],
            interval: 0,
            // rotate: -40,
            color: "#A5A5A5",
            formatter: (value: any) => {
              return value;
            },
          },
        },
      ],
      grid: {
        left: "3%",
        right: "3%",
      },
      yAxis: [
        {
          show: false,
          type: "value",
          min: function (value: any) {
            return Math.max(0, value.min - (value.max - value.min));
          },
          max: "dataMax",
          axisLabel: {
            formatter: (value: any) => {
              return value;
            },
            color: "#FFFFFF",
          },
          splitLine: {
            show: false,
            lineStyle: {
              color: "#444755",
              width: 2,
            },
          },
        },
      ],
      series: [
        {
          name: "value",
          type: "line",
          showSymbol: true,
          symbol: "circle",
          symbolSize: 10,
          lineStyle: {
            color: "#00F3AB",
            width: 4,
          },
          itemStyle: {
            color: "#00F3AB",
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "#14494E",
              },
              {
                offset: 1,
                color: "#0C141D",
              },
            ]),
          },
          barWidth: "60%",
          data: props.yData,
        },
      ],
    };
  };

  return (
    <div
      style={{
        width: props.width,
        maxWidth: props.width,
        height: props.height,
      }}
    >
      <ReactEcharts
        option={getChartOption()}
        style={{ width: props.width, height: props.height }}
      ></ReactEcharts>
    </div>
  );
};
