import { TokenName } from "interfaces/common";
import { isDev } from "./env";

export function getEthValidatorWithdrawalCredentials() {
  if (isDev()) {
    return "00325b04539edc57dfb7d0e3f414ae51f1a601608fa05c79a1660f531084d7ee";
  }
  return "003cd051a5757b82bf2c399d7476d1636473969af698377434af1d6c54f2bee9";
}

export function getEthValidatorSVFeeRecipient() {
  return "0x6fb2aa2443564d9430b9483b1a5eea13a522df45";
}

export function getEthValidatorTVFeeRecipient() {
  return "0xdc5a28885a1800b1435982954ee9b51d2a8d3bf0";
}

interface Erc20ContractConfig {
  stafiLightNode: string;
  stafiSuperNode: string;
  stafiNodeManager: string;
  stafiNetworkSettings: string;
  userDeposit: string;
}

export function getErc20ContractConfig(): Erc20ContractConfig {
  if (isDev()) {
    // dev
    return {
      stafiLightNode: "0x4FEEA697bE14596c672681b92B1dfA41b654955b",
      stafiSuperNode: "0xfa052FB4D0C530bDCBA7bF0C675515d3f12313b6",
      stafiNodeManager: "0xC495018a16A9cF1b3659C1AcCbf1ddE50FD1b1A0",
      stafiNetworkSettings: "0x430CB4F814EaA5816E3845f31A5EC3803bDa5B9F",
      userDeposit: "0x70C5744d377aE6E9926CcBCF19D501340CB26285",
    };
  }

  // production
  return {
    stafiLightNode: "0x1c906685384df71e3fafa6f3b21bd884e9d44f4b",
    stafiSuperNode: "0x588e859cb38fecf2d56925c0512471ab47aa9ff1",
    stafiNodeManager: "0xd8575c32bbc1ea9d33856a6de74be258712307a8",
    stafiNetworkSettings: "0xc59ff0c05de52347b2d7bf38eebdc994d97cea8f",
    userDeposit: "0x625b7fd68b35ee8dc2c9405a712fa450ccd357be",
  };
}

interface Erc20TokenContractConfig {
  rETH: string;
  rMATIC: string;
  rKSM: string;
  rDOT: string;
}

export function getErc20TokenContractConfig(): Erc20TokenContractConfig {
  if (isDev()) {
    // Goerli
    // return {
    //   rETH: "0x0ed54e1b7b3be1c02d91b4fa8bf5655f3fbe08b4",
    // };
    return {
      rETH: "0xE6b876ED4e9191645484FC8940A35784381c2f9B",
      rMATIC: "0x97dce48fb450590f3fc7e8caf4868c374804dd9e",
      rKSM: "0xc8acfdbe0634d041f529d130e7cd33a5be3f73d3",
      rDOT: "0x5561eecdabd404e36259a8b4edb198be838a1b02",
    };
  }

  return {
    rETH: "0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593",
    rMATIC: "0xcc75b43d3e43a7a26efd88c1c1e231fc42487bb8",
    rKSM: "0x3c3842c4d3037ae121d69ea1e7a0b61413be806c",
    rDOT: "0x505f5a4ff10985fe9f93f2ae3501da5fe665f08a",
  };
}
