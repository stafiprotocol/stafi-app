import { useEffect } from "react";
import { setUnreadNoticeFlag } from "redux/reducers/AppSlice";
import { getStorage, STORAGE_KEY_UNREAD_NOTICE } from "utils/storage";
import { useAppDispatch } from "./common";

export function useInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unreadNotice = getStorage(STORAGE_KEY_UNREAD_NOTICE);
    dispatch(setUnreadNoticeFlag(!!unreadNotice));
  }, [dispatch]);
}
