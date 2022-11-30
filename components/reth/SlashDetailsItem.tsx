import { Popover } from "@mui/material";
import { Icomoon } from "components/icon/Icomoon";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { openLink } from "utils/common";

interface SlashDetailsItemProps {
  index: number;
}

export const SlashDetailsItem = (props: SlashDetailsItemProps) => {
  const { index } = props;

  const detailPopupState = usePopupState({
    variant: "popover",
    popupId: "detail",
  });

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
        <div className="text-[.24rem] text-text1">2022-08-11 23:32</div>
      </div>

      <div className="flex justify-center items-center">
        <div className="text-[.24rem] text-text1">12901082-15901082</div>
      </div>

      <div className="flex justify-center items-center">
        <div className="text-[.24rem] text-error">24.5</div>
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
          Didn&apos;t set configure fee recipient
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
            Didn&apos;t set configure fee recipient, you Didn&apos;t set
            configure fee recipient, Didn&apos;t set configure fee recipient,
            you Didn&apos;t set configure fee recipient. Didn&apos;t set
            configure fee recipient, you Didn&apos;t set configure fee
            recipient, Didn&apos;t set configure fee recipient, you Didn&apos;t
            set configure fee recipient
          </div>

          <div
            className="mt-[.3rem] text-active cursor-pointer"
            onClick={() => {
              openLink("https://www.google.com");
            }}
          >
            View on Etherscan
          </div>
        </div>
      </Popover>
    </div>
  );
};
