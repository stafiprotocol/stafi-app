import { getStafiEthContractConfig, getStafiNodeManagerAbi } from "config/eth";
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
    const web3 = createWeb3();
    const ethContractConfig = getStafiEthContractConfig();

    let nodeManagerContract = new web3.eth.Contract(
      getStafiNodeManagerAbi(),
      ethContractConfig.stafiNodeManager
    );
    const exist = await nodeManagerContract.methods
      .getSuperNodeExists(account)
      .call();
    setIsTrust(exist);
  }, [account]);

  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  return { isTrust };
}