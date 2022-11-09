import { isDev } from "./env";

interface Bep20TokenContractConfig {
  rETH: string;
}

export function getBep20TokenContractConfig(): Bep20TokenContractConfig {
  if (isDev()) {
    return {
      rETH: "0x3b507040b02c55aa3363baf7ed4f4a6439b98771",
    };
  }

  return {
    rETH: "0xa7a0a9fda65cd786b3dc718616cee25afb110544",
  };
}
