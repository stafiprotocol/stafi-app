import { useEffect } from "react";
import { getBridgeFee } from "redux/reducers/BridgeSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export function useBridgeFees() {
  const dispatch = useAppDispatch();
  const { updateFlag15s } = useAppSlice();

  const { maticErc20BridgeFee, maticBep20BridgeFee, maticSolBridgeFee } =
    useAppSelector((state: RootState) => {
      return {
        maticErc20BridgeFee: state.bridge.maticErc20BridgeFee,
        maticBep20BridgeFee: state.bridge.maticBep20BridgeFee,
        maticSolBridgeFee: state.bridge.maticSolBridgeFee,
      };
    });

  useEffect(() => {
    dispatch(getBridgeFee());
  }, [dispatch, updateFlag15s]);

  return {
    maticErc20BridgeFee,
    maticBep20BridgeFee,
    maticSolBridgeFee,
  };
}
