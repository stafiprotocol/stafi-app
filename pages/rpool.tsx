import { MyLayoutContext } from "components/layout/layout";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo } from "react";
import classNames from "classnames";
import RPoolBanner from "components/rpool/Banner";
import RPoolChart from "components/rpool/Chart";
import PoolTokenList from "components/rpool/PoolTokenList";
import MintFaq from "components/rpool/MintFaq";
import LpFaq from "components/rpool/LpFaq";
import { useRPoolMintRTokenActs } from "hooks/useRPoolMintRTokenActs";
import { RTokenName, TokenName, TokenStandard } from "interfaces/common";
import { useRTokenBalance } from "hooks/useRTokenBalance";

export enum ProgramTab {
  Mint = "mint",
  LP = "lp",
}

const RPoolPage = () => {
  const router = useRouter();

  const { setNavigation } = useContext(MyLayoutContext);

  const {
    totalMintedValue,
    totalRewardFis,
    liveList,
    finishedList,
    queryActsLoading,
    firstQueryActs,
  } = useRPoolMintRTokenActs();

  const balanceRAtom = useRTokenBalance(TokenStandard.Native, TokenName.ATOM);
  const balanceRMatic = useRTokenBalance(TokenStandard.Native, TokenName.MATIC);
  const balanceREth = useRTokenBalance(TokenStandard.Native, TokenName.ETH);
  const balanceRDot = useRTokenBalance(TokenStandard.Native, TokenName.DOT);
  const balanceRKsm = useRTokenBalance(TokenStandard.Native, TokenName.KSM);
  const balanceRBnb = useRTokenBalance(TokenStandard.Native, TokenName.BNB);
  const balanceRSol = useRTokenBalance(TokenStandard.Native, TokenName.SOL);

  const rTokenBalances = useMemo(() => {
    return {
      [RTokenName.rATOM]: balanceRAtom,
      [RTokenName.rBNB]: balanceRBnb,
      [RTokenName.rDOT]: balanceRDot,
      [RTokenName.rETH]: balanceREth,
      [RTokenName.rKSM]: balanceRKsm,
      [RTokenName.rMATIC]: balanceRMatic,
      [RTokenName.rSOL]: balanceRSol,
    };
  }, [
    balanceRAtom,
    balanceRBnb,
    balanceRDot,
    balanceREth,
    balanceRKsm,
    balanceRMatic,
    balanceRSol,
  ]);

  const switchProgramTab = (tab: ProgramTab) => {
    const currentTab = router.query.program;
    if (tab === currentTab) return;

    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        program: tab,
      },
    });
  };

  const currentPage = useMemo(() => {
    const currentTab = router.query.program;
    if (currentTab === ProgramTab.LP) {
      return ProgramTab.LP;
    }
    return ProgramTab.Mint;
  }, [router.query]);

  useEffect(() => {
    const programTabQuery = router.query.program;
    if (!programTabQuery) {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          program: ProgramTab.Mint,
          tokenStandard: TokenStandard.Native,
        },
      });
    }
  }, [router]);

  useEffect(() => {
    setNavigation([{ name: "rPool Mint", path: "/rpool" }]);
  }, [setNavigation]);

  return (
    <div>
      <div
        className="flex justify-center text-[.24rem] mb-[.32rem] h-[.28rem] items-center"
        style={{
          backdropFilter: "blur(.7rem)",
        }}
      >
        <ProgramTabItem
          programTab={ProgramTab.Mint}
          onClick={() => switchProgramTab(ProgramTab.Mint)}
          routerQuery={currentPage}
        />
        <ProgramTabItem
          programTab={ProgramTab.LP}
          onClick={() => switchProgramTab(ProgramTab.LP)}
          routerQuery={currentPage}
        />
      </div>

      <RPoolBanner programTab={currentPage} />

      <RPoolChart
        programTab={currentPage}
        totalMintedValue={totalMintedValue}
        totalRewardFis={totalRewardFis}
      />

      <PoolTokenList
        queryActsLoading={queryActsLoading}
        firstQueryActs={firstQueryActs}
        rTokenBalances={rTokenBalances}
        programTab={currentPage}
        liveList={liveList}
        finishedList={finishedList}
      />

      <div className="mt-[.56rem] text-white text-[.32rem]">FAQs</div>

      {currentPage === ProgramTab.Mint ? <MintFaq /> : <LpFaq />}
    </div>
  );
};

interface ProgramTabItemProps {
  programTab: ProgramTab;
  onClick: () => void;
  routerQuery: string | string[] | undefined;
}

const ProgramTabItem = (props: ProgramTabItemProps) => {
  const isActive = useMemo(() => {
    return props.routerQuery === props.programTab;
  }, [props.programTab, props.routerQuery]);

  return (
    <div className="flex flex-col items-center">
      <div
        className="cursor-pointer mx-[.16rem] h-[.28rem] leading-[.28rem]"
        style={{
          color: isActive ? "#FFFFFF" : "#9DAFBE",
          fontWeight: isActive ? 700 : 400,
        }}
        onClick={props.onClick}
      >
        {props.programTab === ProgramTab.Mint ? "Mint" : "LP"} Program
      </div>

      <div
        className={classNames(
          "w-[.4rem] h-[.12rem] rounded-[.32rem] mt-[.12rem]"
        )}
        style={{
          background: isActive
            ? "linear-gradient(140.73deg, #0093ED 4.72%, #00F3AB 96.52%)"
            : "",
          backdropFilter: "blur(.7rem)",
        }}
      />
    </div>
  );
};

export default RPoolPage;
