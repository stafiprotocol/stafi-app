import { TokenName, TokenStandard } from "interfaces/common";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getSupportedTokenStandards } from "utils/rToken";

export function useTokenStandard(tokenName: TokenName) {
  const router = useRouter();
  const [selectedStandard, setSelectedStandard] = useState<
    TokenStandard | undefined
  >(undefined);

  useEffect(() => {
    try {
      if (!router.isReady || !tokenName) {
        return;
      }
      const tokenStandardQuery = router.query.tokenStandard;
      const supportedStandards = getSupportedTokenStandards(tokenName);
      let res;
      if (tokenStandardQuery) {
        if (
          supportedStandards.indexOf(tokenStandardQuery as TokenStandard) >= 0
        ) {
          res = tokenStandardQuery;
        }
      }
      if (!res) {
        router.replace({
          pathname: router.pathname,
          query: {
            ...router.query,
            tokenStandard: supportedStandards[0],
          },
        });
      } else {
        setSelectedStandard(res as TokenStandard);
      }
    } catch (err: unknown) {}
  }, [router, tokenName]);

  return selectedStandard;
}
