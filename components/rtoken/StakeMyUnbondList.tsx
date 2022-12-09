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
              text="Amount"
              title="Amount of the rToken that you choose to unstake"
							className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Total Period"
              title={`Total time required to complete unstaking transaction; After receiving the request of redemption, r${props.tokenName} contracts will automatically unstake and withdraw ${props.tokenName}s from the ${props.tokenName} staking contract deployed on Ethereum, then send the ${props.tokenName} tokens back to user after around 9 days`}
							className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Days Left"
              title="Remaining time required to complete unstaking transaction"
							className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              title={`The address that receives redeemed ${props.tokenName} tokens, ${props.tokenName} tokens will be sent to the receiving address after receiving the request of redemption around 9 days`}
              text="Receiving Address"
							className="text-text2"
            />
          </div>
          <div className="flex justify-center">
            <MyTooltip
              text="Status"
              title="Current unstake transaction status"
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
            {item.formatTokenAmount === "--"
              ? "--"
              : Number(item.formatTokenAmount) > 0 &&
                Number(item.formatTokenAmount) < 0.001
              ? "<0.001"
              : numberUtil.handleAmountFloorToFixed(item.formatTokenAmount, 3)}
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {item.lockTotalTimeInDays} D
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {item.lockLeftTimeInDays} D
          </div>
          <div className="flex justify-center items-center text-text1 text-[.24rem]">
            {getShortAddress(item.formatReceiveAddress, 4)}
          </div>
          <div className="flex justify-center items-center text-primary text-[.24rem]">
            {item.hasReceived ? "Unstaked" : "Waiting"}
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
