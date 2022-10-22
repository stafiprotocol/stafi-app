import { getApiHost } from "config/env";
import {
  getStafiEthContractConfig,
  getStafiLightNodeAbi,
  getStafiSuperNodeAbi,
} from "config/eth";
import { hooks } from "connectors/metaMask";
import { useCallback, useEffect, useState } from "react";
import { RootState } from "redux/store";
import { createWeb3 } from "utils/web3Utils";
import { useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export interface EthDepositItem {
  type: "solo" | "trusted";
  index: number;
  pubkey: string;
  status: string;
}

export function useEthStakeList() {
  const { useAccount } = hooks;
  const account = useAccount();
  const [loading, setLoading] = useState(true);
  const [depositList, setDepositList] = useState<EthDepositItem[]>([]);

  const { updateFlag15s } = useAppSlice();

  const updateEthStakeList = useCallback(async () => {
    if (!updateFlag15s) {
      return;
    }
    if (!account) {
      setLoading(false);
      return;
    }
    const userAddress = account;
    // const userAddress = "0xb58690DAdaa52e24dF206B22179Ad26598d920C4";
    try {
      setLoading(true);
      const resList: EthDepositItem[] = [];
      const web3 = createWeb3();
      const ethContractConfig = getStafiEthContractConfig();

      // Query solo deposit.
      let lightNodeContract = new web3.eth.Contract(
        getStafiLightNodeAbi(),
        ethContractConfig.stafiLightNode,
        {
          from: userAddress,
        }
      );
      const soloCount = await lightNodeContract.methods
        .getLightNodePubkeyCount(userAddress)
        .call();
      // console.log("soloCount:", soloCount);

      const pubkeyRequestList: string[] = [];

      for (let index = 0; index < soloCount; index++) {
        const pubkey = await lightNodeContract.methods
          .getLightNodePubkeyAt(userAddress, index)
          .call();
        // console.log("pubkey:", pubkey);

        const status = await lightNodeContract.methods
          .getLightNodePubkeyStatus(pubkey)
          .call();
        // console.log("pubkey status:", status);

        if (Number(status) >= 3) {
          pubkeyRequestList.push(pubkey);
        }

        resList.push({
          type: "solo",
          index,
          pubkey,
          status,
        });
      }

      // Query trust deposit.
      let superNodeContract = new web3.eth.Contract(
        getStafiSuperNodeAbi(),
        ethContractConfig.stafiSuperNode,
        {
          from: userAddress,
        }
      );
      const trustCount = await superNodeContract.methods
        .getSuperNodePubkeyCount(userAddress)
        .call();
      // console.log("trustCount:", trustCount);

      for (let index = 0; index < trustCount; index++) {
        const pubkey = await superNodeContract.methods
          .getSuperNodePubkeyAt(userAddress, index)
          .call();
        // console.log("pubkey:", pubkey);

        const status = await superNodeContract.methods
          .getSuperNodePubkeyStatus(pubkey)
          .call();
        // console.log("pubkey status:", status);

        if (Number(status) >= 3) {
          pubkeyRequestList.push(pubkey);
        }

        resList.push({
          type: "trusted",
          index,
          pubkey,
          status,
        });
      }

      if (pubkeyRequestList.length > 0) {
        const response = await fetch(
          `${getApiHost()}/reth/v1/pubkeyStatusList`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pubkeyList: pubkeyRequestList }),
          }
        );
        const resJson = await response.json();
        if (resJson && resJson.status === "80000") {
          resJson.data?.statusList?.forEach((status: number, index: number) => {
            resList.forEach((item) => {
              if (item.pubkey === pubkeyRequestList[index]) {
                item.status = status + "";
              }
            });
          });
        }
      }

      setDepositList(resList);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }, [account, updateFlag15s]);

  useEffect(() => {
    updateEthStakeList();
  }, [updateEthStakeList]);

  return { depositList, loading };
}
