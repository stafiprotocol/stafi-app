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

export function getStafiScanTxUrl(txHash: string | undefined) {
  if (isDev()) {
    return `https://stafi.subscan.io/extrinsic/${txHash}`;
  }
  return `https://stafi.subscan.io/extrinsic/${txHash}`;
}

export function getKsmScanTxUrl(txHash: string | undefined) {
  if (isDev()) {
    return `https://kusama.subscan.io/extrinsic/${txHash}`;
  }
  return `https://kusama.subscan.io/extrinsic/${txHash}`;
}

export function getDotScanTxUrl(txHash: string | undefined) {
  if (isDev()) {
    return `https://polkadot.subscan.io/extrinsic/${txHash}`;
  }
  return `https://polkadot.subscan.io/extrinsic/${txHash}`;
}
