import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getApiHost } from "config/env";
import { TokenName } from "interfaces/common";
import { AppThunk } from "redux/store";
import numberUtil from "utils/numberUtil";

export interface SwapLimit {
  max: number;
  min: number;
}

export interface PoolInfoItem {
  symbol: TokenName;
  swapRate: string;
  poolAddress: string;
}

export interface FisStatonState {
  swapLimit: SwapLimit;
  poolInfoList: PoolInfoItem[];
}

const initialState: FisStatonState = {
  swapLimit: {
    max: 0,
    min: 0,
  },
  poolInfoList: [],
};

export const fisStationSlice = createSlice({
  name: "fisStation",
  initialState,
  reducers: {
    setSwapLimit: (state: FisStatonState, action: PayloadAction<SwapLimit>) => {
      state.swapLimit = action.payload;
    },
    setPoolInfoList: (
      state: FisStatonState,
      action: PayloadAction<PoolInfoItem[]>
    ) => {
      state.poolInfoList = action.payload;
    },
  },
});

export const { setSwapLimit, setPoolInfoList } = fisStationSlice.actions;

export default fisStationSlice.reducer;

export const updatePoolInfoList =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const response = await fetch(
        `${getApiHost()}/feeStation/api/v1/station/poolInfo`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        const { swapMaxLimit, swapMinLimit, poolInfoList } = resJson.data;
        dispatch(
          setSwapLimit({
            max: numberUtil.fisAmountToHuman(swapMaxLimit),
            min: numberUtil.fisAmountToHuman(swapMinLimit),
          })
        );
        dispatch(setPoolInfoList(poolInfoList));
      }
    } catch (err: any) {}
  };

export const handleSwap = (tokenName: TokenName, amount: string, cb?: Function): AppThunk =>
async (dispatch, getState) => {
	const poolInfoList = getState().fisStation.poolInfoList;
	const selectedPoolInfo = poolInfoList.find((info: PoolInfoItem) => info.symbol === tokenName);
	if (!selectedPoolInfo) return;
}