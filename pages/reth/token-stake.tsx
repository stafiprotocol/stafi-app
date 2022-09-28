import classNames from "classnames";
import { Button } from "components/button";
import { CustomLoading } from "components/CustomLoading";
import { EmptyContent } from "components/EmptyContent";
import { RethLayout } from "components/layout_reth";
import { ChooseStakeTypeModal } from "components/modal/ChooseStakeTypeModal";
import { PrimaryLoading } from "components/PrimaryLoading";
import { useEthDepositList } from "hooks/useEthStakeList";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { RethStakeLayout } from "../../components/layout_reth_stake";
import { TokenStakeTabs } from "../../components/reth/TokenStakeTabs";
import { WaitingStakeCard } from "../../components/reth/WaitingStakeCard";

const TokenStake = () => {
  const router = useRouter();
  const [tab, setTab] = useState<"unmatched" | "staked" | "matched">(
    "unmatched"
  );
  const [chooseStakeTypeModalVisible, setChooseStakeTypeModalVisible] =
    useState(false);

  const { depositList, loading } = useEthDepositList();

  const [displayList, stakableList] = useMemo(() => {
    return [
      depositList.filter((item) => {
        return (
          (tab === "staked" && item.status == "3") ||
          (tab === "unmatched" && item.status !== "3")
        );
      }),
      depositList.filter((item) => {
        return tab === "unmatched" && item.status === "2";
      }),
    ];
  }, [depositList, tab]);

  const trustDepositNumber = useMemo(() => {
    return stakableList.filter(
      (item) => item.type === "trust" && item.status !== "3"
    ).length;
  }, [stakableList]);

  return (
    <div className="pt-[.76rem] flex flex-col items-stretch">
      <div className="self-center text-[.42rem] text-white font-[700]">
        Token Stake
      </div>

      <div className="mt-[.55rem]">
        <TokenStakeTabs selectedTab={tab} onChange={setTab} />
      </div>

      <div className="mt-[.75rem] flex justify-start flex-wrap px-[1.6rem] min-h-[3rem] relative">
        {!loading && displayList.length === 0 && (
          <div className="flex-1">
            <EmptyContent />
          </div>
        )}

        {loading && (
          <div className="flex justify-center absolute left-0 right-0 top-[.8rem]">
            <PrimaryLoading size="1rem" />
          </div>
        )}

        {displayList.map((depositItem) => (
          <WaitingStakeCard
            key={depositItem.type + depositItem.index}
            depositItem={depositItem}
          />
        ))}
      </div>

      <div
        className={classNames("mx-[.75rem] mb-[1rem]", {
          invisible: tab !== "unmatched",
        })}
        onClick={() => {
          const trustList = stakableList.filter(
            (item) => item.type === "trust"
          );
          const soloList = stakableList.filter((item) => item.type === "solo");
          if (trustList.length > 0 && soloList.length > 0) {
            setChooseStakeTypeModalVisible(true);
            return;
          }
          const pubkeys = stakableList.map((item) => item.pubkey);
          router.push(
            {
              pathname: "/reth/stake",
              query: {
                pubkeys: pubkeys,
                depositType: trustList.length > 0 ? "trust" : "solo",
              },
            },
            "/reth/stake"
          );
        }}
      >
        <Button height="1.3rem" disabled={stakableList.length === 0}>
          Apply for stake({stakableList.length})
        </Button>
      </div>

      <ChooseStakeTypeModal
        visible={chooseStakeTypeModalVisible}
        trustDepositNumber={trustDepositNumber}
        onClose={() => {
          setChooseStakeTypeModalVisible(false);
        }}
        onConfirm={() => {
          setChooseStakeTypeModalVisible(false);
          const trustList = stakableList.filter(
            (item) => item.type === "trust"
          );
          const pubkeys = trustList.map((item) => item.pubkey);
          router.push(
            {
              pathname: "/reth/stake",
              query: { pubkeys: pubkeys, depositType: "trust" },
            },
            "/reth/stake"
          );
        }}
      />
    </div>
  );
};

TokenStake.getLayout = (page: ReactElement) => {
  return (
    <RethLayout>
      <RethStakeLayout>{page}</RethStakeLayout>
    </RethLayout>
  );
};

export default TokenStake;
