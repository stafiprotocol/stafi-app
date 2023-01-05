import { ProgramTab } from "pages/rpool";
import LpChart from "./chart/LpChart";
import MintChart from "./chart/MintChart";

interface Props {
  // programTab: ProgramTab;
  totalMintedValue?: string;
  totalRewardFis?: string;
}

const RPoolChart = (props: Props) => {
  // if (props.programTab === ProgramTab.Mint) {
  return (
    <MintChart
      totalMintedValue={props.totalMintedValue}
      totalRewardFis={props.totalRewardFis}
    />
  );
  // }
  // return <LpChart />;
};

export default RPoolChart;
