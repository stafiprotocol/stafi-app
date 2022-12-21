import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { useCallback, useEffect, useState } from "react";

export function useEthPubkeyTotalCount() {
  const { useAccount } = hooks;
  const account = useAccount();

  const [activeCount, setActiveCount] = useState<number | undefined>();
  const [exitedCount, setExitedCount] = useState<number | undefined>();
  const [pendingCount, setPendingCount] = useState<number | undefined>();
  const [slashCount, setSlashCount] = useState<number | undefined>();

  const updateTotalCounts = useCallback(async () => {
    if (!account) {
      return;
    }
    try {
      const params = {
        nodeAddress: account,
        status: 0,
        pageIndex: 1,
        pageCount: 1,
      };
      const response = await fetch(`${getApiHost()}/reth/v1/nodeInfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        setActiveCount(resJson.data.activeCount);
        setExitedCount(resJson.data.exitedCount);
        setPendingCount(resJson.data.pendingCount);
        setSlashCount(resJson.data.slashCount);
      } else {
        return "0";
      }
    } catch {
      return "0";
    }
  }, [account]);

  useEffect(() => {
    updateTotalCounts();
  }, [updateTotalCounts]);

  return {
    activeCount,
    exitedCount,
    pendingCount,
    slashCount,
  };
}
