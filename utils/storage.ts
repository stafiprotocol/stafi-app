import { estimateUnbondDays } from "config/unbond";
import dayjs from "dayjs";
import { TokenName } from "interfaces/common";

export const STORAGE_KEY_NOTICE = "stafi_notice";
export const STORAGE_KEY_UNREAD_NOTICE = "stafi_unread_notice";
export const STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP =
  "stafi_hide_eth_validator_fee_tip";
export const STORAGE_KEY_POLKADOT_ACCOUNT = "polkadot_account";
export const STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG =
  "polkadot_wallet_allowed";
export const STORAGE_KEY_UNBOND_RECORDS =
  "stafi_unbond_records";

export function saveStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}

export function addRTokenUnbondRecords(tokenName: TokenName, record: any) {
  const localUnbondRecords = getStorage(STORAGE_KEY_UNBOND_RECORDS);
  const unbondRecords = localUnbondRecords ? JSON.parse(localUnbondRecords) : null;
  let arr: any[] = [];
  if (unbondRecords && unbondRecords[tokenName]) {
    arr = unbondRecords[tokenName];
  }

  const newLen = arr.unshift({ ...record, timestamp: dayjs().valueOf() });
  if (newLen > 10) {
    arr.pop();
  }
  const newUnbondRecords = {
    ...unbondRecords,
    [tokenName]: arr,
  };

  saveStorage(STORAGE_KEY_UNBOND_RECORDS, JSON.stringify(newUnbondRecords)); 
}

export function getRTokenUnbondRecords(tokenName: TokenName): any[] {
  const localUnbondRecords = getStorage(STORAGE_KEY_UNBOND_RECORDS);
  const unbondRecords = localUnbondRecords ? JSON.parse(localUnbondRecords) : null;
  if (unbondRecords && unbondRecords[tokenName]) {
    unbondRecords[tokenName].forEach((item: any) => {
      item.remainingDays = Math.ceil(Math.max(0, Number(item.estimateSuccessTime) - dayjs().valueOf()) / 86400000);
      item.periodInDays = estimateUnbondDays(tokenName);
    });
    return unbondRecords[tokenName];
  }
  return [];
}
