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
