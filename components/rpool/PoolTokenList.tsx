import { useAppDispatch, useAppSelector } from "hooks/common";
import { useAppSlice } from "hooks/selector";
import { RTokenListItem } from "hooks/useRPoolMintRTokenActs";
import { useWalletAccount } from "hooks/useWalletAccount";
import { RTokenName } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import { useEffect, useState } from "react";
import { getAllUserActs } from "redux/reducers/MintProgramSlice";
import { RootState } from "redux/store";
import MintTokenCard from "./tokenCard/MintTokenCard";
import RPoolFinishedList from "./tokenList/FinishedList";
import RPoolLiveList from "./tokenList/LiveList";

interface Props {
  // programTab: ProgramTab;
  liveList: RTokenListItem[];
  finishedList: RTokenListItem[];
  rTokenBalances: {
    [rTokenName in RTokenName]?: string;
  };
  queryActsLoading: boolean;
  firstQueryActs: boolean;
  firstQueryUserActs: boolean;
}

const PoolTokenList = (props: Props) => {
  const dispatch = useAppDispatch();

  const { updateFlag15s, refreshDataFlag } = useAppSlice();
  const { polkadotAccount, metaMaskAccount } = useWalletAccount();

  const { userActs, queryUserActsLoading } = useAppSelector(
    (state: RootState) => {
      return {
        userActs: state.mintProgram.userActs,
        queryUserActsLoading: state.mintProgram.queryUserActsLoading,
      };
    }
  );

  const [tab, setTab] = useState<"live" | "finished">("live");
  const [viewMyStakes, setViewMyStakes] = useState<boolean>(false);

  useEffect(() => {
    if (!polkadotAccount || !metaMaskAccount) {
      return;
    }
    dispatch(getAllUserActs());
  }, [
    dispatch,
    viewMyStakes,
    polkadotAccount,
    metaMaskAccount,
    updateFlag15s,
    refreshDataFlag,
  ]);

  return (
    <>
      <div className="mt-[.62rem] flex items-center">
        <div
          className="bg-[#1a283533] border-[1px] border-solid border-[#1a2835] h-[.65rem] rounded-[.33rem] flex"
          style={{ backdropFilter: "blur(1.35rem)" }}
        >
          <div
            className="cursor-pointer w-[1.82rem] h-full rounded-[.33rem] flex items-center justify-center text-[.24rem]"
            style={{
              background:
                tab === "live"
                  ? "linear-gradient(140.73deg, #0093ed 4.72%, #00f3ab 96.52%)"
                  : "#1a283533",
              border: tab === "live" ? "1px solid rgba(38, 73, 78, 0.5)" : "",
              color: tab === "live" ? "#1a2835" : "#9dafbe",
              backdropFilter: tab === "live" ? "blur(1.35rem)" : "blur(.67rem)",
              fontWeight: tab === "live" ? "700" : "400",
            }}
            onClick={() => setTab("live")}
          >
            Live
          </div>
          <div
            className="cursor-pointer w-[1.82rem] h-full rounded-[.33rem] flex items-center justify-center text-[.24rem]"
            style={{
              background:
                tab === "finished"
                  ? "linear-gradient(140.73deg, #0093ed 4.72%, #00f3ab 96.52%)"
                  : "#1a283533",
              border:
                tab === "finished" ? "1px solid rgba(38, 73, 78, 0.5)" : "",
              color: tab === "finished" ? "#1a2835" : "#9dafbe",
              backdropFilter:
                tab === "finished" ? "blur(1.35rem)" : "blur(.67rem)",
              fontWeight: tab === "finished" ? "700" : "400",
            }}
            onClick={() => setTab("finished")}
          >
            Finished
          </div>
        </div>

        <div
          className="bg-[#1a283533] border-[1px] border-solid border-[#1a2835] h-[.56rem] rounded-[.28rem] flex ml-[.73rem]"
          style={{ backdropFilter: "blur(1.35rem)" }}
          onClick={() => setViewMyStakes(!viewMyStakes)}
        >
          <div
            className="cursor-pointer w-[.56rem] h-full rounded-[.28rem]"
            style={{
              background: !viewMyStakes ? "#5B6872" : "#1a283533",
              border: !viewMyStakes ? "1px solid rgba(38, 73, 78, 0.5)" : "",
            }}
          />
          <div
            className="cursor-pointer w-[.56rem] h-full rounded-[.28rem]"
            style={{
              background: viewMyStakes
                ? "linear-gradient(140.73deg, #0093ed 4.72%, #00f3ab 96.52%)"
                : "#1a283533",
              border: viewMyStakes ? "1px solid rgba(38, 73, 78, 0.5)" : "",
            }}
          />
        </div>

        <div className="ml-[.18rem] text-text1 text-[.24rem]">
          View My Stakes
        </div>
      </div>

      {tab === "live" && (
        <RPoolLiveList
          loading={queryUserActsLoading}
          userActs={userActs}
          firstQueryLoading={props.firstQueryActs}
          queryActsLoading={props.queryActsLoading}
          rTokenBalances={props.rTokenBalances}
          viewMyStakes={viewMyStakes}
          // programTab={props.programTab}
          list={props.liveList}
          firstQueryUserActs={props.firstQueryActs}
        />
      )}

      {tab === "finished" && (
        <RPoolFinishedList
          loading={queryUserActsLoading}
          userActs={userActs}
          firstQueryActs={props.firstQueryActs}
          queryActsLoading={props.queryActsLoading}
          rTokenBalances={props.rTokenBalances}
          viewMyStakes={viewMyStakes}
          // programTab={props.programTab}
          list={props.finishedList}
          firstQueryUserActs={props.firstQueryUserActs}
        />
      )}
    </>
  );
};

export default PoolTokenList;
