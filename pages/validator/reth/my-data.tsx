import classNames from "classnames";
import { CollapseCard } from "components/common/CollapseCard";
import { MyTooltip } from "components/common/MyTooltip";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { ValidatorTokenStakeLayout } from "components/layout/layout_validator_token_stake";
import { MyReward } from "components/reth/my-data/MyReward";
import { PublicKeyList } from "components/reth/my-data/PublicKeyList";
import { useEthMyData } from "hooks/useEthMyData";
import Image from "next/image";
import warningIcon from "public/icon_warning.svg";
import React, { ReactElement, useEffect, useState } from "react";
import { formatNumber } from "utils/number";
import {
  getStorage,
  STORAGE_KEY_HIDE_SLASH_TIP,
  STORAGE_KEY_HIDE_CONFIGURE_FEE_RECIPIENT_TIP,
} from "utils/storage";

const MyData = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);
  const [showFeeWarning, setShowWarning] = useState(false);
  const [showSlashWarning, setShowSlashWarning] = useState(false);

  const {
    requestStatus,
    selfDepositedEth,
    selfDepositedEthValue,
    selfRewardEth,
    selfRewardEthValue,
    totalManagedEth,
    totalManagedEthValue,
  } = useEthMyData();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "My Data" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    const temp1 = getStorage(STORAGE_KEY_HIDE_CONFIGURE_FEE_RECIPIENT_TIP);
    setShowWarning(!temp1);
    const temp2 = getStorage(STORAGE_KEY_HIDE_SLASH_TIP);
    setShowSlashWarning(!temp2);
  }, []);

  return (
    <div>
      <div
        className={classNames(
          "px-[.56rem] py-[.32rem] bg-[#0095EB1A] relative",
          {
            hidden: !showFeeWarning,
          }
        )}
      >
        <div className="absolute right-[.12rem] top-[.12rem] cursor-pointer">
          <Icomoon icon="close" size=".22rem" />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="relative w-[.24rem] h-[.24rem] min-w-[.24rem]">
              <Image src={warningIcon} layout="fill" alt="warning" />
            </div>
            <div className="text-warning text-[.2rem] ml-[.12rem] leading-normal">
              Please configure your fee recipient as adress for each node,
              Otherwise you may be slashed by StaFi protocol.
            </div>
          </div>

          <a
            className="flex items-center cursor-pointer mr-[.3rem] shrink-0"
            href="#faqs"
          >
            <div className="text-warning text-[.24rem] mr-[.16rem]">
              Learn More
            </div>
            <Icomoon size=".26rem" icon="arrow-right" color="#0095EB" />
          </a>
        </div>
      </div>
      <div className="py-[.76rem] px-[.56rem] flex flex-col items-stretch">
        <div className="self-center text-[.42rem] text-white font-[700]">
          My Data
        </div>
        <CollapseCard
          background="rgba(26, 40, 53, 0.2)"
          mt=".75rem"
          title={<div className="text-white text-[.32rem]">Managed ETH</div>}
        >
          <div className="mt-[.4rem] mb-[.23rem] flex">
            <div className="flex-1 flex flex-col items-center">
              <div className="text-text2 text-[.24rem]">Self-deposited</div>

              <div className="mt-[.23rem] text-white text-[.32rem]">
                {formatNumber(selfDepositedEth)} ETH
              </div>

              <div className="mt-[.16rem] text-text2 text-[.24rem]">
                $ {formatNumber(selfDepositedEthValue, { decimals: 2 })}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="text-text2 text-[.24rem] flex items-center">
                <MyTooltip
                  title="Your self deposit + delegated ETH amount"
                  text="Total Managed ETH"
                />
              </div>

              <div className="mt-[.23rem] text-primary text-[.32rem]">
                {formatNumber(totalManagedEth)} ETH
              </div>

              <div className="mt-[.16rem] text-text2 text-[.24rem]">
                $ {formatNumber(totalManagedEthValue, { decimals: 2 })}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <div className="text-text2 text-[.24rem] flex items-center">
                <MyTooltip title="Rewards for validator" text="My Reward" />
              </div>

              <div className="mt-[.23rem] text-primary text-[.32rem]">
                {formatNumber(selfRewardEth)} ETH
              </div>

              <div className="mt-[.16rem] text-text2 text-[.24rem]">
                $ {formatNumber(selfRewardEthValue, { decimals: 2 })}
              </div>
            </div>
          </div>
        </CollapseCard>
        <PublicKeyList />
        <MyReward />
      </div>
    </div>
  );
};

MyData.getLayout = (page: ReactElement) => {
  return (
    <ValidatorLayout>
      <ValidatorTokenStakeLayout>{page}</ValidatorTokenStakeLayout>
    </ValidatorLayout>
  );
};

export default MyData;
