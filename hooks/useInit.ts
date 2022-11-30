import { hooks, metaMask } from "connectors/metaMask";
import dayjs from "dayjs";
import { useEffect } from "react";
import { setUnreadNoticeFlag, setUpdateFlag15s } from "redux/reducers/AppSlice";
import { updateRTokenPriceList, updateTokenPoolData } from "redux/reducers/RTokenSlice";
import {
  connectPolkadotJs,
  setMetaMaskAccount,
} from "redux/reducers/WalletSlice";
import {
  getStorage,
  STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG,
  STORAGE_KEY_UNREAD_NOTICE,
} from "utils/storage";
import { useAppDispatch } from "./common";
import { useAppSlice } from "./selector";
import { useInterval } from "./useInterval";
import { usePolkadotApi } from "./usePolkadotApi";

export function useInit() {
  const dispatch = useAppDispatch();
  const { useAccount: useMetaMaskAccount, useChainId: useMetaMaskChainId } =
    hooks;
  const metaMaskAccount = useMetaMaskAccount();
  const { updateFlag15s } = useAppSlice();

  useEffect(() => {
    // Init notice.
    const unreadNotice = getStorage(STORAGE_KEY_UNREAD_NOTICE);
    dispatch(setUnreadNoticeFlag(!!unreadNotice));
  }, [dispatch]);

  useEffect(() => {
    // Query priceList.
    dispatch(updateRTokenPriceList());
		// Query pool data
		dispatch(updateTokenPoolData());
  }, [updateFlag15s, dispatch]);

  useInterval(() => {
    dispatch(setUpdateFlag15s(dayjs().unix()));
  }, 15000);

  useEffect(() => {
    if (!metaMaskAccount) {
      metaMask.connectEagerly();
    }
    dispatch(setMetaMaskAccount(metaMaskAccount));
  }, [dispatch, metaMaskAccount]);

  useEffect(() => {
    // Auto connect polkadot.js if connected before.
    if (getStorage(STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG)) {
      dispatch(connectPolkadotJs());
    }
  }, [dispatch]);
}
