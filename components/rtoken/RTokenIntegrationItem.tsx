import { Card } from "components/common/card";
import { GradientText } from "components/common/GradientText";
import Image from "next/image";
import commonStyles from "styles/Common.module.scss";
import { openLink } from "utils/common";

export interface IntegrationItem {
  icon: any;
  title: string;
  desc: string;
  url: string;
}

export const RTokenIntegrationItem = (props: { data: IntegrationItem }) => {
  const { data } = props;

  return (
    <div className="mx-[.24rem] w-[3.35rem] min-w-[3.35rem]">
      <div className="w-[.76rem] h-[.76rem] relative bg-[#171717] mx-auto z-10 rounded-full p-[.15rem]">
        <div className="w-full h-full relative">
          <Image alt="icon" layout="fill" src={data.icon} />
        </div>
      </div>

      <Card
        mt="-0.38rem"
        background="rgba(88, 119, 152, 0.15)"
        borderColor="#0F151B"
        className="h-[2.8rem] flex flex-col items-center"
      >
        <GradientText size=".32rem" className="mt-[.64rem]">
          {data.title}
        </GradientText>

        <div className="text-[.16rem] text-text2 mt-[.32rem]">{data.desc}</div>

        <div
          className="cursor-pointer mt-[.36rem] self-stretch mx-[.36rem] rounded-full h-[.65rem] flex items-center justify-center text-white text-[.24rem]"
          style={{
            background:
              "linear-gradient(0deg, #090F17 40.28%, #082C2B 166.52%, #083330 214.39%)",
            border: "1px solid rgba(56, 67, 79, 0.5)",
            backdropFilter: "blur(.4rem)",
          }}
          onClick={() => openLink(data.url)}
        >
          Detail
        </div>
      </Card>
    </div>
  );
};
