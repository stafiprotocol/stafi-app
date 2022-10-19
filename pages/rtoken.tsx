import { MyLayoutContext } from "components/layout";
import { RTokenAllStakeCard } from "components/rtoken/RTokenAllStakeCard";
import Image from "next/image";
import leftArrowIcon from "public/icon_arrow_left.png";
import rectangle from "public/rectangle1.svg";
import rTokenImage from "public/rToken.svg";
import React, { useEffect } from "react";
import styles from "../styles/rTokenPage.module.scss";

const RTokenPage = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);

  useEffect(() => {
    setNavigation([{ name: "rToken List" }]);
  }, [setNavigation]);

  return (
    <div>
      <div className={styles["head-banner"]}>
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

        <div className="flex items-center self-end mr-[.56rem] mb-[.65rem] cursor-pointer">
          <div className="text-primary text-[.24rem] mr-[.18rem]">
            Learn More
          </div>
          <div className="w-[.27rem] h-[.18rem] relative rotate-180">
            <Image src={leftArrowIcon} layout="fill" alt="back" />
          </div>
        </div>
      </div>

      <div className="mt-[.56rem] text-white text-[.32rem]">All Stakes</div>

      <div className="mt-[.35rem]">
        <RTokenAllStakeCard />
      </div>
    </div>
  );
};

export default RTokenPage;
