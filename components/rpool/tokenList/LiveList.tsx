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
}

export interface AllListItem extends RTokenActs {
  rToken: RTokenName;
}

const RPoolLiveList = (props: Props) => {
  const { list, viewMyStakes } = props;

  const balanceRAtom = useRTokenBalance(TokenStandard.Native, TokenName.ATOM);
  const balanceRMatic = useRTokenBalance(TokenStandard.Native, TokenName.MATIC);
  const balanceREth = useRTokenBalance(TokenStandard.Native, TokenName.ETH);
  const balanceRDot = useRTokenBalance(TokenStandard.Native, TokenName.DOT);
  const balanceRKsm = useRTokenBalance(TokenStandard.Native, TokenName.KSM);
  const balanceRBnb = useRTokenBalance(TokenStandard.Native, TokenName.BNB);
  const balanceRSol = useRTokenBalance(TokenStandard.Native, TokenName.SOL);

  const getRTokenBalance = (rTokenName: RTokenName) => {
    const tokenName = rTokenNameToTokenName(rTokenName);
    if (tokenName === TokenName.ATOM) return balanceRAtom;
    if (tokenName === TokenName.BNB) return balanceRBnb;
    if (tokenName === TokenName.DOT) return balanceRDot;
    if (tokenName === TokenName.ETH) return balanceREth;
    if (tokenName === TokenName.KSM) return balanceRKsm;
    if (tokenName === TokenName.MATIC) return balanceRMatic;
    if (tokenName === TokenName.SOL) return balanceRSol;
  };

  const flatList = useMemo(() => {
    const validList = list.filter((item: RTokenListItem) => {
      const criteria = Array.isArray(item.children) && item.children.length > 0;
      if (viewMyStakes) {
        const rTokenBalance = getRTokenBalance(item.rToken);
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
  }, [
    list,
    viewMyStakes,
    balanceRAtom,
    balanceRBnb,
    balanceRDot,
    balanceREth,
    balanceRKsm,
    balanceRMatic,
    balanceRSol,
  ]);

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
            <MintTokenCard key={`${item.rToken}${index}`} data={item} />
          ))}
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default RPoolLiveList;
