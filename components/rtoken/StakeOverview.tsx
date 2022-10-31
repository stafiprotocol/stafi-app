import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { GradientText } from "components/common/GradientText";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { TokenName, TokenStandard } from "interfaces/common";
import Image from "next/image";
import rectangle from "public/rectangle_v.svg";
import { useState } from "react";
import { openLink } from "utils/common";
import { getChainIcon, getWhiteTokenIcon } from "utils/icon";
import { TokenStandardSelector } from "./TokenStandardSelector";

interface StakeOverviewProps {
  tokeName: TokenName;
  onClickStake: () => void;
}

export const StakeOverview = (props: StakeOverviewProps) => {
  const [selectedStandard, setSelectedStandard] = useState(
    TokenStandard.Native
  );

  return (
    <div>
      <div
        className="rounded-t-[.16rem] h-[3rem] flex items-center justify-between"
        style={{
          background:
            "linear-gradient(153.03deg, rgba(50, 220, 218, 0.282752) 2.46%, rgba(43, 122, 211, 0.270214) 86.13%)",
          backdropFilter: "blur(.7rem)",
        }}
      >
        <div className="flex items-center">
          <div className="h-[2.2rem] w-[1rem] relative">
            <Image src={rectangle} alt="rectangle" layout="fill" />
          </div>

          <div>
            <div className="flex items-center">
              <div className="h-[.72rem] w-[.72rem] relative">
                <Image
                  src={getWhiteTokenIcon(props.tokeName)}
                  alt="icon"
                  layout="fill"
                />
              </div>

              <GradientText size=".72rem" ml=".24rem">
                r{props.tokeName}
              </GradientText>
            </div>

            <div className="text-text1 text-[.24rem] mt-[.4rem]">
              Stake {props.tokeName} and receive r{props.tokeName} in return
            </div>
          </div>
        </div>
        <div className="flex items-end mr-[.7rem]">
          <div className="w-[.8rem] h-[1.3rem] relative">
            <Image
              src={getChainIcon(props.tokeName)}
              alt="chain"
              layout="fill"
            />
          </div>

          <div className="ml-[.24rem] w-[.33rem] h-[.53rem] relative">
            <Image
              src={getChainIcon(props.tokeName)}
              alt="chain"
              layout="fill"
            />
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-[-.16rem]">
        <Card background="#0A131B">
          <div className="px-[.56rem]">
            <div className="flex items-center justify-between mt-[.46rem]">
              <div className="flex items-center">
                <div className="text-text1 text-[.24rem] mr-[.26rem]">
                  Current Token Standard
                </div>
                <TokenStandardSelector
                  selectedStandard={selectedStandard}
                  onSelect={setSelectedStandard}
                />{" "}
              </div>

              <div
                className="flex items-center cursor-pointer"
                onClick={() => {
                  openLink("https://www.google.com");
                }}
              >
                <div className="text-text1 text-[.24rem] mr-[.12rem]">
                  rETH Dashboard
                </div>

                <Icomoon icon="arrow-right" color="#9DAFBE" size=".25rem" />
              </div>
            </div>

            <div className="mt-[.6rem] flex">
              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip title="Staked Value" text="Staked Value" />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  $ 293,923
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  2837.4 ETH
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    title="Total rETH Rewards"
                    text="Total rETH Rewards"
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">
                  $ 1827.19
                </div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  23.2 ETH
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="text-text2 text-[.24rem] flex items-center">
                  <MyTooltip
                    title="Current Exchange Rate"
                    text="Current Exchange Rate"
                  />
                </div>

                <div className="mt-[.23rem] text-white text-[.32rem]">1.46</div>

                <div className="mt-[.16rem] text-text2 text-[.24rem]">
                  rETH/ETH
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-[.8rem] mb-[.86rem]">
              <Button
                height=".86rem"
                width="4rem"
                radius=".5rem"
                fontSize=".24rem"
                onClick={props.onClickStake}
              >
                Stake
              </Button>
              <Button
                height=".86rem"
                width="4rem"
                radius=".5rem"
                fontSize=".24rem"
              >
                Trade
              </Button>
              <Button
                height=".86rem"
                width="4rem"
                stroke
                radius=".5rem"
                fontSize=".24rem"
              >
                Redeem
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
