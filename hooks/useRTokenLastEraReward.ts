import { getRTokenApi2Host } from "config/env";
import {
  ChainId,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chainAmountToHuman } from "utils/number";
import { getTokenSymbol } from "utils/rToken";
import { useTokenStandard } from "./useTokenStandard";
import { useWalletAccount } from "./useWalletAccount";

export function useRTokenLastEraReward(tokenName: TokenName) {
  const [lastEraReward, setLastEraReward] = useState("--");

  const tokenStandard = useTokenStandard(tokenName);
  const { metaMaskAccount } = useWalletAccount();

  const userAddress = useMemo(() => {
    if (tokenStandard === TokenStandard.ERC20) {
      return metaMaskAccount;
    }
    return "";
  }, [tokenStandard, metaMaskAccount]);

  const fetchData = useCallback(async () => {
    const chainType =
      tokenStandard === TokenStandard.Native
        ? ChainId.STAFI
        : tokenStandard === TokenStandard.ERC20
        ? ChainId.ETH
        : tokenStandard === TokenStandard.BEP20
        ? ChainId.BSC
        : tokenStandard === TokenStandard.SPL
        ? ChainId.SOL
        : -1;

    if (!userAddress || chainType === -1) {
      return;
    }

    try {
      const url = `${getRTokenApi2Host()}/stafi/webapi/rtoken/lastEraReward`;
      const params = {
        // userAddress: '0x5a47773e001e22ea6d2db06e1e06ce8ad9e9be03dfe150be8477ec048d7f6840',
        userAddress,
        chainType,
        rTokenType:
          tokenName === TokenName.ETH ? -1 : getTokenSymbol(tokenName),
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });
      const resJson = await res.json();

      if (resJson.status === "80000" && resJson.data) {
        if (
          tokenStandard === TokenStandard.ERC20 ||
          tokenStandard === TokenStandard.BEP20
        ) {
          setLastEraReward(
            chainAmountToHuman(resJson.data.lastEraReward, TokenSymbol.ETH)
          );
        } else {
          setLastEraReward(
            chainAmountToHuman(
              resJson.data.lastEraReward,
              getTokenSymbol(tokenName)
            )
          );
        }
      }
    } finally {
    }
  }, [tokenName, userAddress, tokenStandard]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return lastEraReward;
}
