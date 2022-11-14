import { getRTokenApi2Host } from "config/env";
import dayjs from "dayjs";
import {
  ChainId,
  RequestStatus,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { COMMON_ERROR_MESSAGE, PAGE_SIZE } from "utils/constants";
import {
  chainAmountToHuman,
  formatNumber,
  rTokenRateToHuman,
} from "utils/number";
import { getTokenSymbol } from "utils/rToken";
import { useAppSlice } from "./selector";
import { useTokenStandard } from "./useTokenStandard";
import { useWalletAccount } from "./useWalletAccount";

interface EraRewardModel {
  era: number;
  rate: string;
  stakeValue: string;
  addedStakeAmount: string;
  rTokenBalance: string;
  addedRTokenAmount: string;
  reward: string;
}

export function useRTokenReward(
  tokenName: TokenName,
  page: number,
  chartDuSeconds: number
) {
  const dispatch = useDispatch();
  const tokenStandard = useTokenStandard(tokenName);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>(
    RequestStatus.loading
  );
  const [totalCount, setTotalCount] = useState(0);
  const [totalReward, setTotalReward] = useState("--");
  const [lastEraReward, setLastEraReward] = useState("--");
  const [chartXData, setChartXData] = useState<string[]>([]);
  const [chartYData, setChartYData] = useState<string[]>([]);
  const [rewardList, setRewardList] = useState<EraRewardModel[]>([]);

  const { updateFlag15s } = useAppSlice();
  const { metaMaskAccount } = useWalletAccount();

  const userAddress = useMemo(() => {
    if (tokenStandard === TokenStandard.ERC20) {
      return metaMaskAccount;
    }
    return "";
  }, [tokenStandard, metaMaskAccount]);

  const fetchData = useCallback(async () => {
    const chainType =
      tokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : tokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : tokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : tokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1;

    if (!userAddress || chainType === -1 || !updateFlag15s) {
      setRequestStatus(RequestStatus.success);
      return;
    }

    setRequestStatus(RequestStatus.loading);
    try {
      const url = `${getRTokenApi2Host()}/stafi/webapi/rtoken/reward`;

      const params = {
        userAddress,
        chainType,
        rTokenType:
          tokenName === TokenName.ETH ? -1 : getTokenSymbol(tokenName),
        pageIndex: page,
        pageCount: PAGE_SIZE,
        chartDuSeconds,
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const resJson = await res.json();

      if (resJson.status === "80000" && resJson.data) {
        setRequestStatus(RequestStatus.success);

        setTotalCount(resJson.data.totalCount);
        setTotalReward(
          chainAmountToHuman(
            resJson.data.totalReward || "0",
            getTokenSymbol(tokenName)
          )
        );
        setChartXData(
          resJson.data.rewardChartXData
            ?.map((item: number) =>
              dayjs.unix(item).format("YYYY.MM.DD HH:mm:ss")
            )
            ?.reverse() || []
        );

        setChartYData(
          resJson.data.rewardChartYData
            ?.map((item: string) => {
              let tokenSymbol;
              if (
                tokenStandard === TokenStandard.ERC20 ||
                tokenStandard === TokenStandard.BEP20
              ) {
                tokenSymbol = TokenSymbol.ETH;
              } else {
                tokenSymbol = getTokenSymbol(tokenName);
              }
              return formatNumber(
                chainAmountToHuman(item, getTokenSymbol(tokenName))
              );
            })
            ?.reverse() || []
        );

        if (
          tokenStandard === TokenStandard.ERC20 ||
          tokenStandard === TokenStandard.BEP20
        ) {
          setLastEraReward(
            chainAmountToHuman(resJson.data.lastEraReward, TokenSymbol.ETH)
          );
        } else if (
          tokenStandard === TokenStandard.Native ||
          tokenStandard === TokenStandard.SPL
        ) {
          setLastEraReward(
            chainAmountToHuman(
              resJson.data.lastEraReward,
              getTokenSymbol(tokenName)
            )
          );
        }

        const formatRewardList = resJson.data.eraRewardList.map(
          (element: EraRewardModel) => {
            const newRate = rTokenRateToHuman(element.rate);
            let newStakeValue = "--";
            let newRTokenBalance = "--";
            let addedStakeAmount = "--";
            let addedRTokenAmount = "--";
            let newReward: number | string = "--";
            if (
              tokenStandard === TokenStandard.ERC20 ||
              tokenStandard === TokenStandard.BEP20
            ) {
              newStakeValue = chainAmountToHuman(
                element.stakeValue,
                TokenSymbol.ETH
              );

              newRTokenBalance = chainAmountToHuman(
                element.rTokenBalance,
                TokenSymbol.ETH
              );
              addedStakeAmount = chainAmountToHuman(
                element.addedStakeAmount,
                TokenSymbol.ETH
              );
              addedRTokenAmount = chainAmountToHuman(
                element.addedRTokenAmount,
                TokenSymbol.ETH
              );
              if (!isEmpty(element.reward)) {
                newReward = chainAmountToHuman(element.reward, TokenSymbol.ETH);
              }
            } else if (
              tokenStandard === TokenStandard.Native ||
              tokenStandard === TokenStandard.SPL
            ) {
              newStakeValue = chainAmountToHuman(
                element.stakeValue,
                getTokenSymbol(tokenName)
              );
              newRTokenBalance = chainAmountToHuman(
                element.rTokenBalance,
                getTokenSymbol(tokenName)
              );
              addedStakeAmount = chainAmountToHuman(
                element.addedStakeAmount,
                getTokenSymbol(tokenName)
              );
              addedRTokenAmount = chainAmountToHuman(
                element.addedRTokenAmount,
                getTokenSymbol(tokenName)
              );
              if (!isEmpty(element.reward)) {
                newReward = chainAmountToHuman(
                  element.reward,
                  getTokenSymbol(tokenName)
                );
              }
            }

            return {
              era: element.era,
              rate: newRate,
              stakeValue: newStakeValue,
              addedStakeAmount,
              rTokenBalance: newRTokenBalance,
              addedRTokenAmount,
              reward: newReward,
            };
          }
        );
        setRewardList([...formatRewardList]);
      } else {
        throw new Error(COMMON_ERROR_MESSAGE);
      }
    } catch {
      setRequestStatus(RequestStatus.error);
    } finally {
      // dispatch(setLoading(false));
    }
  }, [
    tokenName,
    tokenStandard,
    page,
    userAddress,
    chartDuSeconds,
    updateFlag15s,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    requestStatus,
    totalCount,
    totalReward,
    lastEraReward,
    chartXData,
    chartYData,
    rewardList,
  };
}
