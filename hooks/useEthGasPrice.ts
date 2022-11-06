import { useEffect } from "react";
import { updateEthGasPrice } from "redux/reducers/EthSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useEthGasPrice() {
  const dispatch = useAppDispatch();
  const gasPrice = useAppSelector((state: RootState) => {
    return state.eth.gasPrice;
  });

  useEffect(() => {
    if (isNaN(Number(gasPrice))) {
      dispatch(updateEthGasPrice());
    }
  }, [dispatch, gasPrice]);

  return gasPrice;
}
