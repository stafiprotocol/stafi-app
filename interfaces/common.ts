export enum RequestStatus {
  loading = 1,
  success = 2,
  error = 3,
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

export enum TokenStandard {
  Native = "Native",
  ERC20 = "ERC20",
  BEP20 = "BEP20",
}

export enum ChartDu {
  ALL = "ALL",
  "1W" = "1W",
  "1M" = "1M",
  "3M" = "3M",
  "6M" = "6M",
}
