import classNames from "classnames";
import { CollapseCard } from "components/common/CollapseCard";
import { EmptyContent } from "components/common/EmptyContent";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import { EthPubkeyDetailModal } from "components/modal/EthPubkeyDetailModal";
import { EthRunNodesModal } from "components/modal/EthRunNodesModal";
import { useEthPubkeyList } from "hooks/useEthPubkeyList";
import { EthPubkeyStatus } from "interfaces/common";
import Link from "next/link";
import { useState } from "react";
import { openLink } from "utils/common";
import { getEthPubkeyStatusText } from "utils/eth";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import styles from "../../../styles/reth/MyData.module.scss";
import { PubkeyStatusSelector } from "../PubkeyStatusSelector";

interface PublicKeyListProps {}

export const PublicKeyList = (props: PublicKeyListProps) => {
  const [page, setPage] = useState(1);
  const [runNodesModalVisible, setRunNodesModalVisible] = useState(false);
  const [pubkeyDetailModalVisible, setPubkeyDetailModalVisible] =
    useState(false);
  const [displayPubkey, setDisplayPubkey] = useState("");
  const [selectedStatusList, setSelectedStatusList] = useState([
    EthPubkeyStatus.active,
    EthPubkeyStatus.pending,
    EthPubkeyStatus.exited,
    EthPubkeyStatus.slashed,
  ]);

  const { requestStatus, pubkeyList, totalCount } = useEthPubkeyList(
    selectedStatusList,
    page
  );

  return (
    <CollapseCard
      background="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={
        <div className="text-white text-[.32rem]">
          Public Key List {totalCount > 0 ? `(${totalCount})` : ""}
        </div>
      }
    >
      <div className="mx-[.56rem] flex items-center justify-between">
        <PubkeyStatusSelector
          selectedStatusList={selectedStatusList}
          onChange={setSelectedStatusList}
        />

        <div
          className={styles["run-nodes"]}
          onClick={() => setRunNodesModalVisible(true)}
        >
          <div>Run Nodes</div>
          <Icomoon icon="right" size="0.19rem" color="#00F3AB" />
        </div>
      </div>

      <div className="mt-[.56rem] min-h-[2rem]">
        {totalCount > 0 && (
          <div className={styles["public-key-item"]} style={{ height: "auto" }}>
            <div className="flex justify-center">
              <section className="flex-1 flex justify-center items-center">
                <div className="mr-[.07rem] text-[.2rem] text-text2">
                  Validator Public Key
                </div>
              </section>
            </div>
            <div className="flex justify-center">
              <section
                className="flex-1 flex justify-center items-center cursor-pointer"
                onClick={() =>
                  openLink(
                    "https://docs.stafi.io/rtoken-app/reth-solution/original-validator-faq#8.what-are-the-reasons-for-staking-failure "
                  )
                }
              >
                <div className="mr-[.07rem] text-[.2rem] text-text2">
                  Status
                </div>
                <div>
                  <Icomoon icon="question" size="0.16rem" color="#5B6872" />
                </div>
              </section>
            </div>
          </div>
        )}

        {pubkeyList.map((item, index) => (
          <div
            key={index}
            className={
              index % 2 === 0
                ? styles["public-key-item"]
                : styles["public-key-item-even"]
            }
          >
            <div className="flex justify-center">
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

            <div className="flex justify-center">
              <section className="flex-1 flex justify-center items-center ">
                <div
                  className={classNames(
                    "mr-[.07rem] text-[.2rem] cursor-pointer",
                    getEthPubkeyStatusText(item.status + "") === "Failed" ||
                      getEthPubkeyStatusText(item.status + "") === "Unmatched"
                      ? "text-error"
                      : "text-primary"
                  )}
                  onClick={() => {
                    setDisplayPubkey(item.pubkey);
                    setPubkeyDetailModalVisible(true);
                  }}
                >
                  {getEthPubkeyStatusText(item.status + "")}
                </div>
                <Icomoon icon="right" size="0.16rem" color="#9DAFBE" />
              </section>
            </div>
          </div>
        ))}

        {totalCount === 0 && (
          <div className="flex flex-col items-center">
            <Link href="/validator/reth/choose-validator">
              <div className="flex flex-col items-center cursor-pointer">
                <EmptyContent mt="0.2rem" size=".8rem" hideText />
                <div className="mt-[.3rem] flex items-center">
                  <div className="text-text1 text-[.24rem] mr-[.1rem]">
                    Make a deposit
                  </div>
                  <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <div className="mt-[.36rem] flex justify-center">
          <CustomPagination
            totalCount={totalCount}
            page={page}
            onChange={setPage}
          />
        </div>
      )}

      <EthRunNodesModal
        visible={runNodesModalVisible}
        onClose={() => setRunNodesModalVisible(false)}
      />

      <EthPubkeyDetailModal
        visible={pubkeyDetailModalVisible}
        pubkey={displayPubkey}
        // pubkey={
        //   "0xb5f9b0c3b87913470ecf08bf968fe87e199d02f73a078c4d0187227975d34c69712d9f41833520dc7a261d9a6ac590ff"
        // }
        // visible={true}
        onClose={() => setPubkeyDetailModalVisible(false)}
      />
    </CollapseCard>
  );
};
