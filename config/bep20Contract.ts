import { isDev } from "./env";

interface Bep20TokenContractConfig {
  rETH: string;
  rMATIC: string;
}

export function getBep20TokenContractConfig(): Bep20TokenContractConfig {
  if (isDev()) {
    return {
      rETH: "0x3b507040b02c55aa3363baf7ed4f4a6439b98771",
      rMATIC: '0x4204deeb6c923a57dc270c0b09e8a2615be08593',
    };
  }

  return {
    rETH: "0xa7a0a9fda65cd786b3dc718616cee25afb110544",
    rMATIC: '0x117eefdde5e5aed6626ffedbb5d2ac955f64dbf3',
  };
}
