import { getBep20BridgeContractConfig } from "config/bep20Contract";
import { isDev } from "config/env";
import {
  getErc20BridgeContractConfig,
  getErc20ContractConfig,
} from "config/erc20Contract";
import { getWeb3ProviderUrlConfig } from "config/metaMask";

import { RTokenName, TokenName } from "interfaces/common";
import { Symbol } from "keyring/defaults";
import { i } from "mathjs";
import { FisAccount } from "redux/reducers/FisSlice";
import { KeyringServer } from "servers/keyring";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { REJECTED_MESSAGE } from "./constants";

let stafiEthWeb3: undefined | Web3 = undefined;
let ethWeb3: undefined | Web3 = undefined;
let bscWeb3: undefined | Web3 = undefined;

export function createWeb3(provider?: any) {
  var web3 = new Web3(provider || Web3.givenProvider);
  return web3;
}

export function getEthWeb3() {
  if (!ethWeb3) {
    ethWeb3 = createWeb3(
      new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().eth)
    );
  }
  return ethWeb3;
}

export function getStafiEthWeb3() {
  if (!stafiEthWeb3) {
    stafiEthWeb3 = createWeb3(
      new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().stafiEth)
    );
  }
  return stafiEthWeb3;
}

export function getBscWeb3() {
  if (!bscWeb3) {
    bscWeb3 = createWeb3(
      isDev()
        ? new Web3.providers.HttpProvider(getWeb3ProviderUrlConfig().bsc)
        : new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().bsc)
    );
  }
  return bscWeb3;
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
  tokenName?: TokenName | RTokenName
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return undefined;
  }
  try {
    let web3;
    if (tokenName === TokenName.ETH) {
      web3 = getStafiEthWeb3();
    } else {
      web3 = getEthWeb3();
    }
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
    return undefined;
  }
}

export async function getBep20AssetBalance(
  userAddress: string | undefined,
  tokenAbi: AbiItem | AbiItem[],
  tokenAddress: string | undefined,
  tokenName?: TokenName
) {
  if (!userAddress || !tokenAbi || !tokenAddress) {
    return undefined;
  }
  try {
    let web3;
    if (tokenName === TokenName.BNB && window.ethereum) {
      web3 = createWeb3(window.ethereum);
    } else {
      web3 = getBscWeb3();
    }

    let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
      from: userAddress,
    });
    const result = await contract.methods.balanceOf(userAddress).call();
    let balance = web3.utils.fromWei(result, "ether");
    return balance;
  } catch (err: unknown) {
    // console.log(err);
    return undefined;
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

export async function getErc20Allowance(
  ethAddress: string,
  tokenAbi: any,
  tokenAddress: string
) {
  let web3 = getEthWeb3();
  let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
    from: ethAddress,
  });
  try {
    const allowance = await contract.methods
      .allowance(ethAddress, getErc20BridgeContractConfig().bridgeHandler)
      .call();
    return allowance;
  } catch (e: any) {
    console.error(e);
    return "--";
  }
}

export async function getBep20Allowance(
  ethAddress: string,
  tokenAbi: any,
  tokenAddress: string
) {
  let web3 = getBscWeb3();
  let contract = new web3.eth.Contract(tokenAbi, tokenAddress, {
    from: ethAddress,
  });
  try {
    const allowance = await contract.methods
      .allowance(ethAddress, getBep20BridgeContractConfig().bridgeHandler)
      .call();
    return allowance;
  } catch (e: any) {
    console.error(e);
    return "--";
  }
}
