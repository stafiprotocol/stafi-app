import { getRTokenApi2Host } from "config/env";
import dayjs from "dayjs";
import { RequestStatus } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import { COMMON_ERROR_MESSAGE, PAGE_SIZE } from "utils/constants";
import { useAppSlice } from "./selector";

export function useRPoolChart(chartDuSeconds: number) {
  const { updateFlag15s, refreshDataFlag } = useAppSlice();

  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [mintedValueChartXData, setMintedValueChartXData] = useState<string[]>(
    []
  );
  const [mintedValueChartYData, setMintedValueChartYData] = useState<string[]>(
    []
  );

  const fetchData = useCallback(async () => {
    if (!updateFlag15s) return;
    setRequestStatus(RequestStatus.loading);

    try {
      const url = `${getRTokenApi2Host()}/stafi/webapi/rtoken/rPoolChart`;
      const params = {
        mintedValueWithinSeconds: chartDuSeconds,
        mintedValueCountLimit: PAGE_SIZE,
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

      setMintedValueChartXData(
        resJson.data.mintedValueChartXData
          .map((item: number) => dayjs.unix(item).format("YYYY.MM.DD HH:mm:ss"))
          .reverse() || []
      );

      setMintedValueChartYData(
        resJson.data.mintedValueChartYData
          .map((item: number) => item)
          .reverse() || []
      );
    } catch (err: any) {}
  }, [chartDuSeconds, updateFlag15s]);

  useEffect(() => {
    fetchData();
  }, [fetchData, updateFlag15s, refreshDataFlag]);

  return {
    requestStatus,
    mintedValueChartXData,
    mintedValueChartYData,
  };
}
