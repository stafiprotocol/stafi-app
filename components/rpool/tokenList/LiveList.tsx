import { EmptyContent } from "components/common/EmptyContent";
import { RTokenListItem } from "hooks/useRPoolMintRTokenActs";
import { RTokenName } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import { useMemo } from "react";
import { RTokenActs } from "redux/reducers/MintProgramSlice";
import MintTokenCard from "../tokenCard/MintTokenCard";

interface Props {
  programTab: ProgramTab;
  list: RTokenListItem[];
}

export interface AllListItem extends RTokenActs {
	rToken: RTokenName;
}

const RPoolLiveList = (props: Props) => {
  const { list } = props;

  const flatList = useMemo(() => {
    const validList = list.filter(
      (item: RTokenListItem) => Array.isArray(item.children) && item.children.length > 0
    );
    const allListData: AllListItem[] = [];
    validList.forEach((item: RTokenListItem) => {
      item.children.forEach((child: RTokenActs) => {
        allListData.push({
          ...child,
          rToken: item.rToken,
        });
      });
    });
    return allListData;
  }, [list]);

  return (
    <div className="flex mt-[.36rem]">
      {flatList.length === 0 && (
        <div className="flex flex-col items-center pb-[.3rem] w-full">
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
          </div>
        </div>
      )}

      {props.programTab === ProgramTab.Mint ? (
        <>
          {flatList.map((item: AllListItem, index: number) => (
            <MintTokenCard
              key={`${item.rToken}${index}`}
              data={item}
              rTokenName={item.rToken}
            />
          ))}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RPoolLiveList;
