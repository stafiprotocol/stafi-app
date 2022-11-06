import { TokenName } from "interfaces/common";
import { useEffect } from "react";
import { updateRTokenRatio } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useRTokenRatio(tokenName: TokenName) {
  const dispatch = useAppDispatch();
  const ratio = useAppSelector((state: RootState) => {
    const store = state.rToken.rTokenRatioStore;
    return store[tokenName] || "--";
  });

  useEffect(() => {
    if (isNaN(Number(ratio))) {
      dispatch(updateRTokenRatio(tokenName));
    }
  }, [dispatch, tokenName, ratio]);

  return ratio;
}
