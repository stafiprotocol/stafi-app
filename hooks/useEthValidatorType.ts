import { getStafiNodeManagerAbi } from "config/erc20Abi";
import { getErc20ContractConfig } from "config/erc20Contract";

import { hooks } from "connectors/metaMask";
import { useState } from "react";
import { useEffect, useCallback } from "react";
import { createWeb3 } from "utils/web3Utils";

export function useEthValidatorType() {
  const { useAccount } = hooks;
  const account = useAccount();
  const [isTrust, setIsTrust] = useState(false);

  const updateStatus = useCallback(async () => {
    if (!account) {
      setIsTrust(false);
      return;
    }
    try {
      const web3 = createWeb3();
      const ethContractConfig = getErc20ContractConfig();

      let nodeManagerContract = new web3.eth.Contract(
        getStafiNodeManagerAbi(),
        ethContractConfig.stafiNodeManager
      );
      const exist = await nodeManagerContract.methods
        .getSuperNodeExists(account)
        .call();
      setIsTrust(exist);
    } catch {}
  }, [account]);

  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  return { isTrust };
}
