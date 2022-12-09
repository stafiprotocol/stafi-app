import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getValidatorSiteHost } from "config/env";
import { getMetamaskEthChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, WalletType } from "interfaces/common";
import Image from "next/image";
import { useRouter } from "next/router";
import bulb from "public/bulb.svg";
import React, { useEffect, useState } from "react";
import { connectMetaMask } from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";
import { openLink } from "utils/common";

const RTokenStakePage = () => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const chainId = useMetaMaskChainId();
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { metaMaskAccount } = useWalletAccount();
  const { balance } = useAppSelector((state: RootState) => {
    return { balance: state.eth.balance };
  });

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.ETH}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() =>
          dispatch(connectMetaMask(getMetamaskEthChainId()))
        }
      />

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">ETH Reward</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.ETH}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.ETH} />

      <RTokenIntegrations tokenName={TokenName.ETH} />

      <div className="relative z-10 mt-[.56rem] rounded-[.3rem] h-[.6rem] flex items-center justify-between px-[.3rem] border-solid border-[1px] border-warning/50">
        <div className="flex items-center">
          <div className="w-[.3rem] h-[.3rem] relative">
            <Image src={bulb} alt="bulb" layout="fill" />
          </div>

          <div className="ml-[.16rem] text-[.2rem] text-warning">
            Interested to become StaFi Validator? Join us to stake ETH and earn
            more right now!
          </div>
        </div>

        <div
          className="text-[.2rem] text-warning underline font-bold cursor-pointer"
          onClick={() => {
            openLink(
              `${getValidatorSiteHost()}/validator/reth/token-stake?checkNewUser=true`
            );
          }}
        >
          Learn More
        </div>
      </div>

      <div className="mt-[.56rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What&apos;re the factors that affect the staking rewards?
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

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What&apos;s the onchain rate of rETH?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rETH on-chain rate is recording how many ETHs could be unstaked with 1
          rETH token. It will start from 1 and gradually increase along with the
          staking rewards generated continuously.
          <br />
          <br />
          You could refer to{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/reth-solution"
            target="_blank"
            rel="noreferrer"
          >
            rETH Solution
          </a>{" "}
          to check its calculation details.
          <br />
          <br />
          Secondary market peg is the trading price of rETH against the ETH on
          secondary markets like DEXes including Uniswap and Curve. Sometimes
          the rETH peg could be lower or higher than the on-chain rate due to
          the secondary market trading, but the rETH token holders could always
          unstake the ETHs back according to the on-chain rate from StaFi when
          the Etherum beacons chain supports the unstake function.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How rETH can be converted to ETH?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Now the redemption function is disabled. We will support the
          redemption function as soon as the Ethereum{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://github.com/ethereum/pm/issues/450"
            target="_blank"
            rel="noreferrer"
          >
            Shanghai Upgrade
          </a>{" "}
          arrives.
        </div>
      </CollapseCard>

      {/* <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What are the commissions and fees in rETH?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Stake ETH: N * Ethereum Gas Fee
          <br />
          <br />
          Staking Reward Fee: 10% Staking Reward Commission(based on the total
          staking rewards generated).
          <br />
          <br />
          Details:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/reth-solution/faq"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/reth-solution/faq
          </a>
        </div>
      </CollapseCard> */}

      <RTokenStakeModal
        tokenName={TokenName.ETH}
        defaultReceivingAddress={metaMaskAccount}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance}
        editAddressDisabled
      />
    </div>
  );
};

export default RTokenStakePage;
