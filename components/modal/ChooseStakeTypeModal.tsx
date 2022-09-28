import { Box, Modal } from "@mui/material";
import { Button } from "components/button";
import { Icomoon } from "components/Icomoon";

interface ChooseStakeTypeModalProps {
  visible: boolean;
  trustDepositNumber: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ChooseStakeTypeModal = (props: ChooseStakeTypeModalProps) => {
  return (
    <Modal open={props.visible} onClose={props.onClose}>
      <Box
        pt=".3rem"
        pl=".4rem"
        pr=".4rem"
        pb=".5rem"
        display="flex"
        flexDirection="column"
        border={0}
        sx={{
          backgroundColor: "#0A131B",
          width: "8rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="self-end">
          <Icomoon icon="close" size="0.24rem" color="#5B6872" />
        </div>

        <div className="self-center text-white text-[.32rem] font-[700] text-center leading-normal">
          2 Deposits need to stake
          <br />
          seperately
        </div>

        <div className="mt-[.5rem]">
          <Button onClick={props.onConfirm} fontSize="0.24rem">
            Stake trust deposits({props.trustDepositNumber})
          </Button>
        </div>

        <div
          className="text-text1 cursor-pointer self-center mt-[.3rem]"
          onClick={props.onClose}
        >
          Exit
        </div>
      </Box>
    </Modal>
  );
};
