import { useEffect } from "react";
import { getBridgeFee, queryBridgeFees } from "redux/reducers/BridgeSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export function useBridgeFees() {
  const dispatch = useAppDispatch();
  const { updateFlag15s } = useAppSlice();

  const { erc20BridgeFee, bep20BridgeFee, solBridgeFee } = useAppSelector(
    (state: RootState) => {
      return {
        erc20BridgeFee: state.bridge.erc20BridgeFee,
        bep20BridgeFee: state.bridge.bep20BridgeFee,
        solBridgeFee: state.bridge.solBridgeFee,
      };
    }
  );

  useEffect(() => {
    dispatch(getBridgeFee());
  }, [dispatch, updateFlag15s]);

  return {
    erc20BridgeFee,
    bep20BridgeFee,
    solBridgeFee,
  };
}
