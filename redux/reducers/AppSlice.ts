import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ChainId,
  TokenName,
  TokenStandard,
  WalletType,
} from "interfaces/common";
import { rSymbol } from "keyring/defaults";
import {
  addNoticeInternal,
  LocalNotice,
  updateNoticeInternal,
} from "utils/notice";
import {
  removeStorage,
  saveStorage,
  STORAGE_KEY_UNREAD_NOTICE,
} from "utils/storage";
import { AppThunk } from "../store";

export interface StakeLoadingParams {
  modalVisible?: boolean;
  noticeUuid?: string;
  steps?: string[];
  status?: "loading" | "success" | "error";
  displayMsg?: string;
  errorStep?: "sending" | "staking" | "minting" | "swapping";
  tokenName?: TokenName;
  tokenStandard?: TokenStandard;
  amount?: string;
  willReceiveAmount?: string;
  newTotalStakedAmount?: string;
  scanUrl?: string;
  txHash?: string;
  progressDetail?: StakeLoadingProgressDetail;
  targetAddress?: string;
  blockHash?: string;
  poolPubKey?: string;
  customMsg?: string;
}

interface StakeLoadingProgressDetail {
  approving?: StakeLoadingProgressDetailItem;
  sending?: StakeLoadingSendingDetailItem;
  staking?: StakeLoadingStakingDetailItem;
  minting?: StakeLoadingProgressDetailItem;
  swapping?: StakeLoadingProgressDetailItem;
  sendingParams?: {
    amount: string;
    willReceiveAmount: string;
    tokenStandard: TokenStandard | undefined;
    targetAddress: string;
    newTotalStakedAmount: string;
    txFee?: string;
  };
  stakingParams?: {
    address: string;
    amount: string;
    txHash: string;
    blockHash: string;
    poolAddress: string;
    targetAddress: string;
    type: rSymbol;
    chainId: ChainId;
  };
}

interface ConnectWalletModalParams {
  visible: boolean;
  targetUrl: string;
  walletList: WalletType[];
  targetMetaMaskChainId?: number;
}

export interface StakeLoadingProgressDetailItem {
  totalStatus?: "loading" | "success" | "error";
  broadcastStatus?: "loading" | "success" | "error";
  packStatus?: "loading" | "success" | "error";
  finalizeStatus?: "loading" | "success" | "error";
  txHash?: string;
}

export interface StakeLoadingSendingDetailItem {
  totalStatus?: "loading" | "success" | "error";
  broadcastStatus?: "loading" | "success" | "error";
  packStatus?: "loading" | "success" | "error";
  finalizeStatus?: "loading" | "success" | "error";
}

export interface StakeLoadingStakingDetailItem {
  totalStatus?: "loading" | "success" | "error";
  broadcastStatus?: "loading" | "success" | "error";
  packStatus?: "loading" | "success" | "error";
  finalizeStatus?: "loading" | "success" | "error";
  txHash?: string;
}

export interface RedeemLoadingParams {
  modalVisible?: boolean;
  noticeUuid?: string;
  status?: "loading" | "success" | "error";
  errorMsg?: string;
  tokenName?: TokenName;
  tokenStandard?: TokenStandard;
  amount?: string;
  willReceiveAmount?: string;
  newTotalStakedAmount?: string;
  scanUrl?: string;
  txHash?: string;
  targetAddress?: string;
  broadcastStatus?: "loading" | "success" | "error";
  packStatus?: "loading" | "success" | "error";
  finalizeStatus?: "loading" | "success" | "error";
  customMsg?: String;
}

export interface AppState {
  isLoading: boolean;
  unreadNoticeFlag: boolean;
  updateFlag15s: number;
  stakeLoadingParams: StakeLoadingParams | undefined;
  connectWalletModalParams: ConnectWalletModalParams | undefined;
  redeemLoadingParams: RedeemLoadingParams | undefined;
  refreshDataFlag: number;
}

const initialState: AppState = {
  isLoading: false,
  unreadNoticeFlag: false,
  updateFlag15s: 0,
  stakeLoadingParams: undefined,
  connectWalletModalParams: undefined,
  redeemLoadingParams: undefined,
  refreshDataFlag: 0,
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
      state.stakeLoadingParams = action.payload;
    },
    setConnectWalletModalParams: (
      state: AppState,
      action: PayloadAction<ConnectWalletModalParams | undefined>
    ) => {
      state.connectWalletModalParams = action.payload;
    },
    setRedeemLoadingParams: (
      state: AppState,
      action: PayloadAction<RedeemLoadingParams | undefined>
    ) => {
      if (!action.payload) {
        state.redeemLoadingParams = undefined;
      } else {
        state.redeemLoadingParams = {
          ...state.redeemLoadingParams,
          ...action.payload,
        };
      }
    },
    setRefreshDataFlag: (state: AppState, action: PayloadAction<number>) => {
      state.refreshDataFlag = action.payload;
    },
  },
});

const { setStakeLoadingParams } = appSlice.actions;

export const {
  setIsLoading,
  setUnreadNoticeFlag,
  setUpdateFlag15s,
  setConnectWalletModalParams,
  setRedeemLoadingParams,
  setRefreshDataFlag,
} = appSlice.actions;

export default appSlice.reducer;

export const resetStakeLoadingParams =
  (stakeLoadingParams: StakeLoadingParams | undefined): AppThunk =>
  async (dispatch, getState) => {
    dispatch(setStakeLoadingParams(stakeLoadingParams));
  };

export const updateStakeLoadingParams =
  (
    stakeLoadingParams: StakeLoadingParams,
    cb?: (newParams: StakeLoadingParams | undefined) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    let newParams;
    if (!stakeLoadingParams) {
      newParams = undefined;
    } else {
      newParams = {
        ...getState().app.stakeLoadingParams,
        ...stakeLoadingParams,
        progressDetail: {
          ...getState().app.stakeLoadingParams?.progressDetail,
          ...stakeLoadingParams.progressDetail,
        },
      };
    }

    dispatch(setStakeLoadingParams(newParams));
    cb && cb(newParams);
  };

/**
 * Add notice record.
 */
export const addNotice =
  (notice: LocalNotice): AppThunk =>
  async (dispatch, getState) => {
    addNoticeInternal(notice);
    dispatch(setUnreadNoticeFlag(true));
  };

/**
 * Update notice status.
 */
export const updateNotice =
  (id: string | undefined, newNotice: Partial<LocalNotice>): AppThunk =>
  async (dispatch, getState) => {
    if (!id) {
      return;
    }
    updateNoticeInternal(id, newNotice);
    dispatch(setUnreadNoticeFlag(true));
  };

export const updateRefreshDataFlag =
  (): AppThunk => async (dispatch, getState) => {
    dispatch(setRefreshDataFlag(getState().app.refreshDataFlag + 1));
  };
