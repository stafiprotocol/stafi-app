import { Popover } from "@mui/material";
import classNames from "classnames";
import { Icomoon } from "components/icon/Icomoon";
import { TokenStandard } from "interfaces/common";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { getTokenStandardIcon } from "utils/icon";

interface BridgeTokenStandardSelectorProps {
  isFrom: boolean;
  selectionList: TokenStandard[];
  selectedStandard: TokenStandard | undefined;
  onChange: (tokenStandard: TokenStandard) => void;
}

export const BridgeTokenStandardSelector = (
  props: BridgeTokenStandardSelectorProps
) => {
  const { selectionList } = props;
  const router = useRouter();
  const selectionPopupState = usePopupState({
    variant: "popover",
    popupId: "selection",
  });

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
        <div className="w-[5.8rem]">
          <div className="text-text1 text-[.2rem] mt-[.35rem] ml-[.24rem] mb-[.2rem]">
            {props.isFrom ? "Send From" : "Send To"}
          </div>
          {selectionList.map((item, index) => (
            <div key={item}>
              <div
                className="flex items-center justify-between h-[.8rem] cursor-pointer mx-[.24rem]"
                onClick={() => {
                  selectionPopupState.close();
                  props.onChange(item);

                  // router.replace({
                  //   pathname: router.pathname,
                  //   query: {
                  //     ...router.query,
                  //     tokenStandard: item,
                  //   },
                  // });
                }}
              >
                <div className="flex items-center ">
                  <div className="w-[.36rem] h-[.36rem] relative">
                    <Image
                      alt="logo"
                      layout="fill"
                      src={getTokenStandardIcon(item)}
                    />
                  </div>
                  <div className="ml-[.12rem] text-text1 text-[.24rem]">
                    {item === TokenStandard.Native
                      ? "StaFi Chain"
                      : item === TokenStandard.BEP20
                      ? "BSC"
                      : "Ethereum"}
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="text-text1 text-[.24rem]">
                    {item === TokenStandard.Native
                      ? "Native"
                      : item === TokenStandard.BEP20
                      ? "BEP20"
                      : "ERC20"}
                  </div>

                  <div className="ml-[.24rem]">
                    {props.selectedStandard === item ? (
                      <Icomoon icon="active" size=".24rem" color="#00F3AB" />
                    ) : (
                      <div className="w-[.24rem] h-[.24rem] rounded-full border-solid border-[1px] border-text1" />
                    )}
                  </div>
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
