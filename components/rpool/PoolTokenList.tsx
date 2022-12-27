import { RTokenListItem } from "hooks/useRPoolMintRTokenActs";
import { RTokenName } from "interfaces/common";
import { ProgramTab } from "pages/rpool";
import { useState } from "react";
import MintTokenCard from "./tokenCard/MintTokenCard";
import RPoolFinishedList from "./tokenList/FinishedList";
import RPoolLiveList from "./tokenList/LiveList";

interface Props {
  programTab: ProgramTab;
  liveList: RTokenListItem[];
  finishedList: RTokenListItem[];
  rTokenBalances: {
    [rTokenName in RTokenName]?: string;
  };
	queryActsLoading: boolean;
	firstQueryActs: boolean;
}

const PoolTokenList = (props: Props) => {
  const [tab, setTab] = useState<"live" | "finished">("live");
  const [viewMyStakes, setViewMyStakes] = useState<boolean>(false);

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
					firstQueryLoading={props.firstQueryActs}
					queryActsLoading={props.queryActsLoading}
          rTokenBalances={props.rTokenBalances}
          viewMyStakes={viewMyStakes}
          programTab={props.programTab}
          list={props.liveList}
        />
      )}

      {tab === "finished" && (
        <RPoolFinishedList
					firstQueryActs={props.firstQueryActs}
					queryActsLoading={props.queryActsLoading}
          rTokenBalances={props.rTokenBalances}
          viewMyStakes={viewMyStakes}
          programTab={props.programTab}
          list={props.finishedList}
        />
      )}
    </>
  );
};

export default PoolTokenList;
