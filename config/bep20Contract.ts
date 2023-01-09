import { isDev } from "./env";

interface Bep20TokenContractConfig {
  FIS: string;
  rFIS: string;
  rETH: string;
  rMATIC: string;
  rKSM: string;
  rDOT: string;
}

export function getBep20TokenContractConfig(): Bep20TokenContractConfig {
  if (isDev()) {
    return {
      FIS: "0x3dabfb5b0ca8c416684e2a26c1ebc4039627c94a",
      rFIS: "0xd92ae76ce2b60775f20f8022e667f7752802127f",
      rETH: "0x55e26c165aad558f32a3f9660749ff278811a6ee",
      rMATIC: "0x4204deeb6c923a57dc270c0b09e8a2615be08593",
      rKSM: "0x7a8d8b0c6e869ee331d8a1855150bbca0c00aa22",
      rDOT: "0x79df548d4a8019bea6aef47401152f053c806ef6",
    };
  }

  return {
    FIS: "",
    rFIS: "0x8962a0f6c00ecad3b420ddeb03a6ef624d645fed",
    rETH: "0xa7a0a9fda65cd786b3dc718616cee25afb110544",
    rMATIC: "0x117eefdde5e5aed6626ffedbb5d2ac955f64dbf3",
    rKSM: "0xfa1df7c727d56d5fec8c79ef38a9c69aa9f784a3",
    rDOT: "0x1dab2a526c8ac1ddea86838a7b968626988d33de",
  };
}

interface Bep20BridgeContractConfig {
  bridgeHandler: string;
  bridge: string;
}

export function getBep20BridgeContractConfig(): Bep20BridgeContractConfig {
  if (isDev()) {
    return {
      bridgeHandler: "0x2f34b2be8e739ac24c79bcef0e3504cf8f1f4c10",
      bridge: "0x945fc2ec72b5035fbeba3ca67e2388df6aa632dc",
    };
  }

  return {
    bridgeHandler: "0x13ef51f0525df6045267baed411f535d86586bc1",
    bridge: "0xef3a930e1ffffacd2fc13434ac81bd278b0ecc8d",
  };
}
