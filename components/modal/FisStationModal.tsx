import { Dialog, DialogContent } from "@mui/material";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { useAppDispatch, useAppSelector } from "hooks/common";
import Image from "next/image";
import { useContext, useEffect, useMemo } from "react";
import { setFisStationModalVisible } from "redux/reducers/AppSlice";
import { RootState } from "redux/store";
import SettingsLogo from "public/settings.svg";
import { Button } from "components/common/button";
import { useFisStationPoolInfo } from "hooks/useFisStationPoolInfo";

const FisStationModal = () => {
  const dispatch = useAppDispatch();

  const { fisStationModalVisible } = useAppSelector((state: RootState) => {
    return {
      fisStationModalVisible: state.app.fisStationModalVisible,
    };
  });

	const {swapLimit} = useFisStationPoolInfo();

  const onClose = () => {
    dispatch(setFisStationModalVisible(false));
  };

  const [buttonDisabled, buttonText] = useMemo(() => {
    return [false, "Swap"];
  }, []);

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
            <div
              className="absolute right-[.56rem] top-[.56rem] cursor-pointer"
              onClick={onClose}
            >
              <Icomoon icon="close" size="0.24rem" color="#5B6872" />
            </div>
            <div className="text-center mt-[0rem] text-white font-[700] text-[.42rem]">
              FIS Station
            </div>
            <div>
              <Image src={SettingsLogo} alt="settings" />
            </div>

            <div>
              <div></div>
              <div></div>
              <div></div>
            </div>

            <div>
              <Button radius=".32rem">{buttonText}</Button>
            </div>

            <div className="mx-[.28rem] flex flex-col items-center">
              <div className="text-text2 text-[.24rem]">Transaction Cost</div>
              <div className="mt-[.15rem] text-text1 text-[.24rem]"></div>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default FisStationModal;
