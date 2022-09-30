import { useCallback, useEffect, useState } from "react";
import { hooks } from "connectors/metaMask";
import { createWeb3 } from "utils/web3Utils";
import {
  getStafiEthContractConfig,
  getStafiLightNodeAbi,
  getStafiSuperNodeAbi,
} from "config/eth";
import { useInterval } from "./useInterval";

export interface EthDepositItem {
  type: "solo" | "trust";
  index: number;
  pubkey: string;
  status: string;
}

export function useEthDepositList() {
  const { useAccount } = hooks;
  const account = useAccount();
  const [loading, setLoading] = useState(true);
  const [depositList, setDepositList] = useState<EthDepositItem[]>([]);

  const updateEthStakeList = useCallback(async () => {
    if (!account) {
      setLoading(false);
      return;
    }
    const userAddress = account;
    // const userAddress = "0xeB4fd0a7F270C8EFb52d6789B4F5930eD46CB375";
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
      console.log("soloCount:", soloCount);

      for (let index = 0; index < soloCount; index++) {
        const pubkey = await lightNodeContract.methods
          .getLightNodePubkeyAt(userAddress, index)
          .call();
        console.log("pubkey:", pubkey);

        const status = await lightNodeContract.methods
          .getLightNodePubkeyStatus(pubkey)
          .call();
        console.log("pubkey status:", status);

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
      console.log("trustCount:", trustCount);

      for (let index = 0; index < trustCount; index++) {
        const pubkey = await superNodeContract.methods
          .getSuperNodePubkeyAt(userAddress, index)
          .call();
        console.log("pubkey:", pubkey);

        const status = await superNodeContract.methods
          .getSuperNodePubkeyStatus(pubkey)
          .call();
        console.log("pubkey status:", status);

        resList.push({
          type: "trust",
          index,
          pubkey,
          status,
        });
      }

      setDepositList(resList);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }, [account]);

  useEffect(() => {
    updateEthStakeList();
  }, [updateEthStakeList]);

  useInterval(() => {
    updateEthStakeList();
  }, 15000);

  return { depositList, loading };
}
