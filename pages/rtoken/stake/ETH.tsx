import { CollapseCard } from "components/common/CollapseCard";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { useAppSelector } from "hooks/common";
import { useWalletAccount } from "hooks/useWalletAccount";
import { ChartDu, TokenName, WalletType } from "interfaces/common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { RootState } from "redux/store";
import { connectMetaMask } from "utils/web3Utils";

const RTokenStakePage = () => {
  const { setNavigation, setTargetMetaMaskChainId, setWalletType } =
    React.useContext(MyLayoutContext);
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

  useEffect(() => {
    setTargetMetaMaskChainId(getMetamaskEthChainId());
    setWalletType(WalletType.MetaMask);
  }, [setTargetMetaMaskChainId, setWalletType]);

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.ETH}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() => connectMetaMask(getMetamaskEthChainId())}
      />

      <CollapseCard
        background="#0A131B"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">rETH Rewards</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.ETH}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.ETH} />

      <RTokenIntegrations tokenName={TokenName.ETH} />

      <div className="mt-[.76rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        background="#0A131B"
        mt=".55rem"
        title={
          <div className="text-white text-[.32rem]">
            Staking rewards upgrade time and influence factors
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem]">
          Reward normally is updated every 8 hours. For the on-chain data
          synchronization reason, it may be delayed for a while.
          <br />
          <br />
          StaFi’s rETH liquid staking rewards are mainly decided by the Ethereum
          beacon chain’s staking APY, the priority fee collected by rETH
          Original Validators, potential slash risks and the commission charged
          by StaFi Protocol and OVs.
        </div>
      </CollapseCard>

      <CollapseCard
        background="#0A131B"
        mt=".55rem"
        title={
          <div className="text-white text-[.32rem]">
            About the rETH on-chain rate and secondary market peg
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem]">
          rETH on-chain rate is recording how many ETHs could be redeemed with 1
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
          redeem the ETHs back according to the on-chain rate from StaFi when
          the Etherum beacons chain supports the withdraw function.
        </div>
      </CollapseCard>

      <CollapseCard
        background="#0A131B"
        mt=".55rem"
        title={
          <div className="text-white text-[.32rem]">rETH Redemption Notes</div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem]">
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

      <RTokenStakeModal
        tokenName={TokenName.ETH}
        editAddressDisabled
        defaultReceivingAddress={metaMaskAccount}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance}
      />
    </div>
  );
};

export default RTokenStakePage;
