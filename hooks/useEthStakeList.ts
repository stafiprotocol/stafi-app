import { useCallback, useEffect, useState } from "react";
import { hooks } from "connectors/metaMask";
import { createWeb3 } from "utils/web3Utils";
import {
  getStafiEthContractConfig,
  getStafiLightNodeAbi,
  getStafiSuperNodeAbi,
} from "config/eth";

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
    try {
      const resList: EthDepositItem[] = [];
      const web3 = createWeb3();
      const ethContractConfig = getStafiEthContractConfig();

      // Query solo deposit.
      let lightNodeContract = new web3.eth.Contract(
        getStafiLightNodeAbi(),
        ethContractConfig.stafiLightNode,
        {
          from: account,
        }
      );
      const soloCount = await lightNodeContract.methods
        .getLightNodePubkeyCount(account)
        .call();
      console.log("soloCount:", soloCount);

      for (let index = 0; index < soloCount; index++) {
        const pubkey = await lightNodeContract.methods
          .getLightNodePubkeyAt(account, index)
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
          from: account,
        }
      );
      const trustCount = await superNodeContract.methods
        .getSuperNodePubkeyCount(account)
        .call();
      console.log("trustCount:", trustCount);

      for (let index = 0; index < trustCount; index++) {
        const pubkey = await superNodeContract.methods
          .getSuperNodePubkeyAt(account, index)
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

  return { depositList, loading };
}
