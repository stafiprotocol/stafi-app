import classNames from "classnames";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { CollapseCard } from "components/common/CollapseCard";
import { Icomoon } from "components/icon/Icomoon";
import { EthGoStakeSidebar } from "components/modal/EthGoStakeSidebar";
import { useRouter } from "next/router";
import styles from "styles/reth/RethLayout.module.scss";

type ValidatorTokenStakeLayoutProps = React.PropsWithChildren<{}>;

export const ValidatorTokenStakeLayout = (
  props: ValidatorTokenStakeLayoutProps
) => {
  const router = useRouter();
  const isTokenStake = router.pathname.endsWith("token-stake");
  const isMyData = router.pathname.endsWith("my-data");
  const isPoolData = router.pathname.endsWith("pool-data");

  return (
    <div>
      <Card background="rgba(26, 40, 53, 0.2)">
        <div>
          <div className="h-[1.33rem] border-solid border-b-[1px] border-b-text3 flex items-center justify-between">
            <div className="self-stretch flex items-stretch">
              <div
                className="ml-[1rem] flex items-center relative cursor-pointer"
                onClick={() => {
                  router.push("/validator/reth/token-stake");
                }}
              >
                <div className="mt-[.05rem] flex items-center">
                  <Icomoon
                    icon="coins"
                    size="0.3rem"
                    color={isTokenStake ? "#00F3AB" : "#9DAFBE"}
                  />
                  <div
                    className={classNames(
                      "ml-[.12rem] text-[.24rem] w-[1.6rem]",
                      isTokenStake ? "font-[700] text-primary" : "text-text1"
                    )}
                  >
                    Token Stake
                  </div>
                </div>
                <div
                  className={classNames(styles["tab-indicator"], {
                    invisible: !isTokenStake,
                  })}
                />
              </div>
              <div
                className="ml-[.76rem] flex items-center relative cursor-pointer"
                onClick={() => {
                  router.push("/validator/reth/my-data");
                }}
              >
                <div className="mt-[.05rem] flex items-center">
                  <Icomoon
                    icon="data"
                    size="0.3rem"
                    color={isMyData ? "#00F3AB" : "#9DAFBE"}
                  />
                  <div
                    className={classNames(
                      "ml-[.12rem] text-[.24rem] w-[1.2rem]",
                      isMyData ? "font-[700] text-primary" : "text-text1"
                    )}
                  >
                    My Data
                  </div>
                </div>
                <div
                  className={classNames(styles["tab-indicator"], {
                    invisible: !isMyData,
                  })}
                />
              </div>
              <div
                className="ml-[.76rem] flex items-center relative cursor-pointer"
                onClick={() => {
                  router.push("/validator/reth/pool-data");
                }}
              >
                <div className="mt-[.05rem] flex items-center">
                  <Icomoon
                    icon="collection"
                    size="0.3rem"
                    color={isPoolData ? "#00F3AB" : "#9DAFBE"}
                  />
                  <div
                    className={classNames(
                      "ml-[.12rem] text-[.24rem] w-[1.5rem]",
                      isPoolData ? "font-[700] text-primary" : "text-text1"
                    )}
                  >
                    Pool Data
                  </div>
                </div>
                <div
                  className={classNames(styles["tab-indicator"], {
                    invisible: !isPoolData,
                  })}
                />
              </div>
            </div>

            <div className="mr-[.56rem]">
              <Button
                stroke
                width="2.18rem"
                height=".65rem"
                fontSize=".24rem"
                onClick={() => router.push("/validator/reth/choose-validator")}
              >
                New Deposit
              </Button>
            </div>
          </div>
          {props.children}
        </div>
      </Card>

      <div id="faqs" className="mt-[.56rem] text-white text-[.32rem]">
        FAQs
      </div>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to configure fee recipient as adress for each node?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Reward normally is updated every 8 hours. For the on-chain data
          synchronization reason, it may be delayed for a while.
          <br />
          <br />
          StaFi&apos;s rETH liquid staking rewards are mainly decided by the
          Ethereum beacon chain&apos;s staking APY, the priority fee collected
          by rETH Original Validators, potential slash risks and the commission
          charged by StaFi Protocol and OVs.
          <br />
          <br />
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/reth-solution"
            target="_blank"
            rel="noreferrer"
          >
            Click here for more details
          </a>
        </div>
      </CollapseCard>

      <EthGoStakeSidebar />
    </div>
  );
};
