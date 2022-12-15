import { MyLayoutContext } from "components/layout/layout";
import { useRouter } from "next/router";
import { useContext, useEffect, useMemo } from "react";
import classNames from "classnames";
import Image from "next/image";
import { openLink } from "utils/common";
import rightArrowIcon from "public/icon_arrow_right_yellow.svg";
import rectangle from "public/rectangle_v_yellow.svg";
import rTokenImage from "public/rpool_mint.svg";
import rPoolGift from "public/rpool_gift.svg";

export enum ProgramTab {
  Mint = "mint",
  LP = "lp",
}

const RPoolPage = () => {
  const router = useRouter();

  const { setNavigation } = useContext(MyLayoutContext);

  const switchProgramTab = (tab: ProgramTab) => {
    const currentTab = router.query.program;
    if (tab === currentTab) return;

    router.replace({
      pathname: router.pathname,
      query: {
        ...router.query,
        program: tab,
      },
    });
  };

  useEffect(() => {
    const programTabQuery = router.query.program;
    if (!programTabQuery) {
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          program: ProgramTab.Mint,
        },
      });
    }
  }, [router]);

  useEffect(() => {
    setNavigation([{ name: "rPool Mint", path: "/rpool" }]);
  }, [setNavigation]);

  return (
    <div>
      <div
        className="flex justify-center text-[.24rem] mb-[.32rem] h-[.28rem] items-center"
        style={{
          backdropFilter: "blur(.7rem)",
        }}
      >
        <ProgramTabItem
          programTab={ProgramTab.Mint}
          onClick={() => switchProgramTab(ProgramTab.Mint)}
          routerQuery={router.query.program}
        />
        <ProgramTabItem
          programTab={ProgramTab.LP}
          onClick={() => switchProgramTab(ProgramTab.LP)}
          routerQuery={router.query.program}
        />
      </div>

      <div
        className="rounded-t-[.16rem] h-[3rem] flex items-center justify-between relative"
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
            openLink("https://www.stafi.io/rtoken/");
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
    </div>
  );
};

interface ProgramTabItemProps {
  programTab: ProgramTab;
  onClick: () => void;
  routerQuery: string | string[] | undefined;
}

const ProgramTabItem = (props: ProgramTabItemProps) => {
  const isActive = useMemo(() => {
    return props.routerQuery === props.programTab;
  }, [props.programTab, props.routerQuery]);

  return (
    <div
      className="cursor-pointer mx-[.16rem] h-[.28rem] leading-[.28rem]"
      style={{
        color: isActive ? "#FFFFFF" : "#9DAFBE",
        fontWeight: isActive ? 700 : 400,
      }}
      onClick={props.onClick}
    >
      {props.programTab === ProgramTab.Mint ? "Mint" : "LP"} Program
    </div>
  );
};

export default RPoolPage;
