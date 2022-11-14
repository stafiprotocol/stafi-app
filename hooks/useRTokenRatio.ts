import { TokenName } from "interfaces/common";
import { useEffect } from "react";
import { updateRTokenRatio } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export function useRTokenRatio(tokenName: TokenName) {
  const dispatch = useAppDispatch();
  const { updateFlag15s } = useAppSlice();

  const ratio = useAppSelector((state: RootState) => {
    const store = state.rToken.rTokenRatioStore;
    return store[tokenName] || "--";
  });

  useEffect(() => {
    dispatch(updateRTokenRatio(tokenName));
  }, [dispatch, tokenName, ratio, updateFlag15s]);

  return ratio;
}
