import { isDev } from "config/env";
import { getWeb3ProviderUrlConfig } from "config/metaMask";

import { TokenName } from "interfaces/common";
import { Symbol } from "keyring/defaults";
import { FisAccount } from "redux/reducers/FisSlice";
import { KeyringServer } from "servers/keyring";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { REJECTED_MESSAGE } from "./constants";

export function createWeb3(provider?: any) {
  var web3 = new Web3(provider || Web3.givenProvider);
  return web3;
}

export type MetaMaskConnectType = "validator" | "eth" | "matic" | "bsc";

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
  tokenName?: TokenName
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return "--";
  }
  try {
    let web3 =
      tokenName === TokenName.ETH
        ? createWeb3(
            new Web3.providers.WebsocketProvider(
              getWeb3ProviderUrlConfig().stafiEth
            )
          )
        : createWeb3(
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
  tokenName?: TokenName
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

// https://blog.logrocket.com/understanding-resolving-metamask-error-codes/
export function getMetaMaskTxErrorMsg(result: any) {
  if (Number(result.code) === 4001) {
    return REJECTED_MESSAGE;
  } else if (Number(result.code) === 4100) {
    return "The requested action has not been authorized by user";
  } else if (Number(result.code) === 4200) {
    return "The requested method is not supported by this Ethereum provider";
  } else if (Number(result.code) === 4900) {
    return "The provider is disconnected from all chains";
  } else if (Number(result.code) === 32700 || Number(result.code) === 32600) {
    return "Invalid JSON params";
  }

  return result.message || "Transaction failed";
}
