import { isDev } from "config/env";
import {
  getMetamaskEthChainId,
  getMetaMaskEthConnectConfig,
  getMetamaskMaticChainId,
  getMetamaskValidatorChainId,
  getMetaMaskValidatorConnectConfig,
  getWeb3ProviderUrlConfig,
} from "config/metaMask";

import { metaMask } from "connectors/metaMask";
import { TokenName } from "interfaces/common";
import { Symbol } from "keyring/defaults";
import { FisAccount } from "redux/reducers/FisSlice";
import { KeyringServer } from "servers/keyring";
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
  } else if (targetChainId === getMetamaskMaticChainId()) {
    metaMask.activate(getMetamaskMaticChainId());
  }
}

export function connectPolkadot() {
  const conn = async () => {
    const { web3Enable, web3Accounts } = await import(
      "@polkadot/extension-dapp"
    );
    const accounts = await web3Enable("stafi/rtoken").then(
      async () => await web3Accounts()
    );
    const keyringInstance = new KeyringServer().init(Symbol.Fis);
    const fisAccounts: FisAccount[] = accounts.map((account) => {
      const address = keyringInstance.encodeAddress(
        keyringInstance.decodeAddress(account.address)
      );
      return {
        name: account.meta.name,
        address,
        balance: "--",
      };
    });
    return fisAccounts;
  };

  return conn();
}

export async function getErc20AssetBalance(
  userAddress: string | undefined,
  tokenAbi: AbiItem | AbiItem[],
  tokenAddress: string | undefined,
  tokenName?: TokenName,
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return "--";
  }
  try {
    let web3 = createWeb3(
      new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().eth)
    );
    if (tokenName === TokenName.MATIC && window.ethereum) {
      web3 = createWeb3(window.ethereum);
    }

    let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: userAddress,
    });
    const result = await contract.methods.balanceOf(userAddress).call();
    let balance = web3.utils.fromWei(result, "ether");
    return balance;
  } catch (err: any) {
    // console.log(err);
    return "--";
  }
}

export async function getBep20AssetBalance(
  userAddress: string | undefined,
  tokenAbi: AbiItem | AbiItem[],
  tokenAddress: string | undefined,
  tokenName?: TokenName,
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return "--";
  }
  try {
    let web3 = createWeb3(
      isDev()
        ? new Web3.providers.HttpProvider(getWeb3ProviderUrlConfig().bsc)
        : new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().bsc)
    );
    // if (tokenName === TokenName.MATIC && window.ethereum) {
    //   web3 = createWeb3(window.ethereum);
    // }

    let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: userAddress,
    });
    const result = await contract.methods.balanceOf(userAddress).call();
    let balance = web3.utils.fromWei(result, "ether");
    return balance;
  } catch (err: unknown) {
    // console.log(err);
    return "--";
  }
}
