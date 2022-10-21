import { AddEthereumChainParameter } from "@web3-react/types";
import { isDev } from "./env";

export function getMetamaskChainId() {
  if (isDev()) {
    return 1338;
  }
  return 1;
}

export function getMetaMaskConnectConfig() {
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

export function getStafiLightNodeAbi() {
  const abi =
    '[{"inputs":[{"internalType":"address","name":"_stafiStorageAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"validatorSignature","type":"bytes"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"EtherDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"}],"name":"OffBoarded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"},{"indexed":false,"internalType":"uint256","name":"status","type":"uint256"}],"name":"SetPubkeyStatus","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"}],"name":"Staked","type":"event"},{"inputs":[],"name":"PUBKEY_STATUS_CANWITHDRAW","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_INITIAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_MATCH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_OFFBOARD","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_STAKING","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_UNINITIAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_UNMATCH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_WITHDRAWED","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PubkeySetStorage","outputs":[{"internalType":"contractIPubkeySetStorage","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"_validatorPubkeys","type":"bytes[]"},{"internalType":"bytes[]","name":"_validatorSignatures","type":"bytes[]"},{"internalType":"bytes32[]","name":"_depositDataRoots","type":"bytes32[]"}],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"depositEth","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"getCurrentNodeDepositAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLightNodeDepositEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getLightNodePubkeyAt","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"}],"name":"getLightNodePubkeyCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"}],"name":"getLightNodePubkeyStatus","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"},{"internalType":"address","name":"user","type":"address"}],"name":"getPubkeyVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"}],"name":"offBoard","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"}],"name":"provideNodeDepositToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"receiveEtherWithdrawal","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bool","name":"_value","type":"bool"}],"name":"setLightNodeDepositEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"},{"internalType":"uint256","name":"_status","type":"uint256"}],"name":"setLightNodePubkeyStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"_validatorPubkeys","type":"bytes[]"},{"internalType":"bytes[]","name":"_validatorSignatures","type":"bytes[]"},{"internalType":"bytes32[]","name":"_depositDataRoots","type":"bytes32[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"_pubkeys","type":"bytes[]"},{"internalType":"bool[]","name":"_matchs","type":"bool[]"}],"name":"voteWithdrawCredentials","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"}],"name":"withdrawNodeDepositToken","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  return JSON.parse(abi);
}

export function getStafiSuperNodeAbi() {
  const abi =
    '[{"inputs":[{"internalType":"address","name":"_stafiStorageAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"},{"indexed":false,"internalType":"bytes","name":"validatorSignature","type":"bytes"}],"name":"Deposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"EtherDeposited","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"},{"indexed":false,"internalType":"uint256","name":"status","type":"uint256"}],"name":"SetPubkeyStatus","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bytes","name":"pubkey","type":"bytes"}],"name":"Staked","type":"event"},{"inputs":[],"name":"PUBKEY_STATUS_INITIAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_MATCH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_STAKING","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_UNINITIAL","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PUBKEY_STATUS_UNMATCH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PubkeySetStorage","outputs":[{"internalType":"contractIPubkeySetStorage","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"_validatorPubkeys","type":"bytes[]"},{"internalType":"bytes[]","name":"_validatorSignatures","type":"bytes[]"},{"internalType":"bytes32[]","name":"_depositDataRoots","type":"bytes32[]"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"depositEth","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"},{"internalType":"address","name":"user","type":"address"}],"name":"getPubkeyVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSuperNodeDepositEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getSuperNodePubkeyAt","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"}],"name":"getSuperNodePubkeyCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"}],"name":"getSuperNodePubkeyStatus","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"_value","type":"bool"}],"name":"setSuperNodeDepositEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_validatorPubkey","type":"bytes"},{"internalType":"uint256","name":"_status","type":"uint256"}],"name":"setSuperNodePubkeyStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"_validatorPubkeys","type":"bytes[]"},{"internalType":"bytes[]","name":"_validatorSignatures","type":"bytes[]"},{"internalType":"bytes32[]","name":"_depositDataRoots","type":"bytes32[]"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"_pubkeys","type":"bytes[]"},{"internalType":"bool[]","name":"_matchs","type":"bool[]"}],"name":"voteWithdrawCredentials","outputs":[],"stateMutability":"nonpayable","type":"function"}]';
  return JSON.parse(abi);
}

export function getStafiNodeManagerAbi() {
  const abi =
    '[{"inputs":[{"internalType":"address","name":"_stafiStorageAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"NodeRegistered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bool","name":"trusted","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"NodeSuperSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"node","type":"address"},{"indexed":false,"internalType":"bool","name":"trusted","type":"bool"},{"indexed":false,"internalType":"uint256","name":"time","type":"uint256"}],"name":"NodeTrustedSet","type":"event"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getNodeAt","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNodeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"}],"name":"getNodeExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"}],"name":"getNodeTrusted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getSuperNodeAt","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSuperNodeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"}],"name":"getSuperNodeExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"getTrustedNodeAt","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getTrustedNodeCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"}],"name":"registerNode","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"},{"internalType":"bool","name":"_super","type":"bool"}],"name":"setNodeSuper","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_nodeAddress","type":"address"},{"internalType":"bool","name":"_trusted","type":"bool"}],"name":"setNodeTrusted","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]';
  return JSON.parse(abi);
}

export function getStafiNetworkSettingsAbi() {
  const abi =
    '[{"inputs":[{"internalType":"address","name":"_stafiStorageAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"getNodeConsensusThreshold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNodeFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNodeRefundRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getNodeTrustedRefundRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getPlatformFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getProcessWithdrawalsEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSubmitBalancesEnabled","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getSuperNodePubkeyLimit","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getWithdrawalCredentials","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setNodeConsensusThreshold","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setNodeFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setNodeRefundRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setNodeTrustedRefundRatio","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setPlatformFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_value","type":"bool"}],"name":"setProcessWithdrawalsEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_value","type":"bool"}],"name":"setSubmitBalancesEnabled","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setSuperNodePubkeyLimit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"_value","type":"bytes"}],"name":"setWithdrawalCredentials","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}]';
  return JSON.parse(abi);
}

interface StafiEthContractConfig {
  stafiLightNode: string;
  stafiSuperNode: string;
  stafiNodeManager: string;
  stafiNetworkSettings: string;
}

export function getStafiEthContractConfig(): StafiEthContractConfig {
  if (isDev()) {
    return {
      stafiLightNode: "0x4FEEA697bE14596c672681b92B1dfA41b654955b",
      stafiSuperNode: "0xfa052FB4D0C530bDCBA7bF0C675515d3f12313b6",
      stafiNodeManager: "0xC495018a16A9cF1b3659C1AcCbf1ddE50FD1b1A0",
      stafiNetworkSettings: "0x430CB4F814EaA5816E3845f31A5EC3803bDa5B9F",
    };
  }

  return {
    stafiLightNode: "0x1c906685384df71e3fafa6f3b21bd884e9d44f4b",
    stafiSuperNode: "0x588e859cb38fecf2d56925c0512471ab47aa9ff1",
    stafiNodeManager: "0xd8575c32bbc1ea9d33856a6de74be258712307a8",
    stafiNetworkSettings: "0xc59ff0c05de52347b2d7bf38eebdc994d97cea8f",
  };
}

export function getStafiEthWithdrawalCredentials() {
  if (isDev()) {
    return "00325b04539edc57dfb7d0e3f414ae51f1a601608fa05c79a1660f531084d7ee";
  }
  return "003cd051a5757b82bf2c399d7476d1636473969af698377434af1d6c54f2bee9";
}
