import Image from "next/image";
import { openLink } from "utils/common";
import rightArrowIcon from "public/icon_arrow_right_yellow.svg";
import rectangle from "public/rectangle_v_yellow.svg";
import rTokenImage from "public/rpool_mint.svg";
import rPoolGift from "public/rpool_gift.svg";
import { ProgramTab } from "pages/rpool";

interface Props {
  // programTab: ProgramTab;
}

const RPoolBanner = (props: Props) => {
  return (
    <div
      className="rounded-[.16rem] h-[3rem] flex items-center justify-between relative mt-[.24rem] border-[1px] border-[#1A2835]"
      style={{
        background: "rgba(23, 38, 54, 0.15)",
        backdropFilter: "blur(.7rem)",
      }}
    >
      <div className="self-center relative w-[1.2rem] h-[2.8rem] mt-[-.24rem]">
        <Image src={rectangle} layout="fill" alt="rectangle" />
      </div>
      <div className="flex-1 mt-[-.6rem] ml-[-.1rem]">
        <div className="mt-[.4rem] self-center relative w-[4.8rem] h-[2rem]">
          <Image src={rTokenImage} layout="fill" alt="rectangle" />
        </div>
        <div className="text-text1 text-[.32rem] ml-[.7rem] mt-[-0.4rem] self-stretch">
          Take part in rPool programs, earn tokens easily.
        </div>
      </div>
      <div className="absolute top-[.44rem] left-[6.2rem]">
        <div className="self-center relative w-[1.6rem] h-[1.6rem]">
          <Image src={rPoolGift} layout="fill" alt="gift" />
        </div>
      </div>

      <div
        className="flex items-center self-end mr-[.56rem] mb-[.65rem] cursor-pointer"
        onClick={() => {
          openLink("https://docs.stafi.io/rtoken-app/rpool/the-guide-for-mint-program");
        }}
      >
        <div className="text-[#FFA540] text-[.24rem] mr-[.18rem]">
          Learn More
        </div>
        <div className="w-[.27rem] h-[.18rem] relative">
          <Image src={rightArrowIcon} layout="fill" alt="back" />
        </div>
      </div>
    </div>
  );
};

export default RPoolBanner;
