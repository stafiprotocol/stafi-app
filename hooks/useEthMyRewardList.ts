import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { RequestStatus } from "interfaces";
import { useCallback, useEffect, useState } from "react";
import { PAGE_SIZE } from "utils/constants";

export interface EthRewardInfo {
  commission: number;
  timestamp: number;
  selfStakedEth: string;
  totalStakedEth: string;
  selfEraRewardEth: string;
  totalEraRewardEth: string;
}

export function useEthMyRewardList(page: number) {
  const { useAccount } = hooks;
  const account = useAccount();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [rewardList, setRewardList] = useState<EthRewardInfo[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const updateMyReward = useCallback(async () => {
    if (!account) {
      setRequestStatus(RequestStatus.success);
      return;
    }
    setRequestStatus(RequestStatus.loading);
    try {
      const params = {
        nodeAddress: account,
        // nodeAddress: "0x9EA0fe988BC7A57DEabD3EfaE79DEC6Af10E5210",
        pageIndex: page,
        pageCount: PAGE_SIZE,
      };
      const response = await fetch(`${getApiHost()}/reth/v1/rewardInfo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        setRequestStatus(RequestStatus.success);

        setRewardList(resJson.data.rewardList);
        setTotalCount(resJson.data.totalCount);
      } else {
        throw Error("Network request error: " + resJson.status);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [account, page]);

  useEffect(() => {
    updateMyReward();
  }, [updateMyReward]);

  return {
    requestStatus,
    rewardList,
    totalCount,
  };
}
