import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenName } from "interfaces/common";
import {
  addNoticeInternal,
  NoticeDataType,
  NoticeStatus,
  NoticeTxDetail,
  NoticeType,
} from "utils/notice";
import {
  removeStorage,
  saveStorage,
  STORAGE_KEY_UNREAD_NOTICE,
} from "utils/storage";
import { AppThunk } from "../store";

interface StakeLoadingParams {
  modalVisible: boolean;
  tokenName: TokenName;
  amount: string;
  willReceiveAmount: string;
  status: "loading" | "success" | "error";
}

export interface AppState {
  isLoading: boolean;
  unreadNoticeFlag: boolean;
  updateFlag15s: number;
  stakeLoadingParams: StakeLoadingParams | undefined;
}

const initialState: AppState = {
  isLoading: false,
  unreadNoticeFlag: false,
  updateFlag15s: 0,
  stakeLoadingParams: undefined,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setIsLoading: (state: AppState, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setUnreadNoticeFlag: (state: AppState, action: PayloadAction<boolean>) => {
      if (action.payload) {
        saveStorage(STORAGE_KEY_UNREAD_NOTICE, "1");
      } else {
        removeStorage(STORAGE_KEY_UNREAD_NOTICE);
      }
      state.unreadNoticeFlag = action.payload;
    },
    setUpdateFlag15s: (state: AppState, action: PayloadAction<number>) => {
      state.updateFlag15s = action.payload;
    },
  },
});

export const { setIsLoading, setUnreadNoticeFlag, setUpdateFlag15s } =
  appSlice.actions;

export default appSlice.reducer;

/**
 * Add notice record.
 */
export const addNotice =
  (
    id: string,
    type: NoticeType,
    txDetail: NoticeTxDetail,
    data: NoticeDataType,
    explorerUrl: string,
    status: NoticeStatus = "Pending"
  ): AppThunk =>
  async (dispatch, getState) => {
    addNoticeInternal(id, type, txDetail, data, explorerUrl, status);
    dispatch(setUnreadNoticeFlag(true));
  };
