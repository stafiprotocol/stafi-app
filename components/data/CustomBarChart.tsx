import ReactEcharts from "echarts-for-react";
import { RPoolRewardFISChartItem } from "hooks/useRPoolChart";
import { formatNumber } from "utils/number";

interface Props {
  width: string;
  height: string;
  xData: string[];
  yData: RPoolRewardFISChartItem[];
}

export const CustomBarChart = (props: Props) => {
  const getChartOption = () => {
    return {
      height: Number(props.height.replace("px", "")) * 0.6 + "px",
      animation: false,
      color: ["#00F3AB"],
      tooltip: {
        backgroundColor: "rgba(25, 38, 52, 1)",
        borderColor: "#1A2835",
        formatter: (params: any) => {
          if (!params) return;
          // console.log(params)
          const index = props.xData.indexOf(params.name);
          if (index === -1) return;
          const chartItem = props.yData[index];

          let formatOverall = formatNumber(chartItem.totalAmount);
          const parts = formatOverall.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          formatOverall = parts.join(".");

          let formatAdded = formatNumber(chartItem.addedAmount);
          const partsAdded = formatAdded.split(".");
          partsAdded[0] = partsAdded[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          formatAdded = partsAdded.join(".");

          return `<div style="font-size:0.24rem;display:flex;flex-direction:column;">
					<div style="color:#9DAFBE;">${params.name}</div>
					<div style="color:#00F3AB;">Overall: ${formatOverall}</div>
					<div style="color:#00F3AB;margin-top:0.05rem">+${chartItem.addedRToken} Mintdrop</div>
					<div style="color:#00F3AB;margin-top:0.05rem">+${formatAdded} FIS Reward</div>
				</div>`;
        },
      },
      xAxis: {
        data: props.xData,
        type: "category",
      },
      yAxis: [
        {
          show: false,
        },
      ],
      series: [
        {
          name: "value",
          type: "bar",
          data: props.yData.map(
            (item: RPoolRewardFISChartItem) => item.totalAmount
          ),
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
      />
    </div>
  );
};
