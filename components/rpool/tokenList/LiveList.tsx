import { EmptyContent } from "components/common/EmptyContent";
import { RTokenListItem } from "hooks/useRPoolMintRTokenActs";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { RTokenName, TokenName, TokenStandard } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import { useMemo } from "react";
import { RTokenActs } from "redux/reducers/MintProgramSlice";
import { rTokenNameToTokenName } from "utils/rToken";
import MintTokenCard from "../tokenCard/MintTokenCard";

interface Props {
  programTab: ProgramTab;
  list: RTokenListItem[];
  viewMyStakes: boolean;
  rTokenBalances: {
    [rTokenName in RTokenName]?: string;
  };
}

export interface AllListItem extends RTokenActs {
  rToken: RTokenName;
}

const RPoolLiveList = (props: Props) => {
  const { list, viewMyStakes, rTokenBalances } = props;

  const flatList = useMemo(() => {
    // console.log(list, balanceRMatic, viewMyStakes, balanceRAtom, balanceRBnb, balanceRDot, balanceREth, balanceRKsm, balanceRSol)
    const validList = list.filter((item: RTokenListItem) => {
      const criteria = Array.isArray(item.children) && item.children.length > 0;
      if (viewMyStakes) {
        const rTokenBalance = rTokenBalances[item.rToken];
        // console.log({rToken: item.rToken, rTokenBalance})
        return (
          !isNaN(Number(rTokenBalance)) && Number(rTokenBalance) > 0 && criteria
        );
      }
      return criteria;
    });
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
  }, [list, viewMyStakes, rTokenBalances]);

  return (
    <div
      className="mt-[.36rem] grid relative min-h-[1rem]"
      style={{
        gridTemplateColumns: "repeat(4, 3.35rem)",
        justifyContent: "space-between",
        rowGap: ".5rem",
      }}
    >
      {flatList.length === 0 && (
        <div className="flex flex-col items-center pb-[.3rem] w-full absolute top-0 left-0">
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
              rTokenBalance={rTokenBalances[item.rToken]}
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
