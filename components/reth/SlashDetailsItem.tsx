import { Popover } from "@mui/material";
import { Icomoon } from "components/icon/Icomoon";
import { SlashEvent } from "hooks/useEthPubkeySlashDetail";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { openLink } from "utils/common";
import { formatNumber } from "utils/number";
import { formatDate } from "utils/time";
import Web3 from "web3";

interface SlashDetailsItemProps {
  index: number;
  slashEvent: SlashEvent;
}

export const SlashDetailsItem = (props: SlashDetailsItemProps) => {
  const { index, slashEvent } = props;

  const detailPopupState = usePopupState({
    variant: "popover",
    popupId: "detail",
  });

  const slashReasonTitle = (slashType: number | string) => {
    if (Number(slashType) === 1) {
      return "Fee recipient not match";
    }
    if (Number(slashType) === 2) {
      return "Proposer slash";
    }
    if (Number(slashType) === 3) {
      return "Attester slash";
    }
    if (Number(slashType) === 4) {
      return "Sync miss";
    }
    if (Number(slashType) === 5) {
      return "Attester miss";
    }
    if (Number(slashType) === 6) {
      return "Prposer miss";
    }
  };

  const slashReasonDetail = (slashType: number | string) => {
    if (Number(slashType) === 1) {
      return "StaFi will block-listed the the validators who don't configure the Priority Fee recipient address with the designated address and deduct their deposited ETH as a penalty to compensate liquid stakers";
    }
    if (Number(slashType) === 2) {
      return "Propose and sign two different blocks for the same slot";
    }
    if (Number(slashType) === 3) {
      return 'Attest to a block that "surrounds" another one (effectively changing history) or "double voting" by attesting to two candidates for the same block';
    }
    if (Number(slashType) === 4) {
      return "Sync miss";
    }
    if (Number(slashType) === 5) {
      return "The penalties for missing the target and source votes are equal to the rewards the attestor would have received had they submitted them. This means that instead of having the reward added to their balance, they have an equal value removed from their balance";
    }
    if (Number(slashType) === 6) {
      return "Prposer miss";
    }
  };

  return (
    <div
      className="grid h-[1.1rem]"
      style={{
        background: detailPopupState.isOpen
          ? "rgba(0, 243, 171, 0.1)"
          : index % 2 === 0
          ? "rgba(26, 40, 53, 0.3)"
          : "",
        gridTemplateColumns: "20% 20% 20% 40%",
      }}
    >
      <div className="flex justify-center items-center">
        <div className="text-[.24rem] text-text1">
          {formatDate(Number(slashEvent.startTimestamp) * 1000)}
        </div>
      </div>

      <div className="flex justify-center items-center">
        <div className="text-[.24rem] text-text1">
          {slashEvent.startBlock}-{slashEvent.endBlock}
        </div>
      </div>

      <div className="flex justify-center items-center">
        <div className="text-[.24rem] text-error">
          {formatNumber(Web3.utils.fromWei(slashEvent.slashAmount, "ether"))}
        </div>
      </div>

      <div
        className="pl-[.2rem] pr-[.5rem] flex justify-between items-center cursor-pointer"
        {...bindTrigger(detailPopupState)}
      >
        <div
          className="text-[.24rem] text-text1 flex-1"
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {slashReasonTitle(slashEvent.slashType)}
        </div>
        <div className="ml-[.14rem] min-w-[.08rem] w-[.08rem] flex items-center">
          <Icomoon icon="right" color="#9DAFBE" size=".15rem" />
        </div>
      </div>

      <Popover
        {...bindPopover(detailPopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        sx={{
          marginTop: "-0.2rem",
          "& .MuiPopover-paper": {
            background: "rgba(9, 15, 23, 0.25)",
            border: "1px solid rgba(38, 73, 78, 0.5)",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".32rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <div className="w-[5.4rem] p-[.32rem] flex items-center flex-col">
          <div className="self-stretch text-[.24rem] text-text1 leading-normal">
            {slashReasonDetail(slashEvent.slashType)}
          </div>

          {slashEvent.explorerUrl && (
            <div
              className="mt-[.3rem] text-active cursor-pointer"
              onClick={() => {
                openLink(slashEvent.explorerUrl);
              }}
            >
              {Number(slashEvent.slashType) === 1
                ? "View on StaFi Doc"
                : "View on Beaconcha"}
            </div>
          )}
        </div>
      </Popover>
    </div>
  );
};
