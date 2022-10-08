import { Box, Modal } from "@mui/material";
import classNames from "classnames";
import { Button } from "components/button";
import { Icomoon } from "components/Icomoon";
import { StakeLeftExplanation } from "components/reth/stake/StakeLeftExplanation";
import { getApiHost } from "config/env";
import {
  getStafiEthContractConfig,
  getStafiLightNodeAbi,
  getStafiSuperNodeAbi,
} from "config/eth";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useInterval } from "hooks/useInterval";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import bee from "public/bee.png";
import beeLight from "public/bee_light.png";
import ownServer from "public/own_server.svg";
import thirdPartyService from "public/3rd_party_service.svg";
import downIcon from "public/icon_down_gray.png";
import { useCallback, useState } from "react";
import { setEthStakeParams } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { getShortAddress } from "utils/string";
import { createWeb3 } from "utils/web3Utils";
import styles from "../../styles/reth/CheckFile.module.scss";
import { getEtherScanTxUrl } from "config/explorer";
import { openLink } from "utils/common";

interface EthRunNodesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EthRunNodesModal = (props: EthRunNodesModalProps) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);

  const { ethStakeParams } = useAppSelector((state: RootState) => {
    return {
      ethStakeParams: state.eth.ethStakeParams,
    };
  });

  useEffect(() => {
    if (
      (ethStakeParams?.status === "active" ||
        ethStakeParams?.status === "error") &&
      !props.visible
    ) {
      dispatch(setEthStakeParams(undefined));
    }
  }, [dispatch, props.visible, ethStakeParams?.status]);

  const fetchStatus = useCallback(async () => {
    if (
      ethStakeParams?.status === "active" ||
      ethStakeParams?.status === "error"
    ) {
      return;
    }

    if (!ethStakeParams) {
      return;
    }

    const web3 = createWeb3();
    const ethContractConfig = getStafiEthContractConfig();
    let contract = new web3.eth.Contract(
      ethStakeParams.type === "solo"
        ? getStafiLightNodeAbi()
        : getStafiSuperNodeAbi(),
      ethStakeParams.type === "solo"
        ? ethContractConfig.stafiLightNode
        : ethContractConfig.stafiSuperNode
    );

    const requests = ethStakeParams.pubkeys.map((pubkey) => {
      return (async () => {
        const method =
          ethStakeParams.type === "solo"
            ? contract.methods.getLightNodePubkeyStatus
            : contract.methods.getSuperNodePubkeyStatus;
        const status = await method(pubkey).call();
        console.log("statusstatus", status);
        if (Number(status) >= 3) {
          const params = {
            pubkey,
          };
          const response = await fetch(`${getApiHost()}/reth/v1/pubkeyDetail`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
          });
          const resJson = await response.json();
          if (resJson && resJson.status === "80000") {
            return resJson.data.status;
          } else {
            return "";
          }
        } else {
          return status;
        }
      })();
    });

    try {
      const statusList = await Promise.all(requests);
      // console.log("statusList", statusList);
      let changeStatus = true;
      let newStatus = "";
      statusList.every((status) => {
        console.log("status", status);

        if (status) {
          if (status === "4") {
            changeStatus = true;
            newStatus = "4";
            return false;
          }
          if (!newStatus) {
            newStatus = status;
          } else if (newStatus !== status) {
            changeStatus = false;
          }
        }
      });
      console.log("prev", newStatus);
      if (changeStatus) {
        dispatch(
          setEthStakeParams({
            ...ethStakeParams,
            status:
              Number(newStatus) === 4
                ? "error"
                : Number(newStatus) < 3
                ? "staking"
                : Number(newStatus) < 8
                ? "staked"
                : Number(newStatus) === 8
                ? "waiting"
                : Number(newStatus) === 9
                ? "active"
                : "exit",
          })
        );
      }
    } catch {}
  }, [dispatch, ethStakeParams]);

  useInterval(fetchStatus, 8000);

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
