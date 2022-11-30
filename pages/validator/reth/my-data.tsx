import { CollapseCard } from "components/common/CollapseCard";
import { MyTooltip } from "components/common/MyTooltip";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { ValidatorTokenStakeLayout } from "components/layout/layout_validator_token_stake";
import { MyReward } from "components/reth/my-data/MyReward";
import { PublicKeyList } from "components/reth/my-data/PublicKeyList";
import { useEthMyData } from "hooks/useEthMyData";
import React, { ReactElement, useEffect } from "react";
import { formatNumber } from "utils/number";

const MyData = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);

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

  return (
    <div className="py-[.76rem] px-[.55rem] flex flex-col items-stretch">
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
