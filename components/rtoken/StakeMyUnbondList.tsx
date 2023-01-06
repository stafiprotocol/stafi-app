import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { TableSkeleton } from "components/common/TableSkeleton";
import { Icomoon } from "components/icon/Icomoon";
import { UnbondModel, useRTokenUnbond } from "hooks/useRTokenUnbond";
import { TokenName } from "interfaces/common";
import { useState } from "react";
import numberUtil from "utils/numberUtil";
import { getShortAddress } from "utils/string";
import classNames from "classnames";
import { openLink } from "utils/common";
import {
  getDotScanTxUrl,
  getEtherScanTxUrl,
  getKsmScanTxUrl,
  getStafiScanTxUrl,
} from "config/explorer";
import { Tooltip } from "@mui/material";
import { formatNumber } from "utils/number";
import dayjs from "dayjs";
import { getRedeemDaysLeft } from "utils/rToken";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

interface Props {
  tokenName: TokenName;
}

export const StakeMyUnbondList = (props: Props) => {
  const [page, setPage] = useState(1);
  const { unbondList, totalCount } = useRTokenUnbond(props.tokenName, page);

  return (
    <div className="mt-[.56rem] min-h-[2rem]">
      {!!unbondList && totalCount > 0 && (
        <div
          className="grid"
          style={{ height: "auto", gridTemplateColumns: "20% 20% 20% 20% 20%" }}
        >
          <div className="flex justify-center">
            <MyTooltip
              text="Receiving Amount"
              title="Following are the the actual Token amount that you could get after unstaking transaction. The correlated rToken amount that you choose to unstake will reveal when hovered."
              className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Unstaked Time"
              title="The UTC time that you initiated the unstaking transaction."
              className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Time Left"
              title="Remaining time required to complete unstaking transaction; Due to the complexity of the cross-chain transaction, the actual unstaking success time may fluctuate to some degree."
              className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              title={`The address that receives redeemed ${
                props.tokenName
              } tokens, ${
                props.tokenName
              } tokens will be sent to the receiving address after receiving the request of redemption around ${getRedeemDaysLeft(
                props.tokenName
              )} days`}
              text="Receiving Address"
              className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Status"
              title="Current unstaking transaction status."
              className="text-text2"
            />
          </div>
        </div>
      )}

      {unbondList?.map((item: UnbondModel, index) => (
        <div
          key={index}
          className="grid h-[1.1rem]"
          style={{
            gridTemplateColumns: "20% 20% 20% 20% 20%",
            background:
              index % 2 === 0 ? "transparent" : "rgba(26, 40, 53, 0.3)",
          }}
        >
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            <Tooltip
              title={`${formatNumber(item.formatRTokenAmount, {
                decimals: 3,
              })} r${props.tokenName} Unstaked`}
            >
              <span>
                {item.formatTokenAmount === "--"
                  ? "--"
                  : Number(item.formatTokenAmount) > 0 &&
                    Number(item.formatTokenAmount) < 0.001
                  ? "<0.001"
                  : formatNumber(item.formatTokenAmount)}{" "}
                {props.tokenName}
              </span>
            </Tooltip>
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {item.txTimestamp
              ? dayjs(item.txTimestamp * 1000)
                  .utc()
                  .format("YYYY-MM-DD HH:mm:ss")
              : "--"}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {item.formatLeftTime}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {getShortAddress(item.formatReceiveAddress, 4)}
          </div>
          <div
            className={classNames(
              "flex justify-center items-center text-[.24rem] cursor-pointer",
              item.receivedStatus === 1
                ? "text-text1"
                : item.receivedStatus === 2
                ? "text-[#FF7040]"
                : "text-primary"
            )}
            onClick={() => {
              if (!item.txHash) return;
              if (props.tokenName === TokenName.MATIC) {
                if (item.receivedStatus !== 1) return;
                openLink(getStafiScanTxUrl(item.txHash));
              } else if (props.tokenName === TokenName.ETH) {
                openLink(getEtherScanTxUrl(item.txHash));
              } else if (props.tokenName === TokenName.KSM) {
                openLink(getStafiScanTxUrl(item.txHash));
              } else if (props.tokenName === TokenName.DOT) {
                openLink(getStafiScanTxUrl(item.txHash));
              } else if (props.tokenName === TokenName.BNB) {
								openLink(getStafiScanTxUrl(item.txHash));
							}
            }}
          >
            {item.receivedStatus === 1
              ? "Waiting"
              : item.receivedStatus === 2
              ? "Unstaking"
              : "Unstaked"}
            {item.receivedStatus === 1 && (
              <span className="pl-[.1rem]">
                <Icomoon icon="right" size="0.2rem" color="#9DAFBE" />
              </span>
            )}
          </div>
        </div>
      ))}

      {!!unbondList && totalCount > 0 && (
        <div className="mt-[.36rem] flex justify-center">
          <CustomPagination
            totalCount={totalCount}
            page={page}
            onChange={setPage}
          />
        </div>
      )}

      {!!unbondList && totalCount === 0 && (
        <div className="flex flex-col items-center pb-[.3rem]">
          <div className="flex flex-col items-center">
            <EmptyContent mt="0.2rem" size=".8rem" />
            {/* <div className="mt-[.3rem] flex items-center">
              <div className="text-text1 text-[.24rem] mr-[.1rem]">
                Make a stake
              </div>
              <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
            </div> */}
          </div>
        </div>
      )}

      {!unbondList && (
        <div className="px-[.56rem]">
          <TableSkeleton />
        </div>
      )}
    </div>
  );
};
