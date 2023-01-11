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
