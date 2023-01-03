import { Dialog, DialogContent, Popover } from "@mui/material";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import { useContext, useEffect, useMemo, useState } from "react";
import { setFisStationModalVisible } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import SettingsActiveLogo from "public/settings.svg";
import SettingsLogo from "public/settings_default.svg";
import FisStationBgImg from "public/fisStationBg.png";
import { Button } from "components/common/button";
import { useFisStationPoolInfo } from "hooks/useFisStationPoolInfo";
import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from "material-ui-popup-state/hooks";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomInput } from "components/common/CustomInput";
import { CustomNumberInput } from "components/common/CustomNumberInput";

const FisStationModal = () => {
  const dispatch = useAppDispatch();

  const { fisStationModalVisible } = useAppSelector((state: RootState) => {
    return {
      fisStationModalVisible: state.app.fisStationModalVisible,
    };
  });

  const { swapLimit } = useFisStationPoolInfo();

  const [slippage, setSlippage] = useState<number>(0.5);

  const onClose = () => {
    dispatch(setFisStationModalVisible(false));
  };

  const [buttonDisabled, buttonText] = useMemo(() => {
    return [false, "Swap"];
  }, []);

	const onClickSlippageAuto = () => {
		setSlippage(1);
	}

  const settingsPopUpState = usePopupState({
    variant: "popover",
    popupId: "settings",
  });

  return (
    <Dialog
      open={fisStationModalVisible}
      onClose={onClose}
      scroll="body"
      sx={{
        borderRadius: "0.16rem",
        "& .MuiDialog-container": {
          padding: "0",
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "16.88rem", // Set your width here
            backgroundColor: "transparent",
            padding: "0",
          },
          "& .MuiDialogContent-root": {
            padding: "0",
            width: "16.88rem",
          },
        },
      }}
    >
      <DialogContent>
        <Card background="#0A131B" className="max-h-full">
          <div className="flex flex-col items-stretch px-[.56rem] pb-[1rem] relative">
            <div className="absolute top-0 left-0 w-full h-[3.4rem]">
              <Image src={FisStationBgImg} alt="fisStationBg" layout="fill" />
            </div>
            <div
              className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
              onClick={onClose}
            >
              <Icomoon icon="close" size="0.24rem" color="#5B6872" />
            </div>
            <div className="text-center mt-[1.06rem] text-white font-[700] text-[.42rem] z-10">
              FIS Station
            </div>
            <div
              className="w-[.28rem] h-[.28rem] absolute top-[2.63rem] right-[.78rem]"
              {...bindTrigger(settingsPopUpState)}
            >
              <Image src={SettingsLogo} alt="settings" layout="fill" />
            </div>

            <Popover
              {...bindPopover(settingsPopUpState)}
              transformOrigin={{
                horizontal: "center",
                vertical: "top",
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              sx={{
                marginTop: ".1rem",
                "& .MuiPopover-paper": {
                  background: "rgba(9, 15, 23, 0.25)",
                  border: "1px solid #26494E",
                  backdropFilter: "blur(.4rem)",
                  borderRadius: ".16rem",
                  padding: ".2rem",
                },
                "& .MuiTypography-root": {
                  padding: "0px",
                },
              }}
            >
              <div className="mt-[.32rem] text-center text-[.2rem] text-text1">
                Settings
              </div>
              <div className="mt-[.21rem] text-text1">
                <MyTooltip text="Slippage" title="" color="#9DAFBE" />
              </div>
              <div className="flex mt-[.22rem] items-center">
                <div className="w-[1.35rem] h-[.57rem] bg-[#1A2835] px-[.4rem] py-[.15rem] rounded-[.17rem] text-white cursor-pointer"
								onClick={onClickSlippageAuto}
								>
                  Auto
                </div>
                <div
                  className="w-[3.47rem] h-[.68rem] ml-[.32rem] rounded-[.16rem] flex text-text2 items-center px-[.24rem]"
                  style={{
                    background: "rgba(25, 38, 52, 0.35)",
                  }}
                >
                  <CustomNumberInput
                    placeholder="Slippage"
                    value={slippage + ""}
                    handleValueChange={(value) => setSlippage(Number(value))}
										fontSize=".24rem"
                  />
								<div className="text-white text-[.24rem]">%</div>
                </div>
              </div>
            </Popover>

            <div className="mt-[3.22rem]">
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div>
              <Button radius=".32rem">{buttonText}</Button>
            </div>

            <div className="mt-[.8rem] flex items-center justify-around">
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">You Will Receive</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">11</div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Exchange Rate</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">11</div>
              </div>
              <div className="mx-[.28rem] flex flex-col items-center">
                <div className="text-text2 text-[.24rem]">Transaction Cost</div>
                <div className="mt-[.15rem] text-text1 text-[.24rem]">11</div>
              </div>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default FisStationModal;
