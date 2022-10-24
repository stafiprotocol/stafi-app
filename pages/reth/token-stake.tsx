import classNames from "classnames";
import { Button } from "components/button";
import { EmptyContent } from "components/EmptyContent";
import { Icomoon } from "components/Icomoon";
import { MyLayoutContext } from "components/layout";
import { RethLayout } from "components/layout_reth";
import { ChooseStakeTypeModal } from "components/modal/ChooseStakeTypeModal";
import { PrimaryLoading } from "components/PrimaryLoading";
import { useEthPoolData } from "hooks/useEthPoolData";
import { useEthStakeList } from "hooks/useEthStakeList";
import { cloneDeep } from "lodash";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { RethStakeLayout } from "../../components/layout_reth_stake";
import { TokenStakeTabs } from "../../components/reth/TokenStakeTabs";
import { WaitingStakeCard } from "../../components/reth/WaitingStakeCard";

const TokenStake = (props: any) => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();
  const [tab, setTab] = useState<"unmatched" | "staked" | "others">(
    "unmatched"
  );
  const [chooseStakeTypeModalVisible, setChooseStakeTypeModalVisible] =
    useState(false);

  const { depositList, loading } = useEthStakeList();
  const { unmatchedEth } = useEthPoolData();

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    const { tab: queryTab } = router.query;

    if (queryTab) {
      if (queryTab === "staked") {
        setTab("staked");
      } else if (queryTab === "others") {
        setTab("others");
      } else {
        setTab("unmatched");
      }
    } else {
      setTab("unmatched");
    }
  }, [router]);

  const [displayList, stakableList] = useMemo(() => {
    const newList = depositList.sort((a, b) => {
      if (a.status === "2" && b.status !== "2") {
        return -1;
      } else if (a.type === "trusted" && b.type !== "trusted") {
        return -1;
      }
      return 0;
    });

    return [
      newList.filter((item) => {
        return (
          (tab === "unmatched" && item.status === "2") ||
          (tab === "staked" && (item.status === "3" || item.status === "9")) ||
          (tab === "others" &&
            item.status !== "2" &&
            item.status !== "3" &&
            item.status !== "9")
        );
      }),
      newList.filter((item) => {
        return tab === "unmatched" && item.status === "2";
      }),
    ];
  }, [depositList, tab]);

  const trustDepositNumber = useMemo(() => {
    const trustStakableList = stakableList.filter(
      (item) => item.type === "trusted" && item.status !== "3"
    );
    return Math.min(
      trustStakableList.length,
      Math.floor(Number(unmatchedEth) / 31)
    );
  }, [stakableList, unmatchedEth]);

  const stakableLength = useMemo(() => {
    const list = cloneDeep(stakableList).sort((a, b) => {
      return a.type.localeCompare(b.type);
    });
    let length = 0;
    let remainingEth = unmatchedEth;
    list.forEach((item) => {
      if (item.type === "trusted") {
        if (item.status === "2" && Number(remainingEth) > 31) {
          length++;
          remainingEth = Number(unmatchedEth) - 31 + "";
        }
      } else {
        if (item.status === "2" && Number(remainingEth) > 28) {
          length++;
          remainingEth = Number(unmatchedEth) - 28 + "";
        }
      }
    });

    return length;
  }, [stakableList, unmatchedEth]);

  return (
    <div className="pt-[.76rem] flex flex-col items-stretch">
      <div className="self-center text-[.42rem] text-white font-[700]">
        Token Stake
      </div>

      <div className="mt-[.55rem]">
        <TokenStakeTabs
          selectedTab={tab}
          onChange={(tab) => {
            router.push("/reth/token-stake?tab=" + tab);
          }}
        />
      </div>

      <div className="mt-[.75rem] flex justify-start flex-wrap px-[1.6rem] min-h-[3rem] relative">
        {!loading && displayList.length === 0 && (
          <div className="flex-1">
            <div className="flex flex-col items-center">
              <Link href="/reth/choose-validator">
                <div className="flex flex-col items-center cursor-pointer">
                  <EmptyContent mt="0.2rem" size=".8rem" />
                  <div className="mt-[.3rem] flex items-center">
                    <div className="text-text1 text-[.24rem] mr-[.1rem]">
                      Make a deposit
                    </div>
                    <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {loading && displayList.length === 0 && (
          <div className="flex justify-center absolute left-0 right-0 top-[.8rem]">
            <PrimaryLoading size="1rem" />
          </div>
        )}

        {displayList.map((depositItem) => (
          <WaitingStakeCard
            key={depositItem.type + depositItem.index}
            depositItem={depositItem}
            hasEnoughEth={
              depositItem.type === "trusted"
                ? Number(unmatchedEth) >= 31
                : Number(unmatchedEth) >= 28
            }
          />
        ))}
      </div>

      <div
        className={classNames("mx-[.75rem] mb-[1rem]", {
          invisible: tab !== "unmatched" || stakableLength <= 0,
        })}
      >
        <Button
          height="1.3rem"
          disabled={stakableLength <= 0}
          onClick={() => {
            const trustList = stakableList.filter(
              (item) => item.type === "trusted"
            );
            const soloList = stakableList.filter(
              (item) => item.type === "solo"
            );
            if (trustList.length > 0 && soloList.length > 0) {
              setChooseStakeTypeModalVisible(true);
              return;
            }
            const pubkeys = stakableList
              .slice(0, stakableLength)
              .map((item) => item.pubkey);
            router.push(
              {
                pathname: "/reth/stake",
                query: {
                  pubkeys: pubkeys,
                  depositType: trustList.length > 0 ? "trusted" : "solo",
                },
              },
              "/reth/stake"
            );
          }}
        >
          Apply for stake({stakableLength})
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
            (item) => item.type === "trusted"
          );
          const pubkeys = trustList
            .slice(0, trustDepositNumber)
            .map((item) => item.pubkey);
          router.push(
            {
              pathname: "/reth/stake",
              query: { pubkeys: pubkeys, depositType: "trusted" },
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

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   return {
//     props: {
//       navigations: [{ name: "rToken List", path: "/rtoken" }],
//     },
//   };
// };

export default TokenStake;
