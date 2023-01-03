import { useEffect } from "react";
import { updatePoolInfoList } from "redux/reducers/FisStationSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useFisStationPoolInfo() {
  const dispatch = useAppDispatch();

  const { swapLimit, fisStationModalVisible, poolInfoList } = useAppSelector(
    (state: RootState) => {
      return {
        swapLimit: state.fisStation.swapLimit,
        poolInfoList: state.fisStation.poolInfoList,
        fisStationModalVisible: state.app.fisStationModalVisible,
      };
    }
  );

  useEffect(() => {
    if (!fisStationModalVisible) return;
    dispatch(updatePoolInfoList());
  }, [dispatch, fisStationModalVisible]);

  return {
    swapLimit,
    poolInfoList,
  };
}
