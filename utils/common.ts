import { encodeAddress } from "@polkadot/util-crypto";
import { TokenStandard, WalletType } from "interfaces/common";
import { checkAddressChecksum } from "web3-utils";

export function openLink(url: string | undefined | null) {
  if (!url) {
    return;
  }
  const otherWindow = window.open();
  if (otherWindow) {
    otherWindow.opener = null;
    otherWindow.location = url;
  }
}

export function isServer() {
  return typeof window === undefined;
}

export function getChartDuSeconds(chartDu: string) {
  if (chartDu === "1W") {
    return 24 * 3600 * 7;
  } else if (chartDu === "1M") {
    return 24 * 3600 * 30;
  } else if (chartDu === "3M") {
    return 24 * 3600 * 90;
  } else if (chartDu === "6M") {
    return 24 * 3600 * 180;
  }
  return 0;
}

export function checkMetaMaskAddress(address: string) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
  } else if (
    /^(0x|0X)?[0-9a-f]{40}$/.test(address) ||
    /^(0x|0X)?[0-9A-F]{40}$/.test(address)
  ) {
    return true;
  } else {
    return checkAddressChecksum(address);
  }
}

export function convertToSS58(
  text: string,
  prefix: number,
  isShort = false
): string {
  if (!text) {
    return "";
  }

  try {
    let address = encodeAddress(text, prefix);
    const length = 8;

    if (isShort) {
      address =
        address.substr(0, length) +
        "..." +
        address.substr(address.length - length, length);
    }

    return address;
  } catch (error) {
    return "";
  }
}

export function setLocalStorageItem(key: string, val: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export function getLocalStorageItem(key: string) {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(key);
  if (val) {
    return JSON.parse(val);
  }
  return null;
}

export function stafiUuid() {
  try {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;

        return v.toString(16);
      }
    );
  } catch {
    return "";
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isEmptyValue(value: string | number | undefined | null) {
  if (value === undefined || value === null || value === "") {
    return true;
  }
  return false;
}

export function isInvalidValue(value: string | number | undefined | null) {
  if (isNaN(Number(value))) {
    return true;
  }
  return false;
}

export function isPolkadotWallet(walletType: WalletType | undefined) {
  return (
    walletType === WalletType.Polkadot ||
    walletType === WalletType.Polkadot_KSM ||
    walletType === WalletType.Polkadot_DOT
  );
}

export function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isUnsupportedBridgePair(
  srcTokenStandard: TokenStandard | undefined,
  dstTokenStandard: TokenStandard | undefined
) {
  if (
    (srcTokenStandard === TokenStandard.ERC20 &&
      dstTokenStandard === TokenStandard.BEP20) ||
    (srcTokenStandard === TokenStandard.BEP20 &&
      dstTokenStandard === TokenStandard.ERC20)
  ) {
    return true;
  }
  if (
    (srcTokenStandard === TokenStandard.ERC20 &&
      dstTokenStandard === TokenStandard.SPL) ||
    (srcTokenStandard === TokenStandard.SPL &&
      dstTokenStandard === TokenStandard.ERC20)
  ) {
    return true;
  }
  if (
    (srcTokenStandard === TokenStandard.BEP20 &&
      dstTokenStandard === TokenStandard.SPL) ||
    (srcTokenStandard === TokenStandard.SPL &&
      dstTokenStandard === TokenStandard.BEP20)
  ) {
    return true;
  }
}
