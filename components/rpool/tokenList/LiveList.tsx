import { EmptyContent } from "components/common/EmptyContent";
import { TableSkeleton } from "components/common/TableSkeleton";
import dayjs from "dayjs";
import { useAppDispatch } from "hooks/common";
import { useInterval } from "hooks/useInterval";
import { RTokenListItem } from "hooks/useRPoolMintRTokenActs";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { RTokenName, TokenName, TokenStandard } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import { useEffect, useMemo, useState } from "react";
import { getDotPools } from "redux/reducers/DotSlice";
import { getKsmPools } from "redux/reducers/KsmSlice";
import { getPools } from "redux/reducers/MaticSlice";
import { RTokenActs, UserActs } from "redux/reducers/MintProgramSlice";
import { rTokenNameToTokenName } from "utils/rToken";
import MintTokenCard from "../tokenCard/MintTokenCard";

interface Props {
  // programTab: ProgramTab;
  list: RTokenListItem[];
  viewMyStakes: boolean;
  rTokenBalances: {
    [rTokenName in RTokenName]?: string;
  };
  queryActsLoading: boolean;
  firstQueryLoading: boolean;
  userActs: UserActs;
  loading: boolean;
}

export interface AllListItem extends RTokenActs {
  rToken: RTokenName;
}

const RPoolLiveList = (props: Props) => {
  const {
    list,
    viewMyStakes,
    rTokenBalances,
    queryActsLoading,
    firstQueryLoading,
    userActs,
    loading,
  } = props;

	const dispatch = useAppDispatch();

	const [updateFlag, setUpdateFlag] = useState<number>(dayjs().unix());

  const flatList = useMemo(() => {
    const validList = list.filter((item: RTokenListItem) => {
      const criteria = Array.isArray(item.children) && item.children.length > 0;
      return criteria;
    });
    const allListData: AllListItem[] = [];
    validList.forEach((item: RTokenListItem) => {
      item.children.forEach((child: RTokenActs) => {
        if (!viewMyStakes) {
          allListData.push({
            ...child,
            rToken: item.rToken,
          });
        } else {
          if (
            userActs[item.rToken] &&
            (userActs[item.rToken] as any)[child.cycle] &&
            (userActs[item.rToken] as any)[child.cycle].mintsCount > 0
          ) {
            allListData.push({
              ...child,
              rToken: item.rToken,
            });
          }
        }
      });
    });

    return allListData;
  }, [list, viewMyStakes, userActs, updateFlag]);

	const isListEmpty = useMemo(() => {
		return !((queryActsLoading && firstQueryLoading) || loading) && flatList.length === 0;
	}, [queryActsLoading, firstQueryLoading, loading, flatList]);

	useEffect(() => {
		dispatch(getPools());
		dispatch(getDotPools());
		dispatch(getKsmPools());
	}, [dispatch]);

	useInterval(() => {
		setUpdateFlag(dayjs().unix());
	}, 1000);

  return (
    <div
      className="mt-[.36rem] grid relative min-h-[2.2rem]"
      style={{
        gridTemplateColumns: "repeat(4, 3.35rem)",
        justifyContent: "space-between",
        alignItems: "start",
        rowGap: ".5rem",
				marginTop: isListEmpty ? "1.2rem" : "",
      }}
    >
      {((queryActsLoading && firstQueryLoading) || loading) && flatList.length === 0 && (
          <div className="absolute top-0 left-0 w-full">
            <TableSkeleton />
          </div>
        )}

      {isListEmpty && (
          <div className="flex flex-col items-center pb-[.3rem] w-full absolute top-0 left-0">
            <div className="flex flex-col items-center">
              <EmptyContent mt="0.2rem" size=".8rem" />
            </div>
          </div>
        )}

      {/* {props.programTab === ProgramTab.Mint ? ( */}
      {/* <> */}
      {flatList.map((item: AllListItem, index: number) => (
        <MintTokenCard
          key={`${item.rToken}${index}`}
          data={item}
          rTokenBalance={rTokenBalances[item.rToken]}
        />
      ))}
      {/* </>
      ) : (
        <></>
      )} */}
    </div>
  );
};

export default RPoolLiveList;
