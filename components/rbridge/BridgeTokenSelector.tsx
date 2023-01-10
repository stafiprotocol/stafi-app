import { Popover } from "@mui/material";
import classNames from "classnames";
import { BubblesLoading } from "components/common/BubblesLoading";
import { EmptyContent } from "components/common/EmptyContent";
import { Icomoon } from "components/icon/Icomoon";
import { useFisBalance } from "hooks/useFisBalance";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useWalletAccount } from "hooks/useWalletAccount";
import { RTokenName, TokenName, TokenStandard } from "interfaces/common";
import { isEmpty } from "lodash";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { isEmptyValue } from "utils/common";
import { getRBridgeTokenIcon } from "utils/icon";
import { formatNumber } from "utils/number";
import { rTokenNameToTokenName } from "utils/rToken";
import { BridgeRTokenBalance } from "./BridgeRTokenBalance";

interface BridgeTokenSelectorProps {
  selectionList: (TokenName.FIS | RTokenName)[];
  srcTokenStandard: TokenStandard | undefined;
  selectedTokenName: TokenName.FIS | RTokenName | undefined;
  onChange: (tokenStandard: TokenName.FIS | RTokenName) => void;
}

export const BridgeTokenSelector = (props: BridgeTokenSelectorProps) => {
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
            "flex items-center justify-between rounded-[.16rem] w-[2.1rem] h-[.68rem] px-[.24rem]",
            "cursor-pointer"
          )}
          {...bindTrigger(selectionPopupState)}
        >
          <div className="flex items-center flex-1">
            {props.selectedTokenName && (
              <div className="w-[.28rem] h-[.28rem] relative mr-[.16rem]">
                <Image
                  alt="logo"
                  layout="fill"
                  src={getRBridgeTokenIcon(props.selectedTokenName)}
                />
              </div>
            )}

            <div className="text-white text-[.24rem]">
              {props.selectedTokenName || (
                <div className="text-[.18rem]">Select Token</div>
              )}
            </div>
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
        <div className="w-[5.8rem] max-h-[6rem] overflow-auto">
          <div className="text-text1 text-[.2rem] mt-[.35rem] ml-[.24rem] mb-[.2rem]">
            Choose Token Type
          </div>

          {selectionList.length === 0 && (
            <div className="flex justify-center my-[.4rem]">
              <EmptyContent size="0.6rem" />
            </div>
          )}

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
                      src={getRBridgeTokenIcon(item)}
                    />
                  </div>
                  <div className="ml-[.12rem] text-text1 text-[.24rem]">
                    {item}
                  </div>
                </div>

                <div className="flex items-center">
                  <BridgeRTokenBalance
                    isFIS={item === TokenName.FIS}
                    srcTokenStandard={props.srcTokenStandard}
                    tokenName={rTokenNameToTokenName(
                      item === TokenName.FIS ? RTokenName.rFIS : item
                    )}
                  />

                  <div className="ml-[.24rem]">
                    {props.selectedTokenName === item ? (
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
