import { RTokenName } from "interfaces/common";
import { cloneDeep } from "lodash";
import { useEffect, useMemo } from "react";
import { getMintPrograms, RTokenActs } from "redux/reducers/MintProgramSlice";
import { PriceItem, updateRTokenPriceList } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { formatNumber } from "utils/number";
import numberUtil from "utils/numberUtil";
import { getTokenSymbol, rTokenNameToTokenSymbol } from "utils/rToken";
import { useAppDispatch, useAppSelector } from "./common";
import { useInterval } from "./useInterval";

export interface RTokenListItem {
  rToken: RTokenName;
  children: RTokenActs[];
}

const rTokenList: RTokenListItem[] = [
  {
    rToken: RTokenName.rETH,
    children: [],
  },
  {
    rToken: RTokenName.rFIS,
    children: [],
  },
  {
    rToken: RTokenName.rDOT,
    children: [],
  },
  {
    rToken: RTokenName.rATOM,
    children: [],
  },
  {
    rToken: RTokenName.rMATIC,
    children: [],
  },
  {
    rToken: RTokenName.rKSM,
    children: [],
  },
  {
    rToken: RTokenName.rBNB,
    children: [],
  },
  {
    rToken: RTokenName.rSOL,
    children: [],
  },
];

export function useRPoolMintRTokenActs() {
  const dispatch = useAppDispatch();

  const { rTokenActs, priceList } = useAppSelector((state: RootState) => {
    const rTokenActs = state.mintProgram.rTokenActs;
    const priceList = state.rToken.priceList;
    return {
      rTokenActs,
      priceList,
    };
  });

  const mintDataList = useMemo(() => {
    rTokenList.forEach((item: RTokenListItem) => {
      item.children = cloneDeep(rTokenActs[item.rToken]) || [];
    });
    rTokenList.sort((x: RTokenListItem, y: RTokenListItem) => {
      if (x.children.length === 0 || y.children.length === 0) return 0;
      if (
        x.children[0].nowBlock < x.children[0].end &&
        y.children[0].nowBlock > y.children[0].end
      ) {
        return -1;
      }
      if (
        x.children[0].nowBlock < x.children[0].end &&
        y.children[0].nowBlock < y.children[0].end
      ) {
        if (x.children[0].end !== y.children[0].end) {
          return x.children[0].end - y.children[0].end;
        }
        let xTotal = 0;
        x.children.forEach((i: any) => {
          xTotal += i.total_reward;
        });
        let yTotal = 0;
        y.children.forEach((i: any) => {
          yTotal += i.total_reward;
        });
        return yTotal - xTotal;
      }
      return 0;
    });
    rTokenList.forEach((item: RTokenListItem) => {
      const unitPrice = priceList.find(
        (priceItem: PriceItem) => priceItem.symbol === item.rToken
      );
      if (!unitPrice || !item.children || item.children.length === 0) {
        return true;
      }
      item.children.forEach((child: any) => {
        const formatTotalRTokenAmount = numberUtil.tokenAmountToHuman(
          child.total_rtoken_amount,
          rTokenNameToTokenSymbol(item.rToken)
        );
        child.mintedValue =
          Number(unitPrice.price) * Number(formatTotalRTokenAmount);
      });
    });

    console.log(rTokenList);
    return [...rTokenList];
  }, [rTokenActs, priceList]);

  const { totalRewardFis, totalMintedValue } = useMemo(() => {
    let total = 0;
    let fisAmount = 0;
    const result = { totalMintedValue: "--", totalRewardFis: "--" };

    mintDataList.forEach((item: RTokenListItem) => {
      item.children.forEach((child: any) => {
        total += child.mintedValue;
        fisAmount += numberUtil.fisAmountToHuman(child.total_reward);
      });
    });

    result.totalMintedValue = formatNumber(total);
    result.totalRewardFis = formatNumber(fisAmount);

    return result;
  }, [priceList, mintDataList]);

  const { liveList, finishedList } = useMemo(() => {
    const liveList: RTokenListItem[] = [];
    const finishedList: RTokenListItem[] = [];
    mintDataList.forEach((data: RTokenListItem) => {
      const { rToken } = data;
      const liveChildren = data.children.filter(
        (item: RTokenActs) => item.nowBlock < item.end
      );
      const completedChildren = data.children.filter(
        (item: RTokenActs) => item.nowBlock >= item.end
      );

      liveList.push({
        rToken,
        children: cloneDeep(liveChildren),
      });
      finishedList.push({
        rToken,
        children: cloneDeep(completedChildren),
      });
    });

    return { liveList, finishedList };
  }, [mintDataList]);

  useEffect(() => {
    dispatch(getMintPrograms());
  }, []);

  useEffect(() => {
    dispatch(updateRTokenPriceList());
  }, [dispatch]);

  useInterval(() => {
    dispatch(getMintPrograms());
  }, 60000);

  return { totalRewardFis, totalMintedValue, liveList, finishedList };
}
