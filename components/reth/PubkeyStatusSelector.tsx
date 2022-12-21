import { Popover } from "@mui/material";
import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { useEthPubkeyTotalCount } from "hooks/useEthPubkeyTotalCount";
import { EthPubkeyStatus } from "interfaces/common";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { useRouter } from "next/router";

interface PubkeyStatusSelectorProps {
  selectedStatusList: EthPubkeyStatus[];
  onChange: (statusList: EthPubkeyStatus[]) => void;
}

export const PubkeyStatusSelector = (props: PubkeyStatusSelectorProps) => {
  const { selectedStatusList, onChange } = props;
  const router = useRouter();
  const { activeCount, exitedCount, pendingCount, slashCount } =
    useEthPubkeyTotalCount();

  const list = [
    EthPubkeyStatus.active,
    EthPubkeyStatus.pending,
    EthPubkeyStatus.exited,
    EthPubkeyStatus.slashed,
  ];

  const selectionPopupState = usePopupState({
    variant: "popover",
    popupId: "selection",
  });

  const getStatusName = (status: EthPubkeyStatus) => {
    if (status === EthPubkeyStatus.active) {
      return "Active";
    }
    if (status === EthPubkeyStatus.pending) {
      return "Pending";
    }
    if (status === EthPubkeyStatus.exited) {
      return "Exited";
    }
    if (status === EthPubkeyStatus.slashed) {
      return "Slashed";
    }
    return "";
  };

  const getStatusTotalCount = (status: EthPubkeyStatus) => {
    if (status === EthPubkeyStatus.active) {
      return activeCount !== undefined ? `(${activeCount})` : "";
    }
    if (status === EthPubkeyStatus.pending) {
      return pendingCount !== undefined ? `(${pendingCount})` : "";
    }
    if (status === EthPubkeyStatus.exited) {
      return exitedCount !== undefined ? `(${exitedCount})` : "";
    }
    if (status === EthPubkeyStatus.slashed) {
      return slashCount !== undefined ? `(${slashCount})` : "";
    }
    return "";
  };

  const getDisplayText = () => {
    if (selectedStatusList.length === 0) {
      return "Filter by kind";
    } else if (selectedStatusList.length === list.length) {
      return "All";
    } else {
      let res = "";
      if (selectedStatusList.indexOf(EthPubkeyStatus.active) >= 0) {
        res += "Active...";
      } else if (selectedStatusList.indexOf(EthPubkeyStatus.pending) >= 0) {
        res += "Pending...";
      } else if (selectedStatusList.indexOf(EthPubkeyStatus.exited) >= 0) {
        res += "Exited...";
      } else if (selectedStatusList.indexOf(EthPubkeyStatus.slashed) >= 0) {
        res += "Slashed...";
      }
      return res;
    }
  };

  return (
    <>
      <div
        className="rounded-[.16rem] border-solid border-[1px] border-[#1A2835] bg-[#19263459] active:bg-[#192634]/80"
        style={{
          backdropFilter: "blue(.4rem)",
          ...(selectionPopupState.isOpen
            ? {
                background:
                  "linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)",
              }
            : {}),
        }}
      >
        <div
          className={classNames(
            "relative flex items-center justify-between rounded-[.16rem] max-w-[2.3rem] w-[2.3rem] h-[.68rem] cursor-pointer"
          )}
          {...bindTrigger(selectionPopupState)}
        >
          <div className="w-[.32rem] h-[.32rem] bg-primary rounded-full text-[#1A2835] text-[.24rem] flex items-center justify-center absolute right-[-0.16rem] top-[-0.16rem]">
            {selectedStatusList.length}
          </div>

          <div
            className="ml-[.2rem] text-white text-[.24rem] flex-1 text-center"
            style={{
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {getDisplayText()}
          </div>

          <div
            className={classNames(
              "ml-[.2rem] mr-[.25rem] flex items-center w-[.19rem]",
              selectionPopupState.isOpen ? "rotate-0" : "rotate-180"
            )}
          >
            <Icomoon icon="up" color="#ffffff" size=".19rem" />
          </div>
        </div>
      </div>

      {/* Notice */}
      <Popover
        {...bindPopover(selectionPopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{
          marginTop: ".16rem",
          "& .MuiPopover-paper": {
            background:
              "linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".16rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <div className="w-[3.9rem] px-[.3rem]">
          <div className="h-[.74rem] flex items-center justify-between text-primary text-[.24rem]">
            <div
              className="cursor-pointer"
              onClick={() => {
                onChange([]);
              }}
            >
              Clear
            </div>
            <div
              className="cursor-pointer"
              onClick={() => {
                onChange([...list]);
              }}
            >
              Toggle all
            </div>
          </div>

          {list.map((item, index) => (
            <div key={item}>
              <div className="h-[1px] bg-[#26494E]" />
              <div
                className="flex items-center justify-between h-[.74rem] cursor-pointer"
                onClick={() => {
                  const newStatusList = [...selectedStatusList];
                  if (selectedStatusList.indexOf(item) >= 0) {
                    newStatusList.splice(selectedStatusList.indexOf(item), 1);
                  } else {
                    newStatusList.push(item);
                  }
                  onChange(newStatusList);
                }}
              >
                <div className="text-text1 text-[.24rem]">
                  {getStatusName(item)} {getStatusTotalCount(item)}
                </div>

                {selectedStatusList.indexOf(item) >= 0 ? (
                  <Icomoon icon="checked" size=".24rem" color="#00F3AB" />
                ) : (
                  <div className="w-[.24rem] h-[.24rem] rounded-[.02rem] border-solid border-[1px] border-[#00F3AB]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Popover>
    </>
  );
};
