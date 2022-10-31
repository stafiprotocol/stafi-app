import {
  getMetamaskEthChainId,
  getMetaMaskEthConnectConfig,
  getMetamaskValidatorChainId,
  getMetaMaskValidatorConnectConfig,
} from "config/metaMask";

import { metaMask } from "connectors/metaMask";
import Web3 from "web3";

export function createWeb3(provider?: any) {
  var web3 = new Web3(provider || Web3.givenProvider);
  return web3;
}

export type MetaMaskConnectType = "validator" | "eth" | "matic" | "bsc";

export function connectMetaMask(targetChainId: number | undefined) {
  if (targetChainId === undefined) {
    metaMask.activate(1);
  } else if (targetChainId === getMetamaskValidatorChainId()) {
    metaMask.activate(getMetaMaskValidatorConnectConfig());
  } else if (targetChainId === getMetamaskEthChainId()) {
    metaMask.activate(getMetaMaskEthConnectConfig());
  }
}
