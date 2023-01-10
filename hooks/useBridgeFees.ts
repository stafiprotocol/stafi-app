import { TokenName } from "interfaces/common";
import { useEffect } from "react";
import { getBridgeFee, queryBridgeFee } from "redux/reducers/BridgeSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export function useBridgeFees(tokenName: TokenName) {
  const dispatch = useAppDispatch();
  const { updateFlag15s } = useAppSlice();

  const {
    maticErc20BridgeFee,
    maticBep20BridgeFee,
    maticSolBridgeFee,
    bridgeFeeStore,
  } = useAppSelector((state: RootState) => {
    return {
      maticErc20BridgeFee: state.bridge.maticErc20BridgeFee,
      maticBep20BridgeFee: state.bridge.maticBep20BridgeFee,
      maticSolBridgeFee: state.bridge.maticSolBridgeFee,
      bridgeFeeStore: state.bridge.bridgeFeeStore,
    };
  });

  useEffect(() => {
    // dispatch(getBridgeFee());
    dispatch(queryBridgeFee(tokenName));
  }, [dispatch, updateFlag15s, tokenName]);

  return {
    maticErc20BridgeFee,
    maticBep20BridgeFee,
    maticSolBridgeFee,
    bridgeFeeStore,
  };
}
