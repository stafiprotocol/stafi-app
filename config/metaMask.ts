import { AddEthereumChainParameter } from "@web3-react/types";
import { isDev } from "./env";

export function getMetamaskValidatorChainId() {
  if (isDev()) {
    return 1338;
  }
  return 1;
}

export function getMetamaskEthChainId() {
  if (isDev()) {
    // return 1338;
    return 5;
  }
  return 1;
}

export function getMetamaskMaticChainId() {
  if (isDev()) {
    return 5; // goerli
  }
  return 1;
}

export function getMetamaskBscChainId() {
  if (isDev()) {
    return 0x61;
  }
  return 0x38;
}

export function getMetaMaskValidatorConnectConfig() {
  if (isDev()) {
    return getMetaMaskStafiTestnetConfig();
  }
  return 1;
}

export function getMetaMaskEthConnectConfig() {
  if (isDev()) {
    return getMetaMaskStafiTestnetConfig();
  }
  return 1;
}

export function getMetaMaskStafiTestnetConfig(): AddEthereumChainParameter {
  return {
    chainId: 1338,
    chainName: "StaFi Testnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://test-eth-node.stafi.io"],
  };
}

interface Web3ProviderUrlConfig {
  stafiEth: string;
  eth: string;
  bsc: string;
  polygon: string;
}

export function getWeb3ProviderUrlConfig(): Web3ProviderUrlConfig {
  if (isDev()) {
    return {
      // goerli
      eth: "wss://eth-goerli.alchemyapi.io/v2/O4w9rgihCPcRvH1IDF2BHLt5YSzSI9oJ",
      // stafi testnet
      stafiEth: "wss://test-eth-node.stafi.io",
      bsc: "https://bsc-testnet.blockvision.org/v1/2HD6MqYwTgYlZD2uDKmLPey8Thh",
      polygon: "wss://matic-testnet-archive-ws.bwarelabs.com",
    };
  }

  return {
    eth: "wss://eth-mainnet.ws.alchemyapi.io/v2/bkdml_X06uuwFV4-KONSO3NoPHkIIv8Z",
    stafiEth:
      "wss://eth-mainnet.ws.alchemyapi.io/v2/bkdml_X06uuwFV4-KONSO3NoPHkIIv8Z",
    bsc: "wss://speedy-nodes-nyc.moralis.io/5a284cffde906505c6eb2af8/bsc/mainnet/ws",
    polygon: "wss://rpc-mainnet.matic.network",
  };
}

export function getMetaMaskBscConfig(): AddEthereumChainParameter {
  if (isDev()) {
    return {
      chainId: 0x61,
      chainName: "BSC Testnet",
      nativeCurrency: {
        name: "BNB",
        symbol: "BNB",
        decimals: 18,
      },
      rpcUrls: ["https://data-seed-prebsc-2-s3.binance.org:8545/"],
      blockExplorerUrls: ["https://testnet.bscscan.com"],
    };
  }
  return {
    chainId: 0x38,
    chainName: "BSC Mainnet",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"],
  };
}
