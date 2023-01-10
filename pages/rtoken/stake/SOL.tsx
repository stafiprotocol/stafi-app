import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { estimateUnbondDays } from "config/unbond";
import { useAppDispatch } from "hooks/common";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getSolPools } from "redux/reducers/SolSlice";
import { connectPhantom, connectPolkadotJs } from "redux/reducers/WalletSlice";

const RTokenStakePage = () => {
  const dispatch = useAppDispatch();
  const tokenStandard = useTokenStandard(TokenName.SOL);
  const rTokenBalance = useRTokenBalance(tokenStandard, TokenName.SOL);
  const { setNavigation } = React.useContext(MyLayoutContext);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { solanaAccount, polkadotAccount, solanaBalance } = useWalletAccount();

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    dispatch(getSolPools());
  }, [dispatch]);

  const getDefaultReceivingAddress = () => {
    if (tokenStandard === TokenStandard.Native) {
      return polkadotAccount;
    }
    return solanaAccount;
  };

  const connectWallet = () => {
    if (!polkadotAccount) {
      dispatch(connectPolkadotJs(true, WalletType.Polkadot));
      return;
    }
    if (!solanaAccount) {
      dispatch(connectPhantom(false));
      return;
    }
  };

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.SOL}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() => connectWallet()}
      />

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">SOL Reward</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.SOL}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.SOL} />

      <RTokenIntegrations tokenName={TokenName.SOL} />

      <RTokenStakeModal
        rTokenBalance={rTokenBalance}
        tokenName={TokenName.SOL}
        defaultReceivingAddress={getDefaultReceivingAddress()}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={solanaBalance || "--"}
        editAddressDisabled={false}
        onClickConnectWallet={() => connectWallet()}
      />

      <div className="mt-[.56rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to obtain SPL rSOL?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          You can swap rSOL tokens into SPL format at 1:1 ratio through the
          swapping function{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.stafi.io/rAsset/home/native/erc"
            target="_blank"
            rel="noreferrer"
          >
            rAsset
          </a>
          . Please refer to this guide to swap native rSOL into SPL format:
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
            What&apos;s the contract address of rSOL?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rSOL SPL Contract Address:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://solscan.io/token/7hUdUTkJLwdcmt3jSEeqx4ep91sm1XwBxMDaJae6bD5D"
            target="_blank"
            rel="noreferrer"
          >
            7hUdUTkJLwdcmt3jSEeqx4ep91sm1XwBxMDaJae6bD5D
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What are the commissions and fees in rSOL?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          <span className="font-semibold">Stake SOL</span>: FIS Transaction Fee
          + Bridge Fee (pay for the cross-chain interaction), SOL Transaction
          Fee.
          <br />
          <br />
          <span className="font-semibold">Unstake SOL</span>: 0.2% unstake
          fee(based on the amount of unstaked rSOL).
          <br />
          <br />
          Details:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rsol-solution/rsol-faq#8.what-are-the-commissions-and-fees-when-staking-sol"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rsol-solution/rsol-faq#8.what-are-the-commissions-and-fees-when-staking-sol
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
          unstaked rSOL tokens.
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
          Reward normally is updated every 66 hours.
          <br />
          <br />
          rSOL liquid staking rewards are mainly decided by the Solana
          chain&apos;s staking APY, delegation strategy and the original
          validator&apos;s slash risks.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to get my rSOL back?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          After completing the &quot;Unstake&quot; operation, plz wait for
          around {estimateUnbondDays(TokenName.SOL)} days to get the unstaked
          SOL tokens, which will be automatically sent to your designated
          account after the lock-up period.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to calculate rSOL on-chain rate?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rSOL on-chain rate is recording how many SOLs could be unstaked with 1
          rSOL token. It will start from 1 and gradually increase along with the
          staking rewards generated continuously.
          <br />
          <br />
          You could refer to{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rsol-solution"
            target="_blank"
            rel="noreferrer"
          >
            rSOL Solution
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
            What&apos;s the rSOL secondary market peg?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Secondary market peg is the trading price of rSOL against the SOL on
          secondary markets like{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.atrix.finance/swap?from=7hUdUTkJLwdcmt3jSEeqx4ep91sm1XwBxMDaJae6bD5D"
            target="_blank"
            rel="noreferrer"
          >
            Atrix
          </a>{" "}
          DEX. Sometimes the rSOL peg could be lower or higher than the on-chain
          rate due to the secondary market trading, but the rSOL token holders
          could always unstake the SOLs back according to the on-chain rate from
          StaFi.
        </div>
      </CollapseCard>
    </div>
  );
};

export default RTokenStakePage;
