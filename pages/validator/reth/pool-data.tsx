import { CollapseCard } from "components/common/CollapseCard";
import { Icomoon } from "components/icon/Icomoon";
import { MyLayoutContext } from "components/layout/layout";
import { ValidatorLayout } from "components/layout/layout_validator";
import { ValidatorTokenStakeLayout } from "components/layout/layout_validator_token_stake";
import { MyTooltip } from "components/common/MyTooltip";
import { useEthPoolData } from "hooks/useEthPoolData";
import Link from "next/link";
import React, { ReactElement, useEffect } from "react";
import styles from "styles/reth/PoolData.module.scss";
import { formatNumber } from "utils/number";

const PoolData = () => {
  const { setNavigation } = React.useContext(MyLayoutContext);

  const {
    requestStatus,
    depositedEth,
    depositedEthValue,
    mintedREth,
    mintedREthValue,
    stakedEth,
    poolEth,
    unmatchedEth,
    matchedValidators,
    stakeApr,
    validatorApr,
  } = useEthPoolData();

  useEffect(() => {
    setNavigation([
      // { name: "rToken List", path: "/rtoken" },
      { name: "Pool Data" },
    ]);
  }, [setNavigation]);

  return (
    <div className="py-[.76rem] px-[.55rem] flex flex-col items-stretch">
      <div className="self-center text-[.42rem] text-white font-[700]">
        Pool Overall Data
      </div>

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".75rem"
        title={<div className="text-white text-[.32rem]">Token Overview</div>}
      >
        <div className="mt-[.4rem] mb-[.23rem] flex">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem]">Deposited ETH</div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(depositedEth)} ETH
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              $ {formatNumber(depositedEthValue, { decimals: 2 })}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip title="Overall rETH generated" text="Minted rETH" />
            </div>

            <div className="mt-[.23rem] text-primary text-[.32rem]">
              {formatNumber(mintedREth)} rETH
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              $ {formatNumber(mintedREthValue, { decimals: 2 })}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                title="Overall ETH staked, including restake ETH"
                text="Total ETH Staked"
              />
            </div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(stakedEth)} ETH
            </div>
          </div>
        </div>
      </CollapseCard>

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="flex items-center">
            <div className="text-white text-[.32rem]">Pool Status</div>

            <Link href="/validator/reth/my-data">
              <div className={styles["my-pool"]}>
                <div>My Pool</div>
                <Icomoon icon="right" size="0.19rem" color="#00F3AB" />
              </div>
            </Link>
          </div>
        }
      >
        <div className="mt-[.4rem] mb-[.23rem] flex">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem]">Pool ETH</div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(poolEth)}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                title="The amount of ETH that is not being matched or staked"
                text="Unmatched ETH"
              />
            </div>

            <div className="mt-[.23rem] text-primary text-[.32rem]">
              {formatNumber(unmatchedEth)} ETH
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              32 ETH needed each pool
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                title="StaFi registered validators overall amount"
                text="Matched Validators"
              />
            </div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(matchedValidators)}
            </div>
          </div>
        </div>
      </CollapseCard>

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">APR</div>}
      >
        <div className="mt-[.4rem] mb-[.23rem] flex">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                title="Moving average of APR for 7 days period"
                text="Staker APR"
              />
            </div>

            <div className="mt-[.23rem] text-primary text-[.32rem]">
              {formatNumber(stakeApr, { decimals: 2 })}%
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              Estimated
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <MyTooltip
                text="Validator APR"
                title="Validator APR: current network OV(s) annualized rewards. APR is denominated in terms of rETH, not USD and is not a guaranteed or promised return or profit"
              />
            </div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(validatorApr, { decimals: 2 })}%
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              Estimated
            </div>
          </div>
        </div>
      </CollapseCard>
    </div>
  );
};

PoolData.getLayout = (page: ReactElement) => {
  return (
    <ValidatorLayout>
      <ValidatorTokenStakeLayout>{page}</ValidatorTokenStakeLayout>
    </ValidatorLayout>
  );
};

export default PoolData;
