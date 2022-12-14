import classNames from "classnames";
import { AnimateBee } from "components/common/AnimateBee";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { CircularLoading } from "components/common/CircularLoading";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { getStafiLightNodeAbi, getStafiSuperNodeAbi } from "config/erc20Abi";
import { getEtherScanTxUrl } from "config/explorer";
import { getErc20ContractConfig } from "config/erc20Contract";
import { useInterval } from "hooks/useInterval";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import checkFileError from "public/check_file_error.svg";
import checkFileSuccess from "public/check_file_success.svg";
import rectangle from "public/rectangle_h.svg";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "styles/reth/CheckFile.module.scss";
import { getShortAddress } from "utils/string";
import { createWeb3 } from "utils/web3Utils";

const CheckFile = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [showDetail, setShowDetail] = useState(false);
  const { txHash } = router.query;

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Token Stake", path: "/validator/reth/token-stake" },
      { name: "Check File" },
    ]);
  }, [setNavigation]);

  const depositPubkeys = useMemo(() => {
    const { pubkeys } = router.query;
    if (!pubkeys) {
      return [];
    } else if (!Array.isArray(pubkeys)) {
      return [pubkeys];
    }
    return pubkeys;
  }, [router]);

  const fetchStatus = useCallback(async () => {
    if (status !== "loading") {
      return;
    }

    const type = router.query?.type;
    if (Array.isArray(type) || depositPubkeys.length === 0) {
      router.push("/validator/reth/token-stake");
      return;
    }

    const web3 = createWeb3();
    const ethContractConfig = getErc20ContractConfig();
    let contract = new web3.eth.Contract(
      type === "solo" ? getStafiLightNodeAbi() : getStafiSuperNodeAbi(),
      type === "solo"
        ? ethContractConfig.stafiLightNode
        : ethContractConfig.stafiSuperNode
    );

    const requests = depositPubkeys.map((pubkey) => {
      return (async () => {
        const method =
          type === "solo"
            ? contract.methods.getLightNodePubkeyStatus
            : contract.methods.getSuperNodePubkeyStatus;
        const status = await method(pubkey).call();
        console.log("status", status);
        return status;
      })();
    });

    try {
      const statusList = await Promise.all(requests);
      let changeStatus = true;
      let newStatus = "";
      statusList.every((status) => {
        console.log("status", status);

        if (status) {
          if (status === "4") {
            changeStatus = true;
            newStatus = "4";
            return false;
          }
          if (!newStatus) {
            newStatus = status;
          } else if (newStatus !== status) {
            changeStatus = false;
          }
        }
      });

      if (changeStatus) {
        if (newStatus === "4") {
          setStatus("error");
        } else if (newStatus === "1") {
          setStatus("loading");
        } else {
          setStatus("success");
        }
      }
    } catch (err: unknown) {}
  }, [router, status, depositPubkeys]);

  useInterval(fetchStatus, 8000);

  return (
    <div>
      <Card background="rgba(26, 40, 53, 0.2)">
        <div className="flex flex-col items-center pb-[.85rem]">
          <div className="self-center relative w-[2.4rem] h-[.9rem]">
            <Image src={rectangle} layout="fill" alt="rectangle" />
          </div>

          <div
            className={classNames(
              "mt-[0rem] font-[700] text-[.42rem]",
              status === "loading"
                ? "text-white"
                : status === "success"
                ? "text-primary"
                : "text-error"
            )}
          >
            {status === "loading"
              ? "File Submitted, wait for checking???"
              : status === "success"
              ? (router.query.type as string) === "solo"
                ? `${depositPubkeys.length * 4} ETH deposited successfully!`
                : "Deposited successfully!"
              : "Transaction Failed"}
          </div>

          <div
            className={classNames(
              "mt-[.3rem] text-[.24rem]",
              status === "loading"
                ? "text-text2"
                : status === "success"
                ? "text-primary"
                : "text-error"
            )}
          >
            {status === "loading"
              ? "It may take 5 minutes, please wait for a moment"
              : status === "success"
              ? "You are now onboard"
              : "File check failed"}
          </div>

          <a
            className="mt-[.57rem] text-warning text-[.24rem]"
            href={getEtherScanTxUrl(txHash as string)}
            target="_blank"
            rel="noreferrer"
          >
            View on Etherscan
          </a>

          <div
            className="mt-[.24rem] flex items-center cursor-pointer"
            onClick={() => setShowDetail(!showDetail)}
          >
            <div
              className={classNames(
                "text-[.24rem]",
                showDetail ? "text-white" : "text-text1"
              )}
            >
              Details
            </div>
            <div
              className={classNames(
                "ml-[.16rem]",
                showDetail ? "-rotate-90" : "rotate-90"
              )}
            >
              <Icomoon
                icon="right"
                size="0.19rem"
                color={showDetail ? "#ffffff" : "#9DAFBE"}
              />
            </div>
          </div>

          <div className="self-stretch relative flex flex-col items-center">
            {status === "loading" && <AnimateBee />}

            {status === "success" && (
              <div className="mt-[.56rem] w-[1.8rem] h-[1.8rem] relative">
                <Image src={checkFileSuccess} layout="fill" alt="success" />
              </div>
            )}

            {status === "error" && (
              <div className="mt-[.56rem] w-[1.8rem] h-[1.8rem] relative">
                <Image src={checkFileError} layout="fill" alt="error" />
              </div>
            )}

            {status === "error" && (
              <Link href="/validator/reth/choose-validator">
                <div className="mt-[.56rem] flex items-center text-[.24rem] text-text1 font-[400] cursor-pointer">
                  Reupload file now
                  <div className="ml-[.12rem]">
                    <Icomoon icon="arrow-right" size=".26rem" color="#9DAFBE" />
                  </div>
                </div>
              </Link>
            )}

            {status !== "success" && (
              <a
                className="mt-[.8rem] text-link underline text-[.24rem]"
                href="https://discord.com/invite/jB77etn"
                target="_blank"
                rel="noreferrer"
              >
                Go for community help
              </a>
            )}

            {status === "success" && (
              <div className="self-stretch mx-[.75rem] mt-[.56rem]">
                <Button
                  fontSize="0.32rem"
                  onClick={() => router.push("/validator/reth/token-stake")}
                >
                  Go Check My Stake
                </Button>
              </div>
            )}

            {showDetail && (
              <div className={styles["detail-container"]}>
                <div className={styles["detail-item"]}>
                  <div className="flex items-center">
                    <div className={styles["detail-indicator-dot"]} />
                    <div className="text-active text-[.2rem] font-[700] ml-[.08rem]">
                      Send
                    </div>

                    <div className="ml-[.26rem]">
                      <Icomoon icon="nike" size=".27rem" color="#0095EB" />
                    </div>
                  </div>

                  <div className="ml-[.32rem] mt-[.14rem] text-active text-[.16rem]">
                    <div>Broadcasting...</div>
                    <div className="mt-[.08rem]">Packing...</div>
                    <div className="mt-[.08rem]">Finalizing...</div>
                    <div className="mt-[.08rem]">
                      Check Tx{" "}
                      <a
                        className="underline"
                        href={getEtherScanTxUrl(txHash as string)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {getShortAddress(txHash as string, 4)}
                      </a>
                    </div>
                  </div>
                </div>

                <div className={styles["detail-item"]}>
                  <div className="flex items-center">
                    <div className={styles["detail-indicator-dot"]} />
                    <div
                      className={classNames(
                        "text-active text-[.2rem] font-[700] ml-[.08rem]"
                      )}
                    >
                      Check
                    </div>

                    {status === "loading" && (
                      <span className="ml-[.26rem]">
                        <CircularLoading color="info" size=".24rem" />
                      </span>
                    )}

                    {status === "success" && (
                      <span className="ml-[.26rem]">
                        <Icomoon icon="nike" size=".27rem" color="#0095EB" />
                      </span>
                    )}
                  </div>

                  <div className="ml-[.32rem] mt-[.14rem] text-active text-[.16rem]">
                    {status === "error" && (
                      <div className="text-error">Error</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

CheckFile.getLayout = (page: ReactElement) => {
  return <ValidatorLayout>{page}</ValidatorLayout>;
};

export default CheckFile;
