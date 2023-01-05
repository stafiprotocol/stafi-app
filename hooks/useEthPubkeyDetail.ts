import { getApiHost } from "config/env";
import { RequestStatus } from "interfaces/common";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Web3 from "web3";
import dayjs from "dayjs";
import { formatNumber } from "utils/number";
import { useAppSlice } from "./selector";

export function useEthPubkeyDetail(pubkey: string, chartDuSeconds: number) {
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [status, setStatus] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [currentBalanceValue, setCurrentBalanceValue] = useState("");
  const [depositBalance, setDepositBalance] = useState("");
  const [depositBalanceValue, setDepositBalanceValue] = useState("");
  const [effectiveBalance, setEffectiveBalance] = useState("");
  const [effectiveBalanceValue, setEffectiveBalanceValue] = useState("");
  const [apr, setApr] = useState("");
  const [last24hRewardEth, setLast24hRewardEth] = useState("");
  const [last24hRewardEthValue, setLast24hRewardEthValue] = useState("");
  const [eligibleDays, setEligibleDays] = useState("");
  const [eligibleEpoch, setEligibleEpoch] = useState("");
  const [activeDays, setActiveDays] = useState("");
  const [activeEpoch, setActiveEpoch] = useState("");
  const [chartXData, setChartXData] = useState<string[]>([]);
  const [chartYData, setChartYData] = useState<string[]>([]);

  const { updateFlag15s } = useAppSlice();

  const udpatePubkeyDetail = useCallback(async () => {
    try {
      if (!pubkey || !updateFlag15s) {
        return;
      }
      const params = {
        pubkey,
        chartDuSeconds,
        pageIndex: 0,
        pageCount: 1,
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
        setStatus(resJson.data.status);
        const currentBalance = Web3.utils.fromWei(resJson.data.currentBalance);
        const depositBalance = Web3.utils.fromWei(resJson.data.depositBalance);
        const effectiveBalance = Web3.utils.fromWei(
          resJson.data.effectiveBalance
        );
        const last24hRewardEthValue = Web3.utils.fromWei(
          resJson.data.last24hRewardEthValue || "0"
        );

        setCurrentBalance(currentBalance);
        setCurrentBalanceValue(
          Number(currentBalance) * Number(resJson.data.ethPrice) + ""
        );
        setDepositBalance(depositBalance);
        setDepositBalanceValue(
          Number(depositBalance) * Number(resJson.data.ethPrice) + ""
        );
        setEffectiveBalance(effectiveBalance);
        setEffectiveBalanceValue(
          Number(effectiveBalance) * Number(resJson.data.ethPrice) + ""
        );

        setLast24hRewardEth(last24hRewardEthValue);
        setLast24hRewardEthValue(
          Number(last24hRewardEthValue) * Number(resJson.data.ethPrice) + ""
        );

        setApr(resJson.data.apr);
        setEligibleDays(resJson.data.eligibleDays);
        setEligibleEpoch(resJson.data.eligibleEpoch);
        setActiveDays(resJson.data.activeDays);
        setActiveEpoch(resJson.data.activeEpoch);

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
      } else {
        throw new Error(resJson.message);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    }
  }, [pubkey, chartDuSeconds, updateFlag15s]);

  useEffect(() => {
    udpatePubkeyDetail();
  }, [udpatePubkeyDetail]);

  return {
    requestStatus,
    status,
    currentBalance,
    currentBalanceValue,
    depositBalance,
    depositBalanceValue,
    effectiveBalance,
    effectiveBalanceValue,
    apr,
    last24hRewardEth,
    last24hRewardEthValue,
    eligibleDays,
    eligibleEpoch,
    activeDays,
    activeEpoch,
    chartXData,
    chartYData,
  };
}
