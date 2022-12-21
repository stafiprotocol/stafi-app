import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch } from "hooks/common";
import { useDotBalance } from "hooks/useDotBalance";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName } from "interfaces/common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getDotPools } from "redux/reducers/DotSlice";
import { connectMetaMask } from "redux/reducers/WalletSlice";

const RTokenStakePage = () => {
  const dispatch = useAppDispatch();
  const { useChainId: useMetaMaskChainId } = hooks;
  const chainId = useMetaMaskChainId();
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { metaMaskAccount } = useWalletAccount();
  const balance = useDotBalance();

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    dispatch(getDotPools());
  }, [dispatch]);

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.DOT}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() =>
          dispatch(connectMetaMask(getMetamaskEthChainId()))
        }
      />

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">DOT Reward</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.DOT}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.DOT} />

      <RTokenIntegrations tokenName={TokenName.DOT} />

      <div className="mt-[.56rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to obtain ERC20 rDOT?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          You can swap rDOT tokens into ERC-20 format at 1:1 ratio through the
          swapping function{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.stafi.io/rAsset/home/native/erc"
            target="_blank"
            rel="noreferrer"
          >
            rAsset
          </a>
          . Please refer to this guide to swap native rDOT into ERC20 format:
          <br />
          <br />
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rasset/swap-guide"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rasset/swap-guide
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What&apos;s the contract address of rDOT?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rDOT ERC20 Contract Address:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://etherscan.io/address/0x505f5a4ff10985fe9f93f2ae3501da5fe665f08a"
            target="_blank"
            rel="noreferrer"
          >
            0x505f5a4ff10985fe9f93f2ae3501da5fe665f08a
          </a>
          <br />
          <br />
          rDOT BEP20 Contract Address:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://bscscan.com/address/0x1dab2a526c8ac1ddea86838a7b968626988d33de"
            target="_blank"
            rel="noreferrer"
          >
            0x1dab2a526c8ac1ddea86838a7b968626988d33de
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What are the commissions and fees in rDOT?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          <span className="font-semibold">Stake DOT</span>: FIS Transaction Fee
          + Bridge Fee (pay for the cross-chain interaction), DOT Transaction
          Fee.
          <br />
          <br />
          <span className="font-semibold">Unstake DOT</span>: 0.2% unstake
          fee(based on the amount of unstaked rDOT).
          <br />
          <br />
          Details:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rdot-solution#rdot-charge"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rdot-solution#rdot-charge
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What fee is applied by StaFi? What is this used for?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          <span className="font-semibold">Staking Reward Fee</span>: 10% of your
          staking reward(your total staking reward minus validator commission)
          <br />
          <br />
          <span className="font-semibold">Bridge Fee</span>: The fee charged by
          the relayers to pay for the cross-chain contract interaction service
          fee between StaFi chain and designated chain.
          <br />
          <br />
          <span className="font-semibold">Unstake Fee</span>: 0.2% of your
          unstaked rDOT tokens.
          <br />
          <br />
          Those fees are split between node operators and the StaFi DAO, as well
          as developers who contribute to the StaFi ecosystem.
        </div>
      </CollapseCard>

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
          Reward normally is updated every 24 hours.
          <br />
          <br />
          rDOT liquid staking rewards are mainly decided by the Polkadot
          chain&apos;s staking APY, delegation strategy and the original
          validator’s slash risks.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to get my rDOT back?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          After completing the &quot;Unstake&quot; operation, plz wait for
          around 8 days to get the unstaked DOT tokens, which will be
          automatically sent to your designated account after the lock-up
          period.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to calculate rDOT on-chain rate?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rDOT on-chain rate is recording how many DOTs could be unstaked with 1
          rDOT token. It will start from 1 and gradually increase along with the
          staking rewards generated continuously.
          <br />
          <br />
          You could refer to{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rdot-solution"
            target="_blank"
            rel="noreferrer"
          >
            rDOT Solution
          </a>{" "}
          to check its calculation details.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What’s the rDOT secondary market peg?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Secondary market peg is the trading price of rDOT against the DOT on
          secondary markets like{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x505f5a4ff10985fe9f93f2ae3501da5fe665f08a"
            target="_blank"
            rel="noreferrer"
          >
            Uniswap
          </a>{" "}
          DEX. Sometimes the rDOT peg could be lower or higher than the on-chain
          rate due to the secondary market trading, but the rDOT token holders
          could always unstake the DOTs back according to the on-chain rate from
          StaFi.
        </div>
      </CollapseCard>

      <RTokenStakeModal
        tokenName={TokenName.DOT}
        defaultReceivingAddress={metaMaskAccount}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance || "--"}
        editAddressDisabled
        onClickConnectWallet={() =>
          dispatch(connectMetaMask(getMetamaskEthChainId()))
        }
      />
    </div>
  );
};

export default RTokenStakePage;
