import { Tooltip } from "@mui/material";
import classNames from "classnames";
import { CircularLoading } from "components/common/CircularLoading";
import { Icomoon } from "components/icon/Icomoon";
import { TokenName } from "interfaces/common";
import { StakeLoadingProgressDetailItem } from "redux/reducers/AppSlice";
import { getShortAddress } from "utils/string";

interface StakeLoadingProgressItemProps {
  stepIndex: number;
  name: "Sending" | "Approving" | "Staking" | "Minting" | "Swapping";
  data: StakeLoadingProgressDetailItem | undefined;
  txHash?: string | undefined;
  scanUrl?: string | undefined;
  tokenName?: TokenName;
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
          className="rounded-full w-[.24rem] h-[.24rem] bg-[#1A2835] flex items-center justify-center text-[.1rem] font-bold"
          style={{
            border:
              data.totalStatus === "success"
                ? "0.5px solid #0095EB"
                : "0.5px solid #9DAFBE",
            color: data.totalStatus === "success" ? "#0095EB" : "#9DAFBE",
          }}
        >
          {props.stepIndex + 1}
        </div>
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
            <Icomoon icon="error" size=".27rem" color="#FF52C4" />
          </div>
        ) : data.totalStatus === "loading" ? (
          <div className="ml-[.26rem]">
            <CircularLoading color="info" size=".24rem" />
          </div>
        ) : (
          <></>
        )}
      </div>

      <div className={classNames("ml-[.32rem] mt-[.12rem]  text-[.16rem]")}>
        <div
          className={classNames(
            "flex items-center",
            {
              hidden: props.name === "Minting" || props.name === "Swapping",
            },
            data.broadcastStatus === "success"
              ? "text-active"
              : data.broadcastStatus === "error"
              ? "text-error"
              : data.broadcastStatus === "loading"
              ? "text-active"
              : "text-text1"
          )}
        >
          <div className="mr-[.1rem]">Broadcasting...</div>
          {/*
          {data.broadcastStatus === "success" && (
            <Icomoon icon="nike" size=".18rem" color="#0095EB" />
          )}
          */}
        </div>
        <div
          className={classNames(
            "mt-[.08rem] flex items-center",
            {
              hidden: props.name === "Minting" || props.name === "Swapping",
            },
            data.packStatus === "success"
              ? "text-active"
              : data.packStatus === "error"
              ? "text-error"
              : data.packStatus === "loading"
              ? "text-active"
              : "text-text1"
          )}
        >
          <div className="mr-[.1rem]">Packing...</div>
          {/*
          {data.packStatus === "success" && (
            <Icomoon icon="nike" size=".18rem" color="#0095EB" />
          )}
          */}
        </div>
        <div
          className={classNames(
            "mt-[.08rem] flex items-center",
            {
              hidden:
                props.tokenName === TokenName.MATIC ||
                props.name === "Minting" ||
                props.name === "Swapping",
            },
            data.finalizeStatus === "success"
              ? "text-active"
              : data.finalizeStatus === "error"
              ? "text-error"
              : data.finalizeStatus === "loading"
              ? "text-active"
              : "text-text1"
          )}
        >
          <div className="mr-[.1rem]">Finalizing...</div>
          {/*
          {data.finalizeStatus === "success" && (
            <Icomoon icon="nike" size=".18rem" color="#0095EB" />
          )}
          */}
        </div>
        {data.txHash && (
          <div className="mt-[.12rem] text-text1">
            Check Tx{" "}
            <Tooltip title={data.txHash}>
              <a
                className="underline"
                href={scanUrl || ""}
                target="_blank"
                rel="noreferrer"
              >
                {getShortAddress(data.txHash, 3)}
              </a>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
};
