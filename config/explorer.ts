import { ChainId } from "interfaces/common";
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

export function getEtherScanErc20TxUrl(address: any) {
  if (isDev()) {
    return `https://goerli.etherscan.io/address/${address}#tokentxns`;
  }
  return `https://etherscan.io/address/${address}#tokentxns`;
}

export function getBscScanBep20TxUrl(address: any) {
  if (isDev()) {
    return `https://testnet.bscscan.com/address/${address}#tokentxns`;
  }
  return `https://bscscan.com/address/${address}#tokentxns`;
}

export function getStafiScanUrl() {
  return "https://stafi.subscan.io/";
}

export function getPolkadotScanUrl() {
  return "https://polkadot.subscan.io/";
}

export function getKsmScanUrl() {
  return "https://kusama.subscan.io/";
}

export function getSolanaScanUrl() {
  return "https://solscan.io";
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

export function getSolScanTxUrl(txHash: string | undefined) {
  if (isDev()) {
    return `https://solscan.io/tx/${txHash}`;
  }
  return `https://solscan.io/tx/${txHash}`;
}

export function getBridgeSwapScanUrl(chainId: ChainId, targetAddress: string) {
  if (chainId === ChainId.STAFI) {
    return `https://stafi.subscan.io/account/${targetAddress}?tab=transfer`;
  } else if (chainId === ChainId.ETH) {
    return getEtherScanErc20TxUrl(targetAddress);
  } else if (chainId === ChainId.BSC) {
    return getBscScanBep20TxUrl(targetAddress);
  }
  return "";
}

export function getBnbScanTxUrl(txHash: string | undefined) {
  if (isDev()) {
    return `https://testnet.bscscan.com/tx/${txHash}`;
  }
  return `https://bscscan.com/tx/${txHash}`;
}
