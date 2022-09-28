import { TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import classNames from "classnames";
import { Icomoon } from "components/Icomoon";
import { EthRunNodesModal } from "components/modal/EthRunNodesModal";
import { CustomPagination } from "components/pagination";
import { useState } from "react";
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
}

export const PublicKeyList = (props: PublicKeyListProps) => {
  const [tab, setTab] = useState<"all" | "active" | "unrespond">("all");
  const [page, setPage] = useState(1);
  const [runNodesModalVisible, setRunNodesModalVisible] = useState(false);

  return (
    <div className={classNames(styles["card-container"], "mt-[.36rem]")}>
      <div className="flex items-center justify-between mx-[.56rem]">
        <div className="text-white text-[.32rem]">
          Public Key List {props.totalCount > 0 ? `(${props.totalCount})` : ""}
        </div>

        <div className="rotate-90">
          <Icomoon icon="right" size="0.19rem" color="#ffffff" />
        </div>
      </div>

      <div className="mt-[.45rem] mx-[.56rem] flex items-center justify-between">
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

      <div className="mt-[.56rem]">
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
              <div className="mr-[.07rem] text-[.2rem] text-text2">Status</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
            </section>
          </div>
        </div>

        {props.pubkeyList.map((item, index) => (
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
              <section className="flex-1 flex justify-center items-center">
                <div className="mr-[.07rem] text-[.2rem] text-primary">
                  Active
                </div>
                <Icomoon icon="right" size="0.16rem" color="#9DAFBE" />
              </section>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[.36rem] flex justify-center">
        <CustomPagination
          totalCount={props.totalCount}
          page={page}
          onChange={setPage}
        />
      </div>

      <EthRunNodesModal
        visible={runNodesModalVisible}
        onClose={() => setRunNodesModalVisible(false)}
      />
    </div>
  );
};
