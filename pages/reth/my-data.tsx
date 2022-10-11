import classNames from "classnames";
import { CollapseCard } from "components/CollapseCard";
import { Icomoon } from "components/Icomoon";
import { RethLayout } from "components/layout_reth";
import { MyReward } from "components/reth/my-data/MyReward";
import { PublicKeyList } from "components/reth/my-data/PublicKeyList";
import { useEthMyData } from "hooks/useEthMyData";
import { ReactElement } from "react";
import { formatNumber } from "utils/number";
import { RethStakeLayout } from "../../components/layout_reth_stake";
import styles from "../../styles/reth/MyData.module.scss";

const MyData = () => {
  const {
    requestStatus,
    selfDepositedEth,
    selfDepositedEthValue,
    selfRewardEth,
    selfRewardEthValue,
    totalManagedEth,
    totalManagedEthValue,
  } = useEthMyData();

  return (
    <div className="py-[.76rem] px-[.55rem] flex flex-col items-stretch">
      <div className="self-center text-[.42rem] text-white font-[700]">
        My Data
      </div>

      <CollapseCard
        backgroundColor="rgba(26, 40, 53, 0.2)"
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
              <div className="mr-[.14rem]">Total Managed ETH</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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
              <div className="mr-[.14rem]">My Reward</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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
    <RethLayout>
      <RethStakeLayout>{page}</RethStakeLayout>
    </RethLayout>
  );
};

export default MyData;
