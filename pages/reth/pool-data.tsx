import classNames from "classnames";
import { Icomoon } from "components/Icomoon";
import { RethLayout } from "components/layout_reth";
import { useEthPoolData } from "hooks/useEthPoolData";
import type { ReactElement } from "react";
import { formatNumber } from "utils/number";
import { RethStakeLayout } from "../../components/layout_reth_stake";
import styles from "../../styles/reth/PoolData.module.scss";

const PoolData = () => {
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

  return (
    <div className="py-[.76rem] px-[.55rem] flex flex-col items-stretch">
      <div className="self-center text-[.42rem] text-white font-[700]">
        Pool Data
      </div>

      <div
        className={classNames(
          classNames(styles["card-container"], "mt-[.75rem]")
        )}
      >
        <div className="flex items-center justify-between mx-[.56rem]">
          <div className="text-white text-[.32rem]">Token Overview</div>

          <div className="rotate-90">
            <Icomoon icon="right" size="0.19rem" color="#ffffff" />
          </div>
        </div>

        <div className="mt-[.8rem] mb-[.23rem] flex">
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
              <div className="mr-[.14rem]">Minted rETH</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
            </div>

            <div className="mt-[.23rem] text-primary text-[.32rem]">
              {formatNumber(mintedREth)} ETH
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              $ {formatNumber(mintedREthValue, { decimals: 2 })}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <div className="mr-[.14rem]">Staked ETH</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
            </div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(stakedEth)}
            </div>
          </div>
        </div>
      </div>

      <div
        className={classNames(
          classNames(styles["card-container"], "mt-[.36rem]")
        )}
      >
        <div className="flex items-center justify-between mx-[.56rem]">
          <div className="flex items-center">
            <div className="text-white text-[.32rem]">Pool Status</div>

            <div className={styles["my-pool"]}>
              <div>My Pool</div>
              <Icomoon icon="right" size="0.19rem" color="#00F3AB" />
            </div>
          </div>

          <div className="rotate-90">
            <Icomoon icon="right" size="0.19rem" color="#ffffff" />
          </div>
        </div>

        <div className="mt-[.8rem] mb-[.23rem] flex">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem]">Pool ETH</div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(poolEth)}
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              23 Contracts Now
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <div className="mr-[.14rem]">Unmatched rETH</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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
              <div className="mr-[.14rem]">Matched Validators</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
            </div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(matchedValidators)}
            </div>
          </div>
        </div>
      </div>

      <div
        className={classNames(
          classNames(styles["card-container"], "mt-[.36rem]")
        )}
      >
        <div className="flex items-center justify-between mx-[.56rem]">
          <div className="text-white text-[.32rem]">APR</div>

          <div className="rotate-90">
            <Icomoon icon="right" size="0.19rem" color="#ffffff" />
          </div>
        </div>

        <div className="mt-[.8rem] mb-[.23rem] flex">
          <div className="flex-1 flex flex-col items-center">
            <div className="text-text2 text-[.24rem] flex items-center">
              <div className="mr-[.14rem]">Staker APR</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
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
              <div className="mr-[.14rem]">Validator APR</div>
              <Icomoon icon="question" size="0.16rem" color="#5B6872" />
            </div>

            <div className="mt-[.23rem] text-white text-[.32rem]">
              {formatNumber(validatorApr, { decimals: 2 })}%
            </div>

            <div className="mt-[.16rem] text-text2 text-[.24rem]">
              Estimated
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PoolData.getLayout = (page: ReactElement) => {
  return (
    <RethLayout>
      <RethStakeLayout>{page}</RethStakeLayout>
    </RethLayout>
  );
};

export default PoolData;
