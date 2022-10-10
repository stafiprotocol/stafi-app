import classNames from "classnames";
import { CollapseCard } from "components/CollapseCard";
import { EmptyContent } from "components/EmptyContent";
import { Icomoon } from "components/Icomoon";
import { EthRunNodesModal } from "components/modal/EthRunNodesModal";
import { CustomPagination } from "components/pagination";
import { RequestStatus } from "interfaces";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { getEthPubkeyStatusText } from "utils/eth";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import styles from "../../../styles/reth/MyData.module.scss";

interface Pubkey {
  pubkey: string;
  status: number;
}

interface PublicKeyListProps {
  pubkeyList: Pubkey[];
  totalCount: number;
  requestStatus: RequestStatus;
}

export const PublicKeyList = (props: PublicKeyListProps) => {
  const { pubkeyList, totalCount, requestStatus } = props;
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "active" | "unrespond">("all");
  const [page, setPage] = useState(1);
  const [runNodesModalVisible, setRunNodesModalVisible] = useState(false);

  const displayList = useMemo(() => {
    return pubkeyList.filter((item) => {
      if (tab === "active") {
        return item.status !== 4;
      } else if (tab === "unrespond") {
        return item.status === 4;
      } else {
        return true;
      }
    });
  }, [pubkeyList, tab]);

  return (
    <CollapseCard
      backgroundColor="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={
        <div className="text-white text-[.32rem]">
          Public Key List {totalCount > 0 ? `(${totalCount})` : ""}
        </div>
      }
    >
      <div className="mt-[.4rem] mx-[.56rem] flex items-center justify-between">
        <div className="flex items-center">
          <div className={styles["tab-container"]}>
            <div
              className={
                tab === "all" ? styles["tab-item-active"] : styles["tab-item"]
              }
              onClick={() => setTab("all")}
            >
              All
            </div>
            <div
              className={
                tab === "active"
                  ? styles["tab-item-active"]
                  : styles["tab-item"]
              }
              onClick={() => setTab("active")}
            >
              Active
            </div>
            <div
              className={
                tab === "unrespond"
                  ? styles["tab-item-active"]
                  : styles["tab-item"]
              }
              onClick={() => setTab("unrespond")}
            >
              Unrespond
            </div>
          </div>
        </div>

        <div
          className={styles["run-nodes"]}
          onClick={() => setRunNodesModalVisible(true)}
        >
          <div>Run Nodes</div>
          <Icomoon icon="right" size="0.19rem" color="#00F3AB" />
        </div>
      </div>

      <div className="mt-[.56rem] min-h-[2rem]">
        {displayList.length > 0 && (
          <div className="flex">
            <div className="flex justify-center flex-grow-[2]">
              <section className="flex-1 flex justify-center items-center">
                <div className="mr-[.07rem] text-[.2rem] text-text2">
                  Public Key
                </div>
                <Icomoon icon="question" size="0.16rem" color="#5B6872" />
              </section>
            </div>
            <div className="flex justify-center flex-grow-[1]">
              <section className="flex-1 flex justify-center items-center">
                <div className="mr-[.07rem] text-[.2rem] text-text2">
                  Status
                </div>
                <Icomoon icon="question" size="0.16rem" color="#5B6872" />
              </section>
            </div>
          </div>
        )}

        {displayList.map((item, index) => (
          <div
            key={index}
            className={
              index % 2 === 0
                ? styles["public-key-item"]
                : styles["public-key-item-even"]
            }
          >
            <div className="flex justify-center flex-grow-[2]">
              <section className="flex-1 flex justify-center items-center">
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(item.pubkey).then(() => {
                      snackbarUtil.success("Copied");
                    });
                  }}
                >
                  <Icomoon icon="copy" size="0.2rem" color="#9DAFBE" />
                </div>

                <div className="ml-[.1rem] text-[.24rem] text-text2">
                  {getShortAddress(item.pubkey, 20)}
                </div>
              </section>
            </div>

            <div className="flex justify-center flex-grow-[1]">
              <section
                className="flex-1 flex justify-center items-center cursor-pointer"
                onClick={() => {
                  router.push(`/reth/pubkey-detail/${item.pubkey}`);
                }}
              >
                <div
                  className={classNames(
                    "mr-[.07rem] text-[.2rem]",
                    getEthPubkeyStatusText(item.status + "") === "Failed" ||
                      getEthPubkeyStatusText(item.status + "") === "Unmatched"
                      ? "text-error"
                      : "text-primary"
                  )}
                >
                  {getEthPubkeyStatusText(item.status + "")}
                </div>
                <Icomoon icon="right" size="0.16rem" color="#9DAFBE" />
              </section>
            </div>
          </div>
        ))}

        {displayList.length === 0 && (
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
            <Link href="/reth/choose-validator">
              <div className="mt-[.3rem] flex items-center cursor-pointer">
                <div className="text-text1 text-[.24rem] mr-[.1rem]">
                  Make a deposit
                </div>
                <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
              </div>
            </Link>
          </div>
        )}
      </div>

      {displayList.length > 0 && (
        <div className="mt-[.36rem] flex justify-center">
          <CustomPagination
            totalCount={props.totalCount}
            page={page}
            onChange={setPage}
          />
        </div>
      )}

      <EthRunNodesModal
        visible={runNodesModalVisible}
        onClose={() => setRunNodesModalVisible(false)}
      />
    </CollapseCard>
  );
};
