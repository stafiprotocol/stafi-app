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
    rMATIC: '0x482030aac2d537d6e9a5805a66e3a4023a2e401f',
  };
}
