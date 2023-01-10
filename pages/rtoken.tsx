import { MyLayoutContext } from "components/layout/layout";
import { RTokenOverviewCard } from "components/rtoken/RTokenOverviewCard";
import { TokenName } from "interfaces/common";
import Image from "next/image";
import leftArrowIcon from "public/icon_arrow_left.png";
import rectangle from "public/rectangle_h.svg";
import rTokenImage from "public/rToken.svg";
import React, { useEffect } from "react";
import { openLink } from "utils/common";

const RTokenPage = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);

  useEffect(() => {
    setNavigation([{ name: "rToken List" }]);
  }, [setNavigation]);

  return (
    <div>
      <div
        // className={styles["head-banner"]}
        className="h-[2.68rem] rounded-[.16rem] flex"
        style={{
          background: "rgba(23, 38, 54, 0.2)",
          border: "1px solid #1a2835",
          backdropFilter: "blur(0.67rem)",
        }}
      >
        <div className="self-center relative w-[2.4rem] h-[.9rem] -rotate-90 ml-[-.75rem]">
          <Image src={rectangle} layout="fill" alt="rectangle" />
        </div>
        <div className="ml-[-.6rem] flex-1">
          <div className="mt-[.4rem] self-center relative w-[2.8rem] h-[1.77rem]">
            <Image src={rTokenImage} layout="fill" alt="rectangle" />
          </div>
          <div className="text-text1 text-[.32rem] ml-[.6rem] mt-[-0.4rem]">
            Stake tokens safely and easily in multiple networks.
          </div>
        </div>

        <div
          className="flex items-center self-end mr-[.56rem] mb-[.65rem] cursor-pointer"
          onClick={() => {
            openLink("https://www.stafi.io/rtoken/");
          }}
        >
          <div className="text-primary text-[.24rem] mr-[.18rem]">
            Learn More
          </div>
          <div className="w-[.27rem] h-[.18rem] relative rotate-180">
            <Image src={leftArrowIcon} layout="fill" alt="back" />
          </div>
        </div>
      </div>

      <div className="mt-[.56rem] text-white text-[.32rem]">All Stakes</div>

      <div
        className="mt-[.35rem] grid"
        style={{
          gridTemplateColumns: "repeat(4, 3.35rem)",
          justifyContent: "space-between",
          rowGap: ".5rem",
        }}
      >
        <RTokenOverviewCard tokenName={TokenName.ETH} />

        <RTokenOverviewCard tokenName={TokenName.MATIC} />

        <RTokenOverviewCard tokenName={TokenName.KSM} />

        <RTokenOverviewCard tokenName={TokenName.DOT} />

        <RTokenOverviewCard tokenName={TokenName.BNB} />

        <RTokenOverviewCard tokenName={TokenName.SOL} />
      </div>
    </div>
  );
};

export default RTokenPage;
