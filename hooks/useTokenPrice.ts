import { RootState } from "redux/store";
import { useAppSelector } from "./common";

/**
 *
 * @param symbol e.g. ETH, rETH
 * @returns
 */
export function useTokenPrice(symbol: string) {
  const price = useAppSelector((state: RootState) => {
    const priceList = state.rToken.priceList;
    const match = priceList.find((item) => item.symbol === `r${symbol}`);
    return match?.price || "--";
  });

  return price;
}
