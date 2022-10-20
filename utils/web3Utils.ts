import { MetaMask } from "@web3-react/metamask";
import { isDev } from "config/env";
import { getMetamaskChainId, getMetaMaskStafiTestnetConfig } from "config/eth";
import Web3 from "web3";

export function createWeb3() {
  var web3 = new Web3(Web3.givenProvider);
  return web3;
}

export function connectMetaMask(metaMask: MetaMask) {
  metaMask.activate(getMetamaskChainId());
}
