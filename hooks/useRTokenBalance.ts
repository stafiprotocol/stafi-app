import { TokenName, TokenStandard } from "interfaces/common";
import { useEffect } from "react";
import { updateRTokenBalance } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";
import { useWalletAccount } from "./useWalletAccount";

export function useRTokenBalance(
  tokenStandard: TokenStandard | undefined,
  tokenName: TokenName
) {
  const dispatch = useAppDispatch();
  const { updateFlag15s } = useAppSlice();
  const { metaMaskAccount } = useWalletAccount();

  const balance = useAppSelector((state: RootState) => {
    if (!tokenStandard) {
      return "--";
    }
    const store = state.rToken.rTokenBalanceStore;
    if (store[tokenStandard][tokenName]) {
      return store[tokenStandard][tokenName];
    } else {
      return "--";
    }
  });

  useEffect(() => {
    dispatch(updateRTokenBalance(tokenStandard, tokenName));
  }, [
    dispatch,
    balance,
    metaMaskAccount,
    tokenStandard,
    tokenName,
    updateFlag15s,
  ]);

  return balance;
}
