import ReactEcharts from "echarts-for-react";
import { formatNumber } from "utils/number";

interface Props {
  width: string;
  height: string;
  xData: string[];
  yData: string[];
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
					console.log(params)
					if (!params) return;
          const stakedValue = params.data;
          // let formatStakedValue = stakedValue;
          let formatStakedValue = formatNumber(stakedValue);
          const parts = formatStakedValue.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          formatStakedValue = parts.join(".");
          return `<div style="font-size:0.24rem;display:flex;flex-direction:column;align-items:center;">
					<div style="color:#9DAFBE;">${params.name}</div>
					<span style="color:#00F3AB;margin-top:0.05rem">+${formatStakedValue} FIS<span>
				</div>`;
        },
      },
      xAxis: [
        {
          show: false,
          type: "category",
          data: props.xData,
        },
      ],
      yAxis: [
        {
          show: false,
        },
      ],
      series: [
        {
          name: "value",
          type: "bar",
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
      />
    </div>
  );
};
