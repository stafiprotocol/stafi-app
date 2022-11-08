import { isDev } from "config/env";
import {
  getMetamaskEthChainId,
  getMetaMaskEthConnectConfig,
  getMetamaskValidatorChainId,
  getMetaMaskValidatorConnectConfig,
  getWeb3ProviderUrlConfig,
} from "config/metaMask";

import { metaMask } from "connectors/metaMask";
import { TokenName } from "interfaces/common";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

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

export async function getErc20AssetBalance(
  userAddress: string | undefined,
  tokenAbi: AbiItem | AbiItem[],
  tokenAddress: string | undefined
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return "--";
  }
  try {
    const web3 = createWeb3(
      new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().eth)
    );

    let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: userAddress,
    });
    const result = await contract.methods.balanceOf(userAddress).call();
    let balance = web3.utils.fromWei(result, "ether");
    return balance;
  } catch {
    return "--";
  }
}

export async function getBep20AssetBalance(
  userAddress: string | undefined,
  tokenAbi: AbiItem | AbiItem[],
  tokenAddress: string | undefined
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return "--";
  }
  try {
    const web3 = createWeb3(
      isDev()
        ? new Web3.providers.HttpProvider(getWeb3ProviderUrlConfig().bsc)
        : new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().bsc)
    );

    let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: userAddress,
    });
    const result = await contract.methods.balanceOf(userAddress).call();
    let balance = web3.utils.fromWei(result, "ether");
    return balance;
  } catch (err: unknown) {
    console.log(err);
    return "--";
  }
}
