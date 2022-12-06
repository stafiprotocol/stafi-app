import { isDev } from "./env";

interface Bep20TokenContractConfig {
  rETH: string;
  rMATIC: string;
  rKSM: string;
  rDOT: string;
}

export function getBep20TokenContractConfig(): Bep20TokenContractConfig {
  if (isDev()) {
    return {
      rETH: "0x3b507040b02c55aa3363baf7ed4f4a6439b98771",
      rMATIC: "0x4204deeb6c923a57dc270c0b09e8a2615be08593",
      rKSM: "0xfc42de640aa9759d460e1a11416eca95d25c5908",
      rDOT: "0x2ac784f009704a0e69a41abd43a6ec8e0e951979",
    };
  }

  return {
    rETH: "0xa7a0a9fda65cd786b3dc718616cee25afb110544",
    rMATIC: "0x117eefdde5e5aed6626ffedbb5d2ac955f64dbf3",
    rKSM: "0xfa1df7c727d56d5fec8c79ef38a9c69aa9f784a3",
    rDOT: "0x1dab2a526c8ac1ddea86838a7b968626988d33de",
  };
}
