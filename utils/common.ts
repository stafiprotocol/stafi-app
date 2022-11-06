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
