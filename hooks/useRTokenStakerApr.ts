import { TokenName } from "interfaces/common";
import { useEffect } from "react";
import { updateRTokenStakerApr } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useRTokenStakerApr(tokenName: TokenName) {
  const dispatch = useAppDispatch();
  const stakerApr = useAppSelector((state: RootState) => {
    const store = state.rToken.rTokenStakerAprStore;
    return store[tokenName] || "--";
  });

  useEffect(() => {
    if (isNaN(Number(stakerApr))) {
      dispatch(updateRTokenStakerApr(tokenName));
    }
  }, [dispatch, tokenName, stakerApr]);

  return stakerApr;
}
