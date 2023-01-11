import classNames from "classnames";
import { BubblesLoading } from "components/common/BubblesLoading";
import { useFisBalance } from "hooks/useFisBalance";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { TokenName, TokenStandard } from "interfaces/common";
import { useMemo } from "react";
import { isEmptyValue } from "utils/common";
import { formatNumber } from "utils/number";

export const BridgeRTokenBalance = (props: {
  srcTokenStandard: TokenStandard | undefined;
  isFIS: boolean;
  tokenName: TokenName;
  className?: string;
}) => {
  const fisBalance = useFisBalance(props.srcTokenStandard);
  const rTokenBalance = useRTokenBalance(
    props.srcTokenStandard,
    props.tokenName,
    true
  );

  const balance = useMemo(() => {
    return props.isFIS ? fisBalance : rTokenBalance;
  }, [props.isFIS, fisBalance, rTokenBalance]);

  return (
    <div
      className={classNames(
        "text-text1 text-[.24rem]",
        props.className ? props.className : ""
      )}
    >
      {isEmptyValue(balance) ? <BubblesLoading /> : formatNumber(balance)}
    </div>
  );
};
