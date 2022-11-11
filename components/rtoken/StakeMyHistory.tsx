import { CollapseCard } from "components/common/CollapseCard";
import { TokenName } from "interfaces/common";
import { useRouter } from "next/router";
import { useState } from "react";
import { StakeMyRewardList } from "./StakeMyRewardList";
import { StakeMyUnbondList } from "./StakeMyUnbondList";
import { StakeOverallList } from "./StakeOverallList";

interface StakeMyHistoryProps {
  tokenName: TokenName;
}

export const StakeMyHistory = (props: StakeMyHistoryProps) => {
  const router = useRouter();
  const [tab, setTab] = useState<"overall" | "reward" | "unbond">("overall");

  return (
    <CollapseCard
      background="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={<div className="text-white text-[.32rem]">My History</div>}
    >
      <div className="mx-[.56rem] flex items-center justify-between">
        <div
          className="bg-[#1a2835] border-[1px] border-solid border-[#1a2835] h-[.65rem] rounded-[.33rem] flex"
          style={{ backdropFilter: "blur(1.35rem)" }}
        >
          <div
            className="cursor-pointer w-[1.6rem] h-full rounded-[.33rem] flex items-center justify-center text-[.24rem]"
            style={{
              background:
                tab === "overall"
                  ? "linear-gradient(140.73deg, #0093ed 4.72%, #00f3ab 96.52%)"
                  : "#1a2835",
              border:
                tab === "overall" ? "1px solid rgba(38, 73, 78, 0.5)" : "",
              color: tab === "overall" ? "#1a2835" : "#9dafbe",
              backdropFilter: tab === "overall" ? "blur(1.35rem)" : "",
            }}
            onClick={() => setTab("overall")}
          >
            Overall
          </div>
          <div
            className="cursor-pointer w-[1.6rem] h-full rounded-[.33rem] flex items-center justify-center text-[.24rem]"
            style={{
              background:
                tab === "reward"
                  ? "linear-gradient(140.73deg, #0093ed 4.72%, #00f3ab 96.52%)"
                  : "#1a2835",
              border: tab === "reward" ? "1px solid rgba(38, 73, 78, 0.5)" : "",
              color: tab === "reward" ? "#1a2835" : "#9dafbe",
              backdropFilter: tab === "reward" ? "blur(1.35rem)" : "",
            }}
            onClick={() => setTab("reward")}
          >
            Reward
          </div>
          <div
            className="cursor-pointer w-[1.6rem] h-full rounded-[.33rem] flex items-center justify-center text-[.24rem]"
            style={{
              background:
                tab === "unbond"
                  ? "linear-gradient(140.73deg, #0093ed 4.72%, #00f3ab 96.52%)"
                  : "#1a2835",
              border: tab === "unbond" ? "1px solid rgba(38, 73, 78, 0.5)" : "",
              color: tab === "unbond" ? "#1a2835" : "#9dafbe",
              backdropFilter: tab === "unbond" ? "blur(1.35rem)" : "",
            }}
            onClick={() => setTab("unbond")}
          >
            Unbond
          </div>
        </div>
      </div>

      {tab === "overall" && <StakeOverallList tokenName={props.tokenName} />}

      {tab === "reward" && <StakeMyRewardList tokenName={props.tokenName} />}

      {tab === "unbond" && <StakeMyUnbondList />}
    </CollapseCard>
  );
};
