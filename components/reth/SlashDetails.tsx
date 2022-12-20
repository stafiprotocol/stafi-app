import { CollapseCard } from "components/common/CollapseCard";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import { useEthPubkeySlashDetail } from "hooks/useEthPubkeySlashDetail";
import Link from "next/link";
import { useState } from "react";
import { SlashDetailsItem } from "./SlashDetailsItem";

interface SlashDetailsProps {
  pubkey: string;
}

export const SlashDetails = (props: SlashDetailsProps) => {
  const [page, setPage] = useState(1);
  const { totalCount, slashEventList } = useEthPubkeySlashDetail(
    props.pubkey,
    page
  );

  return (
    <CollapseCard
      background="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={
        <MyTooltip
          className="text-white text-[.32rem]"
          text="Slash Details"
          title="Slash Details"
        />
      }
    >
      <div>
        <div className="min-h-[2rem]">
          {Number(totalCount) > 0 && (
            <div
              className="mb-[.32rem] grid"
              style={{ height: "auto", gridTemplateColumns: "20% 20% 20% 40%" }}
            >
              <div className="flex justify-center">
                <MyTooltip
                  className="text-text2 text-[.2rem]"
                  text="Time"
                  title="xxx"
                />
              </div>
              <div className="flex justify-center">
                <MyTooltip
                  className="text-text2 text-[.2rem]"
                  text="Block"
                  title="xxx"
                />
              </div>
              <div className="flex justify-center">
                <MyTooltip
                  className="text-text2 text-[.2rem]"
                  text="Slashed ETH"
                  title="xxx"
                />
              </div>
              <div className="pl-[.2rem] flex justify-start">
                <MyTooltip
                  className="text-text2 text-[.2rem]"
                  text="Detail"
                  title="xxx"
                />
              </div>
            </div>
          )}

          {slashEventList.map((item, index) => (
            <SlashDetailsItem key={index} index={index} slashEvent={item} />
          ))}

          {!totalCount && (
            <div className="flex flex-col items-center">
              <Link href="/validator/reth/choose-validator">
                <div className="flex flex-col items-center cursor-pointer">
                  <EmptyContent mt="0.2rem" size=".8rem" hideText />
                  <div className="mt-[.3rem] flex items-center">
                    <div className="text-text1 text-[.24rem] mr-[.1rem]">
                      Make a deposit
                    </div>
                    <Icomoon icon="arrow-right" color="#9DAFBE" size=".26rem" />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {Number(totalCount) > 0 && (
          <div className="mt-[.36rem] flex justify-center">
            <CustomPagination
              totalCount={Number(totalCount)}
              page={1}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </CollapseCard>
  );
};
