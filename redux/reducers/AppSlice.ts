import { createSlice, PayloadAction } from "@reduxjs/toolkit";
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

export interface AppState {
  isLoading: boolean;
  unreadNoticeFlag: boolean;
}

const initialState: AppState = {
  isLoading: false,
  unreadNoticeFlag: false,
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
  },
});

export const { setIsLoading, setUnreadNoticeFlag } = appSlice.actions;

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
