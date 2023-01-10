import { TokenName } from "interfaces/common";
import { isDev } from "./env";

interface SPLTokenContractConfig {
  FIS: string;
  rSOL: string;
}

export function getSPLTokenContractConfig(): SPLTokenContractConfig {
  if (isDev()) {
    return {
      FIS: "GcXBmxeWiC74TTYhUpHQpN4LbgePWKPMhWt8ogFJ5dhA",
      rSOL: "GMEWnNF677xG7y11Qg72DAn5ZXViyrVHPPpNq3LS8JJh",
    };
  }

  return {
    FIS: "FG7x94jPcVbtt4pLXWhyr6sU3iWim8JJ2y215X5yowN5",
    rSOL: "7hUdUTkJLwdcmt3jSEeqx4ep91sm1XwBxMDaJae6bD5D",
  };
}

interface SPLBridgeConfig {
  bridge: string;
  feeReceiver: string;
  tokenProgramId: string;
  bridgeProgramId: string;
  systemProgramId: string;
}

export function getSPLBridgeConfig(): SPLBridgeConfig {
  if (isDev()) {
    return {
      bridge: "63ytYLeNDaaUx2u94KHJcoueaLzA7gryB26p2w8E53oh",
      feeReceiver: "9jafwiLBh6gAd4kRqKQQjkZTjFaZ2ADt2JdJ22Qi12yJ",
      tokenProgramId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
      bridgeProgramId: "EPfxck35M3NJwsjreExLLyQAgAL3y5uWfzddY6cHBrGy",
      systemProgramId: "11111111111111111111111111111111",
    };
  }

  return {
    bridge: "Ev64NXXeKdtBgJbXyuJKEw77pxaw5q4BkUb2eKeV5xDy",
    feeReceiver: "GK4hMS4dBhQZfmo1MYKXKz76aXaKndQJ6YavzfEhc2w7",
    tokenProgramId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    bridgeProgramId: "H3mPx8i41Zn4dLC6ZQRBzNRe1cqYdbcDP1WpojnaiAVo",
    systemProgramId: "11111111111111111111111111111111",
  };
}
