import ReactEcharts from "echarts-for-react";
import { RPoolRewardFISChartItem } from "hooks/useRPoolRewardChart";
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
        backgroundColor: "rgba(25, 38, 52, 0.9)",
        borderColor: "#1A2835",
        className: "",
        extraCssText:
          "border-radius:0.16rem;padding:0.2rem;backdrop-filter:blur(0.4rem);",
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

          return `
					<div style="color:#9DAFBE;font-size:0.24rem;">${params.name}</div>
					<div style="color:#9DAFBE;margin-top:0.18rem;font-size:0.24rem;">${chartItem.addedRToken} Mintdrop</div>
					<div style="color:#00F3AB;margin-top:0.18rem;font-size:0.24rem;">+${formatAdded} FIS Reward</div>
					<div style="height:1px;background:#5B6872;margin:0.18rem 0;font-size:0.24rem;"></div>
					<div style="color:#9DAFBE;font-size:0.24rem;">Overall: ${formatOverall}</div>
				`;
        },
      },
      xAxis: {
        show: false,
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
