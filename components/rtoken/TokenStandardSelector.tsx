import { Popover } from "@mui/material";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import { TokenStandard } from "interfaces/common";
import Image from "next/image";
import { getTokenStandardIcon } from "utils/icon";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import { values } from "lodash";
import { useMemo } from "react";
import classNames from "classnames";

interface TokenStandardSelectorProps {
  selectedStandard: TokenStandard;
  onSelect: (v: TokenStandard) => void;
}

export const TokenStandardSelector = (props: TokenStandardSelectorProps) => {
  const selectionPopupState = usePopupState({
    variant: "popover",
    popupId: "selection",
  });

  const selectionList = useMemo(() => {
    return values(TokenStandard).filter(
      (item) => item !== props.selectedStandard
    );
  }, [props.selectedStandard]);

  return (
    <>
      <Card
        background="linear-gradient(0deg,rgba(0, 243, 171, 0.1) 0%,rgba(26, 40, 53, 0.16) 70%,rgba(26, 40, 53, 0.2) 100%)"
        borderColor="#26494E"
      >
        <div
          className="flex items-center justify-center rounded-[.16rem] w-[2.1rem] h-[.68rem] cursor-pointer"
          {...bindTrigger(selectionPopupState)}
        >
          <div className="text-white text-[.24rem]">
            {props.selectedStandard}
          </div>
          <div className="w-[.28rem] h-[.28rem] relative ml-[.16rem]">
            <Image
              alt="logo"
              layout="fill"
              src={getTokenStandardIcon(props.selectedStandard)}
            />
          </div>

          <div
            className={classNames(
              "ml-[.16rem] flex items-center",
              selectionPopupState.isOpen ? "rotate-0" : "rotate-180"
            )}
          >
            <Icomoon icon="up" color="#ffffff" size=".19rem" />
          </div>
        </div>
      </Card>

      {/* Notice */}
      <Popover
        {...bindPopover(selectionPopupState)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
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
        <div className="w-[2.1rem]">
          {selectionList.map((item, index) => (
            <div key={item}>
              <div
                className="flex items-center justify-center h-[.74rem] cursor-pointer"
                onClick={() => props.onSelect(item)}
              >
                <div className="text-white text-[.24rem]">{item}</div>
                <div className="w-[.28rem] h-[.28rem] relative ml-[.16rem]">
                  <Image
                    alt="logo"
                    layout="fill"
                    src={getTokenStandardIcon(item)}
                  />
                </div>
              </div>

              {index !== selectionList.length - 1 && (
                <div className="h-[1px] mx-[.24rem] bg-[#26494E] opacity-30" />
              )}
            </div>
          ))}
        </div>
      </Popover>
    </>
  );
};
