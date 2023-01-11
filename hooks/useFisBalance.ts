import { TokenName, TokenStandard } from "interfaces/common";
import { useEffect } from "react";
import {
  clearRTokenBalance,
  updateFisBalance,
  updateRTokenBalance,
} from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";
import { useWalletAccount } from "./useWalletAccount";

export function useFisBalance(tokenStandard: TokenStandard | undefined) {
  const dispatch = useAppDispatch();
  const { updateFlag15s, refreshDataFlag } = useAppSlice();
  const { metaMaskAccount, polkadotAccount } = useWalletAccount();
  const balance = useAppSelector((state: RootState) => {
    if (!tokenStandard) {
      return undefined;
    }
    const store = state.rToken.fisBalanceStore;
    if (store[tokenStandard]) {
      return store[tokenStandard];
    } else {
      return undefined;
    }
  });

  useEffect(() => {
    dispatch(updateFisBalance(tokenStandard));
  }, [
    dispatch,
    metaMaskAccount,
    polkadotAccount,
    tokenStandard,
    updateFlag15s,
    refreshDataFlag,
  ]);

  return balance;
}
