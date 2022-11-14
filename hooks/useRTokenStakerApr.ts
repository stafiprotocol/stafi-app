import { TokenName } from "interfaces/common";
import { useEffect } from "react";
import { updateRTokenStakerApr } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export function useRTokenStakerApr(tokenName: TokenName) {
  const dispatch = useAppDispatch();
  const { updateFlag15s } = useAppSlice();
  const stakerApr = useAppSelector((state: RootState) => {
    const store = state.rToken.rTokenStakerAprStore;
    return store[tokenName] || "--";
  });

  useEffect(() => {
    dispatch(updateRTokenStakerApr(tokenName));
  }, [dispatch, tokenName, stakerApr, updateFlag15s]);

  return stakerApr;
}
