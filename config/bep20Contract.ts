import { isDev } from "./env";

interface Bep20TokenContractConfig {
  rETH: string;
  rMATIC: string;
  rBNB: string;
  rKSM: string;
  rDOT: string;
}

export function getBep20TokenContractConfig(): Bep20TokenContractConfig {
  if (isDev()) {
    return {
      rETH: "0x3b507040b02c55aa3363baf7ed4f4a6439b98771",
      rMATIC: "0x4204deeb6c923a57dc270c0b09e8a2615be08593",
      rKSM: "0x7a8d8b0c6e869ee331d8a1855150bbca0c00aa22",
      rDOT: "0x79df548d4a8019bea6aef47401152f053c806ef6",
			rBNB: "0xa05b158da3e58f6f9f8bf2473bc5cbfe3d70bc48",
    };
  }

  return {
    rETH: "0xa7a0a9fda65cd786b3dc718616cee25afb110544",
    rMATIC: "0x117eefdde5e5aed6626ffedbb5d2ac955f64dbf3",
    rBNB: "0xf027e525d491ef6ffcc478555fbb3cfabb3406a6",
    rKSM: "0xfa1df7c727d56d5fec8c79ef38a9c69aa9f784a3",
    rDOT: "0x1dab2a526c8ac1ddea86838a7b968626988d33de",
  };
}
