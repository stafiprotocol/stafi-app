import {
  getStorage,
  saveStorage,
  STORAGE_KEY_NOTICE,
  STORAGE_KEY_UNREAD_NOTICE,
} from "./storage";
import * as _ from "lodash";
import dayjs from "dayjs";

export interface LocalNotice {
  id: string;
  type: NoticeType;
  timestamp: number;
  txDetail: NoticeTxDetail;
  data: NoticeDataType;
  scanUrl: string;
  status: NoticeStatus;
}

export type NoticeType =
  | "Fee Station"
  | "Stake"
  | "Unbond"
  | "ETH Deposit"
  | "ETH Stake";

export type NoticeStatus = "Pending" | "Error" | "Confirmed";

export interface NoticeTxDetail {
  sender: string;
  transactionHash: string;
}

export type NoticeDataType =
  | NoticeFeeStationData
  | NoticeStakeData
  | NoticeUnbondData
  | NoticeEthDepositData;

export interface NoticeFeeStationData {
  inputTokenName: string;
  outputTokenName: string;
  inputAmount: string;
  outputAmount: string;
  uuid: string;
  payTxHash?: string;
}

export interface NoticeStakeData {
  tokenName: string;
  stakeAmount: string;
  eraNumber: number;
}

export interface NoticeUnbondData {
  tokenName: string;
  rTokenName: string;
  rTokenDenom: string;
  unstakeAmount: string;
  willGetAmount: string;
  completeTimestamp: number;
}

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

export function addNoticeInternal(
  id: string,
  type: NoticeType,
  txDetail: NoticeTxDetail,
  data: NoticeDataType,
  scanUrl: string,
  status: NoticeStatus
) {
  const noticeList = getNoticeList();

  const newLength = noticeList.unshift({
    id,
    type,
    txDetail,
    data,
    timestamp: dayjs().valueOf(),
    scanUrl,
    status,
  });

  if (newLength > 10) {
    noticeList.pop();
  }

  saveStorage(STORAGE_KEY_NOTICE, JSON.stringify(noticeList));
  saveStorage(STORAGE_KEY_UNREAD_NOTICE, "1");
}

export function updateNoticeInternal(
  id: string,
  newStatus: NoticeStatus,
  newData?: Partial<NoticeDataType>
) {
  const noticeList = getNoticeList();

  const targetNotice = _.remove(noticeList, (value) => {
    return value.id === id;
  });

  if (targetNotice.length === 1) {
    let matched = targetNotice[0];
    if (newData) {
      matched = {
        ...matched,
        data: {
          ...matched.data,
          ...newData,
        },
      };
    }

    noticeList.unshift({
      ...matched,
      status: newStatus,
    });

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
