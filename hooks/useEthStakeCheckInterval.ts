import { getStafiLightNodeAbi, getStafiSuperNodeAbi } from "config/abi";
import { getApiHost } from "config/env";
import { getStafiEthContractConfig } from "config/metaMask";
import { useCallback } from "react";
import { setEthStakeParams } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { createWeb3 } from "utils/web3Utils";
import { useAppDispatch, useAppSelector } from "./common";
import { useInterval } from "./useInterval";

export function useEthStakeCheckInterval() {
  const dispatch = useAppDispatch();

  const { ethStakeParams, ethStakeModalVisible } = useAppSelector(
    (state: RootState) => {
      return {
        ethStakeParams: state.eth.ethStakeParams,
        ethStakeModalVisible: state.eth.ethStakeModalVisible,
      };
    }
  );

  const fetchStatus = useCallback(async () => {
    if (
      !ethStakeParams ||
      ethStakeParams.status === "active" ||
      ethStakeParams.status === "error"
    ) {
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
        // console.log("statusstatus", status);
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
}
