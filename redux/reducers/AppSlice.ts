import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
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
  modalVisible?: boolean;
  status?: "loading" | "success" | "error";
  tokenName?: TokenName;
  tokenStandard?: TokenStandard;
  amount?: string;
  willReceiveAmount?: string;
  newTotalStakedAmount?: string;
  scanUrl?: string;
  txHash?: string;
  progressDetail?: StakeLoadingProgressDetail;
	userAction?: string; // 'staking' | 'redeem'
}

interface StakeLoadingProgressDetail {
  sending?: StakeLoadingProgressDetailItem;
  staking?: StakeLoadingProgressDetailItem;
  minting?: StakeLoadingProgressDetailItem;
  swapping?: StakeLoadingProgressDetailItem;
}

interface ConnectWalletModalParams {
  visible: boolean;
  walletList: WalletType[];
  targetMetaMaskChainId?: number;
}

export interface StakeLoadingProgressDetailItem {
  totalStatus?: "loading" | "success" | "error";
  broadcastStatus?: "loading" | "success" | "error";
  packStatus?: "loading" | "success" | "error";
  finalizeStatus?: "loading" | "success" | "error";
}

export interface AppState {
  isLoading: boolean;
  unreadNoticeFlag: boolean;
  updateFlag15s: number;
  stakeLoadingParams: StakeLoadingParams | undefined;
  connectWalletModalParams: ConnectWalletModalParams | undefined;
}

const initialState: AppState = {
  isLoading: false,
  unreadNoticeFlag: false,
  updateFlag15s: 0,
  stakeLoadingParams: undefined,
  connectWalletModalParams: undefined,
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
    setStakeLoadingParams: (
      state: AppState,
      action: PayloadAction<StakeLoadingParams | undefined>
    ) => {
      if (!action.payload) {
        state.stakeLoadingParams = undefined;
      } else {
        const newParams = {
          ...state.stakeLoadingParams,
          ...action.payload,
        };
        state.stakeLoadingParams = newParams;
      }
    },
    setConnectWalletModalParams: (
      state: AppState,
      action: PayloadAction<ConnectWalletModalParams | undefined>
    ) => {
      state.connectWalletModalParams = action.payload;
    },
  },
});

export const {
  setIsLoading,
  setUnreadNoticeFlag,
  setUpdateFlag15s,
  setStakeLoadingParams,
  setConnectWalletModalParams,
} = appSlice.actions;

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
