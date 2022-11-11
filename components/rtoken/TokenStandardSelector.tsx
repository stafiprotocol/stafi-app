import { Popover } from "@mui/material";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import { TokenName, TokenStandard } from "interfaces/common";
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
import { getSupportedTokenStandards } from "utils/rToken";
import { useRouter } from "next/router";

interface TokenStandardSelectorProps {
  tokenName: TokenName;
  selectedStandard: TokenStandard | undefined;
}

export const TokenStandardSelector = (props: TokenStandardSelectorProps) => {
  const router = useRouter();
  const selectionPopupState = usePopupState({
    variant: "popover",
    popupId: "selection",
  });

  const selectionList = useMemo(() => {
    return getSupportedTokenStandards(props.tokenName).filter(
      (item) => item !== props.selectedStandard
    );
  }, [props.selectedStandard, props.tokenName]);

  return (
    <>
      <div
        className="rounded-[.16rem] border-solid border-[1px] border-[#1A2835] bg-[#192634]/35 active:bg-[#192634]/80"
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
            "flex items-center justify-center rounded-[.16rem] w-[2.1rem] h-[.68rem]",
            selectionList.length > 0 ? "cursor-pointer" : "cursor-default"
          )}
          {...(selectionList.length > 0
            ? bindTrigger(selectionPopupState)
            : {})}
        >
          <div className="text-white text-[.24rem]">
            {props.selectedStandard || ""}
          </div>
          <div className="w-[.28rem] h-[.28rem] relative ml-[.16rem]">
            {props.selectedStandard && (
              <Image
                alt="logo"
                layout="fill"
                src={getTokenStandardIcon(props.selectedStandard)}
              />
            )}
          </div>

          <div
            className={classNames(
              "ml-[.16rem] flex items-center",
              selectionPopupState.isOpen ? "rotate-0" : "rotate-180",
              { hidden: selectionList.length === 0 }
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
                onClick={() => {
                  selectionPopupState.close();

                  router.replace({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      tokenStandard: item,
                    },
                  });
                }}
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
