import { EmptyContent } from "components/common/EmptyContent";
import { RTokenName } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import { useMemo } from "react";
import MintTokenCard from "../tokenCard/MintTokenCard";

interface Props {
  programTab: ProgramTab;
  list: any[];
}

const RPoolLiveList = (props: Props) => {
  const { list } = props;

  const flatList = useMemo(() => {
    const validList = list.filter(
      (item: any) => Array.isArray(item.children) && item.children.length > 0
    );
    const allListData: any[] = [];
    validList.forEach((item: any) => {
      item.children.forEach((child: any) => {
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
        <div className="flex flex-col items-center pb-[.3rem]">
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
          </div>
        </div>
      )}
      {props.programTab === ProgramTab.Mint ? (
        <>
          {flatList.map((item: any, index: number) => (
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
