import { getApiHost } from "config/env";
import { RequestStatus } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import { useAppSlice } from "./selector";

export interface SlashEvent {
  startTimestamp: string;
  startBlock: string;
  endBlock: string;
  slashAmount: string;
  slashType: number;
  explorerUrl?: string;
}

export function useEthPubkeySlashDetail(pubkey: string, pageIndex: number) {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [totalCount, setTotalCount] = useState(undefined);
  const [slashEventList, setSlashEventList] = useState<SlashEvent[]>([]);

  const { updateFlag15s } = useAppSlice();

  const udpatePubkeySlashDetail = useCallback(async () => {
    try {
      if (!pubkey || !updateFlag15s) {
        return;
      }
      const params = {
        pubkey,
        pageIndex,
        pageCount: 5,
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
        setRequestStatus(RequestStatus.success);
        setTotalCount(resJson.data.totalCount);
        setSlashEventList(resJson.data.slashEventList || []);
      } else {
        throw new Error(resJson.message);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [pubkey, pageIndex, updateFlag15s]);

  useEffect(() => {
    udpatePubkeySlashDetail();
  }, [udpatePubkeySlashDetail]);

  return {
    requestStatus,
    totalCount,
    slashEventList,
  };
}
