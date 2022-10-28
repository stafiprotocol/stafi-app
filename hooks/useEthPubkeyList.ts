import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { EthPubkey, EthPubkeyStatus, RequestStatus } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE } from "utils/constants";

export function useEthPubkeyList(status: EthPubkeyStatus, pageIndex: number) {
  const { useAccount } = hooks;
  const account = useAccount();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );

  const [pubkeyList, setPubkeyList] = useState<EthPubkey[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tabTotalCounts, setTabTotalCounts] = useState<string[]>([]);

  const updateMyData = useCallback(async () => {
    if (!account) {
      return;
    }
    try {
      const params = {
        // nodeAddress: "0x9EA0fe988BC7A57DEabD3EfaE79DEC6Af10E5210",
        nodeAddress: account,
        status,
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
  }, [account, status, pageIndex]);

  useEffect(() => {
    updateMyData();
  }, [updateMyData]);

  const updateTotalCounts = useCallback(async () => {
    const statusList = [
      EthPubkeyStatus.all,
      EthPubkeyStatus.active,
      EthPubkeyStatus.pending,
      EthPubkeyStatus.exited,
    ];

    const requests = statusList.map((status) => {
      return (async () => {
        try {
          const params = {
            nodeAddress: account,
            status,
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
            return resJson.data.totalCount + "";
          } else {
            return "0";
          }
        } catch {
          return '0'
        }

      })();
    });

    const totalCounts = await Promise.all(requests);
    setTabTotalCounts(totalCounts);
  }, [account]);

  useEffect(() => {
    updateTotalCounts();
  }, [updateTotalCounts]);

  return {
    requestStatus,
    pubkeyList,
    totalCount,
    tabTotalCounts,
  };
}
