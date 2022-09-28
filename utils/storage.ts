export const STORAGE_KEY_NOTICE = "stafi_notice";
export const STORAGE_KEY_UNREAD_NOTICE = "stafi_unread_notice";

export function saveStorage(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getStorage(key: string): string | null {
  return localStorage.getItem(key);
}

export function removeStorage(key: string) {
  localStorage.removeItem(key);
}
