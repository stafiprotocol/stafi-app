import { RTokenName } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import MintTokenCard from "../tokenCard/MintTokenCard";

interface Props {
  programTab: ProgramTab;
}

const RPoolLiveList = (props: Props) => {
  return (
    <div className="flex mt-[.36rem]">
      {props.programTab === ProgramTab.Mint ? (
        <>
          <MintTokenCard rTokenName={RTokenName.rMATIC} />
          <div className="ml-[.46rem]">
            <MintTokenCard rTokenName={RTokenName.rETH} />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RPoolLiveList;
