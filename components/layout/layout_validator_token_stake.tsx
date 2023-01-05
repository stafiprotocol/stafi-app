import classNames from "classnames";
import { Button } from "components/common/button";
import { Card } from "components/common/card";
import { CollapseCard } from "components/common/CollapseCard";
import { Icomoon } from "components/icon/Icomoon";
import { EthGoStakeSidebar } from "components/modal/EthGoStakeSidebar";
import { useRouter } from "next/router";
import styles from "styles/reth/RethLayout.module.scss";
import { FAQ_ID_CONFIGURE_FEE, FAQ_ID_SLASH } from "utils/constants";

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
          <div id="faq5" className="text-white text-[.32rem]">
            Why should I become a validator in rETH?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          There are 4 main reasons why you should consider joining in rETH
          Original Validator Campaign:
          <br />
          <br />1{")"} No KYC and Permission Required
          <br />
          <br />
          Designated Address: 0x6fB2aa2443564d9430b9483B1A5eeA13a522dF45
          <br />
          <br />
          Any Eth2.0 validator, no matter whether you are a personal validator
          or an institutional validator, can join in to be a Solo Validator in
          rETH freely without any KYC or permission.
          <br />
          <br />2{")"} Higher APY
          <br />
          <br />
          The Solo Validator&apos;s staking profits will be 53% higher than
          totally self-funding the 32 ETH and the Trusted Validators will earn
          0.138528 ETH per node yearly without ETH deposit. Please check the{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.google.com/spreadsheets/d/1qJioZVzxg9q9mcnB8T6NhxwzKJl54zdOlVTeFBSqCek/edit#gid=0"
            target="_blank"
            rel="noreferrer"
          >
            OV APY calculation
          </a>{" "}
          table for details.
          <br />
          <br />3{")"} Competent Liquidity
          <br />
          <br />
          StaFi rETH designs a liquidity solution for Solo Validators&apos;
          deposits and rewards. rETH Solo Validators can redeem 2 ETH per node.
          <br />
          <br />4{")"} Slash Insurance
          <br />
          <br />
          StaFi will cooperate with{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://nexusmutual.io/"
            target="_blank"
            rel="noreferrer"
          >
            Nexus Mutual
          </a>
          ,{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://tidal.finance/"
            target="_blank"
            rel="noreferrer"
          >
            Tidal
          </a>{" "}
          and other DeFi insurance protocols to provide slash insurance for the
          alidators in rETH. Also, StaFi will establish an insurance fund pool
          to compensate for the slash loss.
        </div>
      </CollapseCard>

      <CollapseCard
        id={FAQ_ID_CONFIGURE_FEE}
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div id="faq1" className="text-white text-[.32rem]">
            What StaFi will do for the validators who don&apos;t configure the
            Priority Fee recipient address with the designated address?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          StaFi will block-listed the the validators who don&apos;t configure
          the Priority Fee recipient address with the designated address and
          deduct their deposited ETH as a penalty to compensate liquid stakers.
          <br />
          <br />
          For solo validators: the penalty would be that their deposits and
          staking rewards will be allocated to cover the supposed priority fee.
          <br />
          <br />
          Designated Address: 0x6fB2aa2443564d9430b9483B1A5eeA13a522dF45
          <br />
          <br />
          For trusted validators: the penalty would be that their pledge in the
          multi-sig address controlled by StaFi Protocol and Trusted Validator
          will be allocated to cover the supposed priority fee. Also, they will
          be delisted in the whitelist of rETH trusted validators.
          <br />
          <br />
          Designated Address: 0xdc5a28885a1800b1435982954ee9b51d2a8d3bf0
          <br />
          <br />
          <a
            className="text-primary cursor-pointer underline"
            href="https://commonwealth.im/stafi/discussion/7901-discussion-adding-original-validator-slashing-mechanism-to-reth-dapp"
            target="_blank"
            rel="noreferrer"
          >
            Click here for more details
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        id={FAQ_ID_SLASH}
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div id="faq10" className="text-white text-[.32rem]">
            How to deal with the Salsh Problem in ETH2.0?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          We will solve the slash problem through the following ways:
          <br />
          <br />1{")"} Solo Validator is required to deposit 4 ETH per node.
          When Slashing occurs, the staker loss will be deducted from the 4 ETH
          deposited in priority.
          <br />
          <br />2{")"} For Trusted Validators, we will sign the agreements with
          them and they will deposit a plege(in ETH) to a multi-sig account
          controlled by both StaFi and Trusted validator. When the slashing
          occurs, the pledge will be used to compensate the users.
          <br />
          <br />3{")"} StaFi will cooperate with Nexus Mutual, Tidal and other
          DeFi insurance protocols to provide slash insurance for OVs. Also,
          StaFi will establish an insurance fund pool to compensate for the
          slash loss over 8 ETH per node.
          <br />
          <br />4{")"} In addition, according to our research on ETH2.0
          slashing, the probability of slashing on all nodes is 0.05%, and the
          maximum slashing quota does not exceed 2ETH.
          <br />
          <br />
          <a
            className="text-primary cursor-pointer underline"
            href="https://medium.com/stafi/stafi-reths-solution-to-the-slash-of-eth-ae44e3767fb0"
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
