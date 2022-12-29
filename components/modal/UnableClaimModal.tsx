import { Dialog, DialogContent } from "@mui/material";
import { Card } from "components/common/card";
import { Icomoon } from "components/icon/Icomoon";
import checkFileError from "public/transaction_error.svg";
import Image from "next/image";
import { Button } from "components/common/button";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const UnableClaimModal = (props: Props) => {
  return (
    <Dialog
      open={props.visible}
      onClose={props.onClose}
      scroll="body"
      sx={{
        borderRadius: "0.16rem",
        background: "rgba(26, 40, 53, 0.9)",
        // backdropFilter: "blur(.14rem)",
        "& .MuiDialog-container": {
          padding: "0",
          "& .MuiPaper-root": {
            width: "100%",
            maxWidth: "6.06rem", // Set your width here
            backgroundColor: "transparent",
            padding: "0",
          },
          "& .MuiDialogContent-root": {
            padding: "0",
            width: "6.06rem",
          },
        },
      }}
    >
      <DialogContent>
        <Card background="rgba(26, 40, 53, 0.9)" className="max-h-full flex flex-col items-center">
          <div
            className="absolute right-[.16rem] top-[.16rem] cursor-pointer"
            onClick={props.onClose}
          >
            <Icomoon icon="close" size="0.24rem" color="#5B6872" />
          </div>

          <div className="mt-[.7rem] w-[1.2rem] h-[1.2rem] relative">
            <Image
              src={checkFileError}
              layout="fill"
              alt="error"
              style={{ color: "#FF52C4" }}
            />
          </div>

          <div className="text-[.32rem] mt-[.56rem] text-center text-white">
            Unable to Claim
          </div>
          <div className="text-[.2rem] text-text1 text-center mt-[.24rem]">
            Sorry, it seems that you don&apos;t have claimable rewards
          </div>

          <div className="my-[.56rem] mx-[.48rem]">
            <Button
              width="5.1rem"
              height=".75rem"
              fontSize=".2rem"
              radius=".16rem"
              onClick={props.onClose}
            >
              Ok, I get it
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default UnableClaimModal;
