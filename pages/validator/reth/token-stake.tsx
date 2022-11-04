import classNames from "classnames";
import { Button } from "components/common/button";
import { EmptyContent } from "components/common/EmptyContent";
import { PrimaryLoading } from "components/common/PrimaryLoading";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { ValidatorTokenStakeLayout } from "components/layout/layout_validator_token_stake";
import { ChooseStakeTypeModal } from "components/modal/ChooseStakeTypeModal";
import { TokenStakeTabs } from "components/reth/TokenStakeTabs";
import { WaitingStakeCard } from "components/reth/WaitingStakeCard";
import {
  getEthValidatorSVFeeRecipient,
  getEthValidatorTVFeeRecipient,
} from "config/erc20Contract";
import { getEtherScanAccountUrl } from "config/explorer";
import { hooks } from "connectors/metaMask";
import { useEthMyData } from "hooks/useEthMyData";
import { useEthPoolData } from "hooks/useEthPoolData";
import { useEthStakeList } from "hooks/useEthStakeList";
import { cloneDeep } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import warningIcon from "public/icon_warning.svg";
import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { openLink } from "utils/common";
import {
  getStorage,
  removeStorage,
  saveStorage,
  STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP,
} from "utils/storage";
import { getShortAddress } from "utils/string";

const TokenStake = (props: any) => {
  const { useAccount } = hooks;
  const account = useAccount();
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();
  const [tab, setTab] = useState<"unmatched" | "staked" | "others">(
    "unmatched"
  );
  const [chooseStakeTypeModalVisible, setChooseStakeTypeModalVisible] =
    useState(false);
  const [showFeeWarning, setShowWarning] = useState(false);

  const { depositList, loading, firstLoading } = useEthStakeList();
  const { unmatchedEth } = useEthPoolData();
  const { totalCount } = useEthMyData();

  useEffect(() => {
    if (router.query.checkNewUser && totalCount <= 0) {
      router.replace("/validator/reth/choose-validator");
    }
  }, [totalCount, router]);

  useEffect(() => {
    const temp = getStorage(STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP);
    setShowWarning(!temp);
  }, []);

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
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
          (tab === "staked" &&
            (item.status === "3" ||
              item.status === "8" ||
              item.status === "9")) ||
          (tab === "others" &&
            item.status !== "2" &&
            item.status !== "3" &&
            item.status !== "8" &&
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
    <div className="flex flex-col items-stretch">
      <div
        className={classNames("px-[.56rem] py-[.32rem] bg-[#0095EB1A]", {
          hidden: !showFeeWarning,
        })}
      >
        <div className="flex justify-between">
          <div className="flex">
            <div className="relative w-[.24rem] h-[.24rem] min-w-[.24rem]">
              <Image src={warningIcon} layout="fill" alt="warning" />
            </div>
            <div className="text-warning text-[.2rem] ml-[.12rem] leading-normal mt-[-.02rem]">
              Please configure your Priority Fee recipient address for Solo
              Validator(SV) and Trusted Validator(TV), <br />
              otherwise you may be slashed by StaFi protocol.
            </div>
          </div>

          <div
            className="flex items-center mt-[-0.3rem] cursor-pointer"
            onClick={() => {
              openLink(
                "https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide#3.join-eth2-mainnet-by-running-prysm"
              );
            }}
          >
            <div className="text-warning text-[.24rem] mr-[.16rem]">
              Learn More
            </div>
            <Icomoon size=".26rem" icon="arrow-right" color="#0095EB" />
          </div>
        </div>

        <div className="mt-[.32rem] flex">
          <div
            className="border-[1px] border-solid border-[#0095EB80] rounded-[.12rem] flex items-center justify-center h-[.48rem] w-[3.4rem] text-warning text-[.2rem] cursor-pointer"
            onClick={() => {
              openLink(getEtherScanAccountUrl(getEthValidatorSVFeeRecipient()));
            }}
          >
            For SV: {getShortAddress(getEthValidatorSVFeeRecipient(), 4)}
          </div>

          <div
            className="ml-[.24rem] border-[1px] border-solid border-[#0095EB80] rounded-[.12rem] flex items-center justify-center h-[.48rem] w-[3.4rem] text-warning text-[.2rem] cursor-pointer"
            onClick={() => {
              openLink(getEtherScanAccountUrl(getEthValidatorTVFeeRecipient()));
            }}
          >
            For TV: {getShortAddress(getEthValidatorTVFeeRecipient(), 4)}
          </div>

          <div
            className="ml-[.24rem] bg-[#0095EB1A] rounded-[.12rem] flex items-center justify-center h-[.48rem] w-[3.4rem] text-warning text-[.2rem] cursor-pointer"
            onClick={() => {
              saveStorage(STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP, "1");
              setShowWarning(false);
            }}
          >
            Completed
          </div>
        </div>
      </div>

      <div className="mt-[.56rem] self-center text-[.42rem] text-white font-[700]">
        Token Stake
      </div>

      <div className="mt-[.55rem]">
        <TokenStakeTabs
          selectedTab={tab}
          onChange={(tab) => {
            router.push("/validator/reth/token-stake?tab=" + tab);
          }}
        />
      </div>

      <div className="mt-[.75rem] flex justify-start flex-wrap px-[1.6rem] min-h-[3rem] relative">
        {(!firstLoading || !account) && displayList.length === 0 && (
          <div className="flex-1">
            <div className="flex flex-col items-center">
              <Link href="/validator/reth/choose-validator">
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

        {loading && firstLoading && displayList.length === 0 && (
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
                pathname: "/validator/reth/stake",
                query: {
                  pubkeys: pubkeys,
                  depositType: trustList.length > 0 ? "trusted" : "solo",
                },
              },
              "/validator/reth/stake"
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
              pathname: "/validator/reth/stake",
              query: { pubkeys: pubkeys, depositType: "trusted" },
            },
            "/validator/reth/stake"
          );
        }}
      />
    </div>
  );
};

TokenStake.getLayout = (page: ReactElement) => {
  return (
    <ValidatorLayout>
      <ValidatorTokenStakeLayout>{page}</ValidatorTokenStakeLayout>
    </ValidatorLayout>
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
