import { Box, Modal } from "@mui/material";
import { Button } from "components/common/button";
import { Icomoon } from "components/icon/Icomoon";

interface WarningModalProps {
  visible: boolean;
  content: string;
  onClose: () => void;
}

export const WarningModal = (props: WarningModalProps) => {
  return (
    <Modal open={props.visible} onClose={props.onClose}>
      <Box
        pt="0"
        pl="0"
        pr="0"
        pb="0"
        sx={{
          border: "1px solid #1A2835",
          backgroundColor: "#0A131B",
          width: "6rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex flex-col items-stretch">
          <div
            className="self-end mr-[.16rem] mt-[.16rem] cursor-pointer"
            onClick={props.onClose}
          >
            <Icomoon icon="close" size=".22rem" />
          </div>

          <div className="px-[.56rem] mt-[.56rem] text-[.32rem] text-white text-center leading-normal">
            {props.content}
          </div>

          <div className="mt-[.56rem] mb-[1rem] px-[.56rem]">
            <Button height="1.1rem" fontSize=".32rem" onClick={props.onClose}>
              Ok, I understand
            </Button>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
