import { CollapseCard } from "components/common/CollapseCard";
import { EmptyContent } from "components/common/EmptyContent";
import { MyTooltip } from "components/common/MyTooltip";
import { CustomPagination } from "components/common/pagination";
import { Icomoon } from "components/icon/Icomoon";
import Link from "next/link";
import { useState } from "react";
import { SlashDetailsItem } from "./SlashDetailsItem";

export const SlashDetails = () => {
  const totalCount = 1;
  const list = [1, 2];
  const [page, setPage] = useState(1);

  return (
    <CollapseCard
      background="rgba(26, 40, 53, 0.2)"
      mt=".36rem"
      title={
        <MyTooltip
          className="text-white text-[.32rem]"
          text="Slash Details"
          title="xxxxx"
        />
      }
    >
      <div>
        <div className="min-h-[2rem]">
          {totalCount > 0 && (
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

          {list.map((item, index) => (
            <SlashDetailsItem key={index} index={index} />
          ))}

          {totalCount === 0 && (
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

        {totalCount > 0 && (
          <div className="mt-[.36rem] flex justify-center">
            <CustomPagination
              totalCount={totalCount}
              page={1}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </CollapseCard>
  );
};
