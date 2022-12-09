import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { EthPubkey, EthPubkeyStatus, RequestStatus } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE } from "utils/constants";

export function useEthPubkeyList(
  statusList: EthPubkeyStatus[],
  pageIndex: number
) {
  const { useAccount } = hooks;
  const account = useAccount();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );

  const [pubkeyList, setPubkeyList] = useState<EthPubkey[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const updateMyData = useCallback(async () => {
    if (!account) {
      return;
    }
    try {
      const params = {
        // nodeAddress: "0x9EA0fe988BC7A57DEabD3EfaE79DEC6Af10E5210",
        nodeAddress: account,
        statusList,
        pageIndex,
        pageCount: PAGE_SIZE,
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
        setRequestStatus(RequestStatus.success);
        setPubkeyList(resJson.data.pubkeyList);
        setTotalCount(resJson.data.totalCount);
      } else {
        throw Error(resJson.message);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [account, statusList, pageIndex]);

  useEffect(() => {
    updateMyData();
  }, [updateMyData]);

  return {
    requestStatus,
    pubkeyList,
    totalCount,
  };
}
