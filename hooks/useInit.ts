import { hooks, metaMask } from "connectors/metaMask";
import dayjs from "dayjs";
import { useEffect } from "react";
import { setUnreadNoticeFlag, setUpdateFlag15s } from "redux/reducers/AppSlice";
import { updateRTokenPriceList } from "redux/reducers/RTokenSlice";
import { setMetaMaskAccount } from "redux/reducers/WalletSlice";
import { getStorage, STORAGE_KEY_UNREAD_NOTICE } from "utils/storage";
import { useAppDispatch } from "./common";
import { useAppSlice } from "./selector";
import { useInterval } from "./useInterval";

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
}
