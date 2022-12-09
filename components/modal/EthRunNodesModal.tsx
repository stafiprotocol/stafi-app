import { Box, Dialog, DialogContent, Modal } from "@mui/material";
import { Button } from "components/common/button";
import { Icomoon } from "components/icon/Icomoon";
import { RunNodesLeftExplanation } from "components/reth/RunNodesLeftExplanation";
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
    <Dialog
      open={props.visible}
      onClose={props.onClose}
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
        <div className="flex h-[9.65rem] items-stretch bg-[#0A131B]">
          <RunNodesLeftExplanation />

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
                    onClick={() =>
                      openLink(
                        "https://docs.stafi.io/rtoken-app/reth-solution/original-validator-guide#3.join-eth2-mainnet-by-running-prysm"
                      )
                    }
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
                    onClick={() => openLink("https://ssv.network/")}
                  >
                    Instruction
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
