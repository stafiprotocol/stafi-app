import { getRTokenApi2Host } from "config/env";
import {
  ChainId,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import { isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { PAGE_SIZE } from "utils/constants";
import { chainAmountToHuman, rTokenRateToHuman } from "utils/number";
import { getTokenSymbol } from "utils/rToken";
import { useSelectedTokenStandard } from "./useSelectedTokenStandard";
import { useWalletAccount } from "./useWalletAccount";

interface ChartData {
  chartXData: number[];
  chartYData: string[];
}

interface EraRewardModel {
  era: number;
  rate: string;
  stakeValue: string;
  rTokenBalance: string;
  reward: string;
}

export function useEraReward(tokenName: TokenName) {
  const dispatch = useDispatch();
  const tokenStandard = useSelectedTokenStandard(tokenName);
  const [lastEraReward, setLastEraReward] = useState("--");
  const [chartData, setChartData] = useState<ChartData>();
  const [pageIndex, setPageIndex] = useState(1);
  const [chainType, setChainType] = useState<number>(ChainId.STAFI);
  const [rewardList, setRewardList] = useState<EraRewardModel[]>([]);
  const [userAddress, setUserAddress] = useState<string>();

  const { metaMaskAccount } = useWalletAccount();

  useEffect(() => {
    setPageIndex(1);
    setChainType(
      tokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : tokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : tokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : tokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1
    );
    if (userAddress) {
      // dispatch(setLoading(true));
    }
  }, [dispatch, tokenStandard, userAddress]);

  useEffect(() => {
    if (tokenStandard === "Native") {
    } else if (tokenStandard === "SPL") {
    } else {
      setUserAddress(metaMaskAccount);
    }
  }, [tokenStandard, metaMaskAccount]);

  const fetchData = useCallback(async () => {
    if (!userAddress || chainType === -1) {
      return;
    }

    try {
      const url = `${getRTokenApi2Host()}/stafi/webapi/rtoken/reward`;

      const params = {
        userAddress,
        chainType,
        rTokenType:
          tokenName === TokenName.ETH ? -1 : getTokenSymbol(tokenName),
        pageIndex,
        pageCount: PAGE_SIZE,
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
        const formatYData = resJson.data.chartYData.map((element: string) => {
          if (
            tokenStandard === TokenStandard.ERC20 ||
            tokenStandard === TokenStandard.BEP20
          ) {
            return chainAmountToHuman(element, TokenSymbol.ETH);
          } else {
            return chainAmountToHuman(element, getTokenSymbol(tokenName));
          }
        });

        setChartData({
          chartXData: resJson.data.chartXData.reverse(),
          chartYData: formatYData.reverse(),
        });

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
              rTokenBalance: newRTokenBalance,
              reward: newReward,
            };
          }
        );
        setRewardList([...formatRewardList]);
      }
    } catch {
    } finally {
      // dispatch(setLoading(false));
    }
  }, [chainType, pageIndex, userAddress, tokenName, tokenStandard]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { lastEraReward, chartData, rewardList };
}

// export function useLastEraReward(platform: string, type: string) {
//   const [lastEraReward, setLastEraReward] = useState("--");
//   const [chainType, setChainType] = useState(STAFI_CHAIN_ID);
//   const [userAddress, setUserAddress] = useState<string>();
//   const { metaMaskAddress } = useMetaMaskAccount();
//   const { stafiPubKey } = useStafiAccount();
//   const { solPubKey } = useSolAccount();

//   const fetchData = useCallback(async () => {
//     if (!userAddress || chainType === -1) {
//       return;
//     }

//     try {
//       const url = `${config.api2()}/stafi/webapi/rtoken/lastEraReward`;
//       const res = await api.post(url, {
//         // userAddress: '0x5a47773e001e22ea6d2db06e1e06ce8ad9e9be03dfe150be8477ec048d7f6840',
//         userAddress,
//         chainType,
//         rTokenType: type === "rETH" ? -1 : getRsymbolByTokenTitle(type),
//       });

//       if (res.status === "80000" && res.data) {
//         if (platform === "ERC20" || platform === "BEP20") {
//           setLastEraReward(
//             numberUtil.handleAmountFloorToFixed(
//               numberUtil.tokenAmountToHuman(
//                 res.data.lastEraReward,
//                 rSymbol.Eth
//               ),
//               6
//             )
//           );
//         } else if (platform === "Native") {
//           setLastEraReward(
//             numberUtil.handleAmountFloorToFixed(
//               numberUtil.tokenAmountToHuman(
//                 res.data.lastEraReward,
//                 getRsymbolByTokenTitle(type)
//               ),
//               6
//             )
//           );
//         }
//       }
//     } finally {
//     }
//   }, [chainType, platform, type, userAddress]);

//   useEffect(() => {
//     if (platform === "Native") {
//       setUserAddress(stafiPubKey);
//     } else if (platform === "SPL") {
//       setUserAddress(solPubKey);
//     } else {
//       setUserAddress(metaMaskAddress);
//     }
//   }, [platform, stafiPubKey, metaMaskAddress, solPubKey]);

//   useEffect(() => {
//     setChainType(
//       platform === "Native"
//         ? STAFI_CHAIN_ID
//         : platform === "ERC20"
//         ? ETH_CHAIN_ID
//         : platform === "BEP20"
//         ? BSC_CHAIN_ID
//         : platform === "SPL"
//         ? SOL_CHAIN_ID
//         : -1
//     );
//   }, [platform, type, userAddress]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { lastEraReward };
// }
