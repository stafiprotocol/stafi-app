export enum RequestStatus {
  loading = 1,
  success = 2,
  error = 3,
}

export enum ChainId {
  STAFI = 1,
  ETH = 2,
  BSC = 3,
  SOL = 4,
  STAFIHUB = 5,
}

export enum TokenStandard {
  Native = "Native",
  ERC20 = "ERC20",
  BEP20 = "BEP20",
  SPL = "SPL",
}

export enum TokenName {
  FIS = "FIS",
  ETH = "ETH",
  DOT = "DOT",
  KSM = "KSM",
  MATIC = "MATIC",
  BNB = "BNB",
  SOL = "SOL",
  ATOM = "ATOM",
}

export enum TokenSymbol {
  StafiHub = -2,
  Asset = -1,
  FIS = 0,
  DOT = 1,
  KSM = 2,
  ATOM = 3,
  SOL = 4,
  MATIC = 5,
  BNB = 6,
  ETH = 7,
}

export enum RTokenName {
  rFIS = "rFIS",
  rETH = "rETH",
  rDOT = "rDOT",
  rKSM = "rKSM",
  rMATIC = "rMATIC",
  rBNB = "rBNB",
  rSOL = "rSOL",
  rATOM = "rATOM",
}

export enum EthPubkeyStatus {
  all = 0,
  deposited = 2,
  staked = 3,
  unmatch = 4,
  waiting = 8,
  active = 9,
  exited = 10,
  pending = 20,
}

export interface EthPubkey {
  pubkey: string;
  status: number;
}

export interface NavigationItem {
  name: string;
  path?: string;
}

export enum ChartDu {
  ALL = "ALL",
  "1W" = "1W",
  "1M" = "1M",
  "3M" = "3M",
  "6M" = "6M",
}

export enum WalletType {
  MetaMask = "MetaMask",
  Polkadot = "Polkadot",
  Phantom = "Phantom",
}
