import dayjs from "dayjs";
import { useEffect } from "react";
import { setUnreadNoticeFlag, setUpdateFlag15s } from "redux/reducers/AppSlice";
import { getStorage, STORAGE_KEY_UNREAD_NOTICE } from "utils/storage";
import { useAppDispatch } from "./common";
import { useInterval } from "./useInterval";

export function useInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unreadNotice = getStorage(STORAGE_KEY_UNREAD_NOTICE);
    dispatch(setUnreadNoticeFlag(!!unreadNotice));
  }, [dispatch]);

  useInterval(() => {
    dispatch(setUpdateFlag15s(dayjs().unix()));
  }, 15000);
}
