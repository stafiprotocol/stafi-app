import { isDev } from "./env";

export function getEtherScanTxUrl(txHash: string) {
  if (isDev()) {
    return `https://goerli.etherscan.io/tx/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
}
