import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { GradientText } from "components/common/GradientText";
import { MyTooltip } from "components/common/MyTooltip";
import { DexType, TokenStandard } from "interfaces/common";
import Image from "next/image";
import recommendImage from "public/recommend.svg";
import { openLink } from "utils/common";
import { getDexIcon } from "utils/rToken";

interface TradeDexCardItemProps {
  type: DexType;
  tokenStandard: TokenStandard;
  url: string;
}

export const TradeDexCardItem = (props: TradeDexCardItemProps) => {
  const { type } = props;

  return (
    <Card
      background="rgba(26, 40, 53, 0.2)"
      borderColor="#1A2835"
      className="w-[3.35rem] relative flex flex-col items-center"
    >
      {props.type === "rDEX" && (
        <div className="w-[1.59rem] h-[.91rem] absolute right-[-1.5px] top-[-1px]">
          <Image src={recommendImage} layout="fill" alt="permissionless" />
        </div>
      )}

      <div className="bg-[#171717] border-[1px] border-solid border-border1 w-[.76rem] h-[.76rem] rounded-full mt-[.24rem] p-[.15rem]">
        <div className="w-full h-full relative">
          <Image alt="icon" layout="fill" src={getDexIcon(type)} />
        </div>
      </div>

      <GradientText size=".4rem" className="mt-[.24rem]">
        {props.type}
      </GradientText>

      <div className="mx-[.24rem] mt-[.4rem] self-stretch flex items-center justify-between">
        <MyTooltip
          text="Token Standard"
          title="The native token standard for DEX platform"
          className="text-[.16rem] text-text2"
        />

        <div className="text-[.16rem] text-text1">{props.tokenStandard}</div>
      </div>

      <Button
        secondary={props.type !== "rDEX"}
        mt=".47rem"
        height=".65rem"
        fontSize=".24rem"
        className="mx-[.24rem] mt-[.47rem] mb-[.32rem] self-stretch"
        onClick={() => openLink(props.url)}
      >
        Trade
      </Button>
    </Card>
  );
};
