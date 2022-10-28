import { getApiHost } from "config/env";
import { hooks } from "connectors/metaMask";
import { RequestStatus } from "interfaces/common";
import { useCallback, useState } from "react";
import { useEffect } from "react";
import Web3 from "web3";
import dayjs from "dayjs";
import { formatNumber } from "utils/number";

export function useEthMyReward(chartDuSeconds: number) {
  const { useAccount } = hooks;
  const account = useAccount();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [totalStakedEth, setTotalStakedEth] = useState("");
  const [totalStakedEthValue, setTotalStakedEthValue] = useState("");
  const [lastEraRewardEth, setLastEraRewardEth] = useState("");
  const [lastEraRewardEthValue, setLastEraRewardEthValue] = useState("");
  const [chartXData, setChartXData] = useState<string[]>([]);
  const [chartYData, setChartYData] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const updateMyReward = useCallback(async () => {
    if (!account) {
      setRequestStatus(RequestStatus.success);
      return;
    }
    setRequestStatus(RequestStatus.loading);
    try {
      const params = {
        // nodeAddress: "0x9EA0fe988BC7A57DEabD3EfaE79DEC6Af10E5210",
        nodeAddress: account,
        chartDuSeconds: chartDuSeconds,
        pageCount: 1,
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
        setChartXData(
          resJson.data.chartXData
            .map((item: number) =>
              dayjs.unix(item).format("YYYY.MM.DD HH:mm:ss")
            )
            .reverse()
        );
        setChartYData(
          resJson.data.chartYData
            .map((item: string) => formatNumber(Web3.utils.fromWei(item)))
            .reverse()
        );

        const totalStakedEth = Web3.utils.fromWei(resJson.data.totalStakedEth);
        const lastEraRewardEth = Web3.utils.fromWei(
          resJson.data.lastEraRewardEth
        );
        setTotalStakedEth(totalStakedEth);
        setTotalStakedEthValue(
          Number(totalStakedEth) * Number(resJson.data.ethPrice) + ""
        );
        setLastEraRewardEth(lastEraRewardEth);
        setLastEraRewardEthValue(
          Number(lastEraRewardEth) * Number(resJson.data.ethPrice) + ""
        );

        setTotalCount(resJson.data.totalCount);
      } else {
        throw Error("Network request error: " + resJson.status);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [account, chartDuSeconds]);

  useEffect(() => {
    updateMyReward();
  }, [updateMyReward]);

  return {
    requestStatus,
    chartXData,
    chartYData,
    totalStakedEth,
    totalStakedEthValue,
    lastEraRewardEth,
    lastEraRewardEthValue,
    totalCount,
  };
}
