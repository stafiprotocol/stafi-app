import { BubblesLoading } from "components/common/BubblesLoading";
import { useStakeFees } from "hooks/useStakeFees";
import { useTokenPrice } from "hooks/useTokenPrice";
import { useTokenStandard } from "hooks/useTokenStandard";
import { TokenName, TokenStandard } from "interfaces/common";
import {
  usePopupState,
  bindHover,
  bindPopover,
} from "material-ui-popup-state/hooks";
import HoverPopover from "material-ui-popup-state/HoverPopover";
import { useMemo } from "react";
import { isEmptyValue } from "utils/common";
import { formatNumber } from "utils/number";

interface StakeFeeProps {
  tokenName: TokenName;
}

export const StakeFee = (props: StakeFeeProps) => {
  const { tokenName } = props;
  const tokenStandard = useTokenStandard(tokenName);

  const { sendFee, txFee, bridgeFee } = useStakeFees(
    tokenName,
    tokenStandard || TokenStandard.Native
  );

  const commonTxCostPopupState = usePopupState({
    variant: "popover",
    popupId: "commonTxCost",
  });

  const fisPrice = useTokenPrice("FIS");
  const tokenPrice = useTokenPrice(tokenName);

  const txCostTotalValue = useMemo(() => {
    if (isNaN(Number(fisPrice)) || isNaN(Number(tokenPrice))) {
      return undefined;
    }

    if (
      isNaN(Number(txFee)) ||
      isNaN(Number(bridgeFee)) ||
      isNaN(Number(sendFee))
    ) {
      return undefined;
    }

    return (
      Number(fisPrice) * Number(txFee) +
      Number(fisPrice) * Number(bridgeFee) +
      Number(tokenPrice) * Number(sendFee)
    );
  }, [fisPrice, tokenPrice, txFee, bridgeFee, sendFee]);

  const renderTotalCost = () => {
    return (
      <>
        <div>
          {formatNumber(sendFee?.amount)} {sendFee?.tokenName}
        </div>
        <div className="mx-[.06rem]">+</div>
        <div>
          {formatNumber(Number(txFee?.amount) + Number(bridgeFee?.amount))}{" "}
          {txFee?.tokenName}
        </div>
      </>
    );
  };

  return (
    <>
      <div
        className="mt-[.15rem] text-text1 text-[.24rem] flex cursor-pointer"
        {...bindHover(commonTxCostPopupState)}
      >
        {renderTotalCost()}
      </div>

      <HoverPopover
        {...bindPopover(commonTxCostPopupState)}
        transformOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        sx={{
          marginTop: ".1rem",
          "& .MuiPopover-paper": {
            background: "rgba(9, 15, 23, 0.25)",
            border: "1px solid #26494E",
            backdropFilter: "blur(.4rem)",
            borderRadius: ".16rem",
            padding: ".2rem",
          },
          "& .MuiTypography-root": {
            padding: "0px",
          },
        }}
      >
        <div className="text-text2">
          <div className="flex justify-between">
            <div>Send Fund</div>
            <div>
              {formatNumber(sendFee?.amount, { decimals: 6 })}{" "}
              {sendFee?.tokenName}
            </div>
          </div>
          <div className="flex justify-between mt-[.18rem]">
            <div>Bridge Fee</div>
            <div>{formatNumber(bridgeFee?.amount, { decimals: 6 })} FIS</div>
          </div>
          <div className="flex justify-between mt-[.18rem]">
            <div>FIS Tx Fee</div>
            <div>{formatNumber(txFee?.amount, { decimals: 6 })} FIS</div>
          </div>
          <div className="mt-[.28rem] h-[1px] bg-text3 mb-[.1rem]" />
          <div className="text-text1">
            <div className="mt-[.2rem] mb-[.1rem]">
              Overall Transaction Cost:
            </div>
            <div className="flex items-center">{renderTotalCost()}</div>
          </div>
          <div className="mt-[.18rem] text-right flex items-center justify-end">
            ~$
            {isNaN(Number(txCostTotalValue)) ? (
              <BubblesLoading />
            ) : (
              formatNumber(txCostTotalValue, { decimals: 4 })
            )}
          </div>
        </div>
      </HoverPopover>
    </>
  );
};
