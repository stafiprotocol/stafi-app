import { getRTokenApi2Host } from "config/env";
import dayjs from "dayjs";
import { RequestStatus, RTokenName } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import { COMMON_ERROR_MESSAGE } from "utils/constants";
import numberUtil from "utils/numberUtil";
import { rTokenSymbolToRTokenName } from "utils/rToken";
import { useAppSlice } from "./selector";

export interface RPoolRewardFISChartItem {
  totalAmount: string;
  addedRToken: RTokenName;
  addedAmount: string;
}

export function useRPoolRewardChart(chartDuSeconds: number) {
  const { updateFlag15s, refreshDataFlag } = useAppSlice();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [rewardChartXData, setRewardChartXData] = useState<string[]>([]);
  const [rewardChartYData, setRewardChartYData] = useState<
    RPoolRewardFISChartItem[]
  >([]);

  const fetchData = useCallback(async () => {
    if (!updateFlag15s) return;
    setRequestStatus(RequestStatus.loading);

    try {
      const url = `${getRTokenApi2Host()}/stafi/webapi/rtoken/rPoolChart`;
      const params = {
        mintedValueWithinSeconds: chartDuSeconds,
        mintedValueCountLimit: 100,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const resJson = await response.json();

      if (!resJson || resJson.status !== "80000" || !resJson.data) {
        throw new Error(COMMON_ERROR_MESSAGE);
      }

      setRewardChartXData(
        resJson.data.rewardChartXData
          .map((item: number) => dayjs.unix(item).format("YYYY.MM.DD hh:mm:ss"))
          .reverse() || []
      );

      setRewardChartYData(
        resJson.data.rewardChartYData
          .map((item: any) => {
            return {
              totalAmount: numberUtil.fisAmountToHuman(item.totalAmount),
              addedRToken: rTokenSymbolToRTokenName(item.rTokenType),
              addedAmount: numberUtil.fisAmountToHuman(item.addedAmount),
            };
          })
          .reverse() || []
      );
    } catch (err: any) {
      setRequestStatus(RequestStatus.error);
    }
  }, [updateFlag15s, chartDuSeconds]);

  useEffect(() => {
    fetchData();
  }, [fetchData, updateFlag15s, refreshDataFlag]);

  return {
    rewardChartXData,
    rewardChartYData,
    requestStatus,
  };
}
