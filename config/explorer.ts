import { isDev } from "./env";

export function getEtherScanUrl() {
  if (isDev()) {
    return `https://goerli.etherscan.io`;
  }
  return `https://etherscan.io`;
}

export function getEtherScanTxUrl(txHash: string) {
  if (isDev()) {
    return `https://goerli.etherscan.io/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}

export function getEtherScanAccountUrl(account: string) {
  if (isDev()) {
    return `https://goerli.etherscan.io/address/${account}`;
  }
  return `https://etherscan.io/address/${account}`;
}

export function getStafiScanUrl() {
  return "https://stafi.subscan.io/";
}
