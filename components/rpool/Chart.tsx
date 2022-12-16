import { ProgramTab } from "pages/rpool";
import LpChart from "./chart/LpChart";
import MintChart from "./chart/MintChart";

interface Props {
  programTab: ProgramTab;
}

const RPoolChart = (props: Props) => {
  if (props.programTab === ProgramTab.Mint) {
    return <MintChart />;
  }
  return <LpChart />;
};

export default RPoolChart;
