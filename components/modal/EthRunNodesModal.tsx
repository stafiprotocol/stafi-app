import { Box, Modal } from "@mui/material";
import { Button } from "components/button";
import { Icomoon } from "components/Icomoon";
import { StakeLeftExplanation } from "components/reth/stake/StakeLeftExplanation";
import Image from "next/image";
import thirdPartyService from "public/3rd_party_service.svg";
import ownServer from "public/own_server.svg";
import { openLink } from "utils/common";

interface EthRunNodesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EthRunNodesModal = (props: EthRunNodesModalProps) => {
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
          width: "14.88rem",
          borderRadius: "0.16rem",
          outline: "none",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex h-[9.65rem] items-stretch">
          <StakeLeftExplanation />

          <div className="flex-1 flex flex-col">
            <div
              className="self-end mr-[.56rem] mt-[.56rem] cursor-pointer"
              onClick={props.onClose}
            >
              <Icomoon icon="close" size=".22rem" />
            </div>

            <div className="ml-[1.12rem] mt-[.58rem] text-[.48rem] font-[700] text-white">
              Run Nodes
            </div>

            <div className="ml-[1.12rem] mt-[.23rem] text-[.28rem] text-text2">
              Run the node in order to join consensus
            </div>

            <div className="mt-[.8rem] self-stretch flex justify-center">
              <div
                className="w-[3.9rem] h-[4.9rem] rounded-[.16rem] flex flex-col items-center"
                style={{
                  background: "rgba(26, 40, 53, 0.2)",
                  border: "1px solid #1A2835",
                  backdropFilter: "blur(.67rem)",
                }}
              >
                <div className="mt-[1.24rem] w-[2.2rem] h-[.27rem] relative">
                  <Image src={ownServer} alt="ownServer" layout="fill" />
                </div>

                <div className="mt-[.6rem] text-[.24rem] text-text2">
                  AWS, Google Cloud…
                </div>

                <div className="mt-[.57rem] mx-[.35rem] self-stretch">
                  <Button
                    height="0.64rem"
                    fontSize="0.24rem"
                    onClick={() => openLink("https://www.google.com")}
                  >
                    Instruction
                  </Button>
                </div>
              </div>

              <div
                className="ml-[.56rem] w-[3.9rem] h-[4.9rem] rounded-[.16rem] flex flex-col items-center"
                style={{
                  background: "rgba(26, 40, 53, 0.2)",
                  border: "1px solid #1A2835",
                  backdropFilter: "blur(.67rem)",
                }}
              >
                <div className="mt-[1.24rem] w-[3.2rem] h-[.27rem] relative">
                  <Image
                    src={thirdPartyService}
                    alt="thirdPartyService"
                    layout="fill"
                  />
                </div>

                <div className="mt-[.6rem] text-[.24rem] text-text2">
                  SSV Network
                </div>

                <div className="mt-[.57rem] mx-[.35rem] self-stretch">
                  <Button
                    height="0.64rem"
                    fontSize="0.24rem"
                    onClick={() => openLink("https://www.google.com")}
                  >
                    Instruction
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
};
