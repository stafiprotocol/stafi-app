export const STORAGE_KEY_NOTICE = "stafi_notice";
export const STORAGE_KEY_UNREAD_NOTICE = "stafi_unread_notice";
export const STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP =
  "stafi_hide_eth_validator_fee_tip";
export const STORAGE_KEY_POLKADOT_ACCOUNT = "polkadot_account";
export const STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG =
  "polkadot_wallet_allowed";

export function saveStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}
