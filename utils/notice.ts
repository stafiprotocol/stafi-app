import {
  getStorage,
  saveStorage,
  STORAGE_KEY_NOTICE,
  STORAGE_KEY_UNREAD_NOTICE,
} from "./storage";
import * as _ from "lodash";
import dayjs from "dayjs";
import { TokenName } from "interfaces/common";
import { StakeLoadingParams } from "redux/reducers/AppSlice";

export interface LocalNotice {
  id: string;
  type: NoticeType;
  data: NoticeDataType;
  status: NoticeStatus;
  txDetail?: NoticeTxDetail;
  scanUrl?: string;
  stakeLoadingParams?: StakeLoadingParams | undefined;
  timestamp?: number;
}

export type NoticeType =
  | "Fee Station"
  | "Stake"
  | "Unbond"
  | "ETH Deposit"
  | "ETH Stake"
  | "rToken Stake";

export type NoticeStatus = "Pending" | "Error" | "Confirmed";

export interface NoticeTxDetail {
  sender: string;
  transactionHash: string;
}

export type NoticeDataType = NoticeEthDepositData | NoticeRTokenStakeData;

export interface NoticeEthDepositData {
  type: "solo" | "trusted";
  amount: string;
  pubkeys: string[];
}

export interface NoticeEthDepositData {
  type: "solo" | "trusted";
  amount: string;
  pubkeys: string[];
}

export interface NoticeRTokenStakeData {
  amount: string;
  willReceiveAmount: string;
  tokenName: TokenName;
}

export function addNoticeInternal(newNotice: LocalNotice) {
  const noticeList = getNoticeList();

  const targetNotice = _.remove(noticeList, (value) => {
    return value.id === newNotice.id;
  });
  if (targetNotice.length > 0) {
    updateNoticeInternal(newNotice.id, newNotice);
  } else {
    const newLength = noticeList.unshift({
      ...newNotice,
      timestamp: dayjs().valueOf(),
    });

    if (newLength > 10) {
      noticeList.pop();
    }

    saveStorage(STORAGE_KEY_NOTICE, JSON.stringify(noticeList));
    saveStorage(STORAGE_KEY_UNREAD_NOTICE, "1");
  }
}

export function updateNoticeInternal(
  id: string,
  // newStatus: NoticeStatus,
  newNotice: Partial<LocalNotice>
) {
  const noticeList = getNoticeList();

  const targetNotice = _.remove(noticeList, (value) => {
    return value.id === id;
  });

  if (targetNotice.length === 1) {
    let matched = targetNotice[0];
    matched = {
      ...matched,
      ...newNotice,
    };

    noticeList.unshift(matched);

    saveStorage(STORAGE_KEY_NOTICE, JSON.stringify(noticeList));
    saveStorage(STORAGE_KEY_UNREAD_NOTICE, "1");
  }
}

export function getNoticeList(): LocalNotice[] {
  const localStr = getStorage(STORAGE_KEY_NOTICE);

  let noticeList: LocalNotice[] = [];
  if (localStr) {
    noticeList = JSON.parse(localStr);
  }

  return noticeList || [];
}
