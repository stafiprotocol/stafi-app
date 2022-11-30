import { TokenName } from "interfaces/common";
import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useTokenPoolData(tokenName: TokenName) {
  const { stakedAmount, stakedValue } = useAppSelector((state: RootState) => {
    const poolData = state.rToken.tokenPoolData[tokenName];
    return poolData || { stakedAmount: "--", stakedValue: "--" };
  });

  return {
    stakedAmount,
    stakedValue,
  };
}
