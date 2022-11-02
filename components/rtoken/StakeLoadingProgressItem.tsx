import { Tooltip } from "@mui/material";
import classNames from "classnames";
import { CircularLoading } from "components/common/CircularLoading";
import { Icomoon } from "components/icon/Icomoon";
import { StakeLoadingProgressDetailItem } from "redux/reducers/AppSlice";
import { getShortAddress } from "utils/string";

interface StakeLoadingProgressItemProps {
  name: "Sending" | "Staking" | "Minting" | "Swapping";
  data: StakeLoadingProgressDetailItem | undefined;
  txHash?: string | undefined;
  scanUrl?: string | undefined;
}

export const StakeLoadingProgressItem = (
  props: StakeLoadingProgressItemProps
) => {
  const { data, name, txHash, scanUrl } = props;
  if (!data) {
    return null;
  }

  return (
    <div className="pb-[.3rem] px-[.3rem]">
      <div className="flex items-center">
        <div
          className="rounded-full w-[.24rem] h-[.24rem] bg-[#1A2835]"
          style={{
            border:
              data.totalStatus === "success"
                ? "0.5px solid #0095EB"
                : "0.5px solid #9DAFBE",
          }}
        />
        <div
          className={classNames(
            "text-[.2rem] font-[700] ml-[.08rem]",
            data.totalStatus === "success" ? "text-active" : "text-text1"
          )}
        >
          {name}
        </div>

        {data.totalStatus === "success" ? (
          <div className="ml-[.26rem]">
            <Icomoon icon="nike" size=".27rem" color="#0095EB" />
          </div>
        ) : data.totalStatus === "error" ? (
          <div className="ml-[.26rem]">
            <Icomoon icon="error" size=".27rem" color="#0095EB" />
          </div>
        ) : (
          <div className="ml-[.26rem]">
            <CircularLoading color="info" size=".24rem" />
          </div>
        )}
      </div>

      <div className={classNames("ml-[.32rem] mt-[.12rem]  text-[.16rem]")}>
        <div
          className={classNames(
            data.broadcastStatus === "success"
              ? "text-active"
              : data.broadcastStatus === "error"
              ? "text-error"
              : "text-text1"
          )}
        >
          Broadcasting...
        </div>
        <div
          className={classNames(
            "mt-[.08rem]",
            data.packStatus === "success"
              ? "text-active"
              : data.packStatus === "error"
              ? "text-error"
              : "text-text1"
          )}
        >
          Packing...
        </div>
        <div
          className={classNames(
            "mt-[.08rem]",
            data.finalizeStatus === "success"
              ? "text-active"
              : data.finalizeStatus === "error"
              ? "text-error"
              : "text-text1"
          )}
        >
          Finalizing...
        </div>
        {txHash && (
          <div className="mt-[.12rem] text-text1">
            Check Tx{" "}
            <Tooltip title={txHash}>
              <a
                className="underline"
                href={scanUrl || ""}
                target="_blank"
                rel="noreferrer"
              >
                {getShortAddress(txHash, 3)}
              </a>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
