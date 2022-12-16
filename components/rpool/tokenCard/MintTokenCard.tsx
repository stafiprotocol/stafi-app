import { Button } from "components/common/button";
import Image from "next/image";
import ethLogo from "public/eth_type_black.svg";
import maticLogo from "public/matic_type_black.svg";
import maticChainLogo from "public/matic_logo_black.svg";
import { RTokenName } from "interfaces/common";
import { MyTooltip } from "components/common/MyTooltip";
import { formatNumber } from "utils/number";

interface Props {
  rTokenName: RTokenName;
}

const MintTokenCard = (props: Props) => {
  const getRTokenLogo = (rTokenName: RTokenName) => {
    if (rTokenName === RTokenName.rMATIC) return maticLogo;
    if (rTokenName === RTokenName.rETH) return ethLogo;
    return ethLogo;
  };

  return (
    <div
      className="py-[0] px-[.24rem] h-[4.98rem] w-[3.35rem] rounded-[.16rem] bg-[#1a283533] hover:bg-[#58779826]"
      style={{
        border: "1px solid #1a2835",
        backdropFilter: "blur(0.67rem)",
      }}
    >
      <div className="mt-[.36rem] flex items-center justify-between relative">
        <div className="w-[.76rem] h-[.76rem] relative">
          <Image
            src={getRTokenLogo(props.rTokenName)}
            layout="fill"
            alt="logo"
          />
        </div>

        <div
          className="w-[.38rem] h-[.38rem] absolute left-[.55rem] bottom-[.07rem] rounded-full z-10 p-[.04rem] hidden"
          style={{
            background: "rgba(25, 38, 52, 0.4)",
            border: "1px solid #1A2835",
            backdropFilter: "blur(.13rem)",
          }}
        >
          <div className="w-full h-full relative">
            <Image
              src={getRTokenLogo(props.rTokenName)}
              layout="fill"
              alt="circulate"
            />
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="mt-[.1rem] text-text1 text-[.12rem]">StaFi</div>
          <div className="mt-[.12rem] text-[#FFA540] font-[700] text-[.36rem]">
            {props.rTokenName}
          </div>
        </div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="APR"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text1 font-[700] text-[.28rem]">6.95%</div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Reward"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="flex">
          <div className="text-[.12rem] text-text2 border-[1px] border-[#1A2835] rounded-[.02rem] py-[.02rem] px-[.06rem] mr-[.07rem]">
            FIS
          </div>
          <div className="text-text1 text-[.16rem]">
            {formatNumber(16937.59, { decimals: 2 })}
          </div>
        </div>
      </div>

      <div className="mt-[.2rem] flex items-end justify-between">
        <div className="flex items-center">
          <MyTooltip
            text="Minted Value"
            title="Moving average of APR for 7 days period"
            className="text-text2 text-[.16rem]"
          />
        </div>
        <div className="text-text1 text-[.16rem]">
          ${formatNumber(372828.93, { decimals: 2 })}
        </div>
      </div>

      <div className="text-[#00F3AB] text-[.16rem] text-center mt-[.24rem] leading-[.18rem]">
        145d 16h left
      </div>

      <Button mt="0.15rem" height="0.65rem" fontSize="0.24rem">
        Mint
      </Button>

      <div
        className="h-[.65rem] rounded-[.45rem] w-[2.87rem] text-text1 text-[.24rem] flex items-center justify-center cursor-pointer mt-[.24rem]"
        style={{
          border: "1px solid rgba(91, 104, 114, 0.5)",
        }}
        onClick={() => {}}
      >
        Claim
      </div>
    </div>
  );
};

export default MintTokenCard;
