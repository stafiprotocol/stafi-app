import { TokenName, TokenStandard } from "interfaces/common";
import { useEffect } from "react";
import {
  clearRTokenBalance,
  updateRTokenBalance,
} from "redux/reducers/RTokenSlice";
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
  const { metaMaskAccount, polkadotAccount } = useWalletAccount();
  const balance = useAppSelector((state: RootState) => {
    if (!tokenStandard) {
      return undefined;
    }
    const store = state.rToken.rTokenBalanceStore;
    if (store[tokenStandard][tokenName]) {
      return store[tokenStandard][tokenName];
    } else {
      return undefined;
    }
  });

  useEffect(() => {
    dispatch(clearRTokenBalance(tokenStandard, tokenName));
  }, [metaMaskAccount, polkadotAccount, dispatch, tokenStandard, tokenName]);

  useEffect(() => {
    dispatch(updateRTokenBalance(tokenStandard, tokenName));
  }, [
    dispatch,
    metaMaskAccount,
    polkadotAccount,
    tokenStandard,
    tokenName,
    updateFlag15s,
  ]);

  return balance;
}
