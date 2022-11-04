import { TokenName, TokenStandard } from "interfaces/common";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getSupportedTokenStandards } from "utils/rToken";

export function useSelectedTokenStandard(tokenName: TokenName) {
  const router = useRouter();
  const [selectedStandard, setSelectedStandard] = useState<
    TokenStandard | undefined
  >();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    const tokenStandardQuery = router.query.tokenStandard;
    let res;
    if (tokenStandardQuery) {
      if (
        getSupportedTokenStandards(tokenName).indexOf(
          tokenStandardQuery as TokenStandard
        ) >= 0
      ) {
        res = tokenStandardQuery;
      }
    }
    if (!res) {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          tokenStandard: TokenStandard.Native,
        },
      });
    } else {
      setSelectedStandard(res as TokenStandard);
    }
  }, [router, tokenName]);

  return selectedStandard;
}
