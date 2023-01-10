import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { useAppDispatch } from "hooks/common";
import { useKsmBalance } from "hooks/useKsmBalance";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getKsmPools } from "redux/reducers/KsmSlice";
import { connectMetaMask, connectPolkadotJs } from "redux/reducers/WalletSlice";

const RTokenStakePage = () => {
  const dispatch = useAppDispatch();
  const tokenStandard = useTokenStandard(TokenName.KSM);
  const rTokenBalance = useRTokenBalance(tokenStandard, TokenName.KSM);
  const { setNavigation } = React.useContext(MyLayoutContext);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { metaMaskAccount, polkadotAccount, ksmAccount } = useWalletAccount();
  const balance = useKsmBalance();

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    dispatch(getKsmPools());
  }, [dispatch]);

  const getDefaultReceivingAddress = () => {
    if (tokenStandard === TokenStandard.Native) {
      return polkadotAccount;
    }
    return metaMaskAccount;
  };

  const connectWallet = () => {
    if (tokenStandard === TokenStandard.Native) {
      if (!polkadotAccount) {
        dispatch(connectPolkadotJs(true, WalletType.Polkadot));
        return;
      }
      if (!ksmAccount) {
        dispatch(connectPolkadotJs(true, WalletType.Polkadot_KSM));
        return;
      }
    } else {
      if (!metaMaskAccount) {
        dispatch(connectMetaMask(getMetamaskEthChainId()));
        return;
      }
      if (!ksmAccount) {
        dispatch(connectPolkadotJs(true, WalletType.Polkadot_KSM));
        return;
      }
    }
  };

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.KSM}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() => {
          connectWallet();
        }}
      />

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">KSM Reward</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.KSM}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.KSM} />

      <RTokenIntegrations tokenName={TokenName.KSM} />

      <RTokenStakeModal
        rTokenBalance={rTokenBalance}
        tokenName={TokenName.KSM}
        defaultReceivingAddress={getDefaultReceivingAddress()}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance || "--"}
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
            How to obtain ERC20 rKSM?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          You can swap rKSM tokens into ERC-20 format at 1:1 ratio through the
          swapping function{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.stafi.io/rAsset/home/native/erc"
            target="_blank"
            rel="noreferrer"
          >
            rAsset
          </a>
          . Please refer to this guide to swap native rKSM into ERC20 format:
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
            What&apos;s the contract address of rKSM?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rKSM ERC20 Contract Address:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://etherscan.io/address/0x3c3842c4d3037ae121d69ea1e7a0b61413be806c"
            target="_blank"
            rel="noreferrer"
          >
            0x3c3842c4d3037ae121d69ea1e7a0b61413be806c
          </a>
          <br />
          <br />
          rKSM BEP20 Contract Address:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://bscscan.com/address/0xfa1df7c727d56d5fec8c79ef38a9c69aa9f784a3"
            target="_blank"
            rel="noreferrer"
          >
            0xfa1df7c727d56d5fec8c79ef38a9c69aa9f784a3
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What are the commissions and fees in rKSM?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          <span className="font-semibold">Stake KSM</span>: FIS Transaction Fee
          + Bridge Fee (pay for the cross-chain interaction), KSM Transaction
          Fee.
          <br />
          <br />
          <span className="font-semibold">Unstake KSM</span>: 0.2% unstake
          fee(based on the amount of unstaked rKSM).
          <br />
          <br />
          Details:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rksm-solution#commission-and-fees"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rksm-solution#commission-and-fees
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
          unstaked rKSM tokens.
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
          Reward normally is updated every 6 hours.
          <br />
          <br />
          rKSM liquid staking rewards are mainly decided by the Kusama
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
            How to get my rKSM back?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          After completing the &quot;Unstake&quot; operation, plz wait for
          around 8 days to get the unstaked KSM tokens, which will be
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
            How to calculate rKSM on-chain rate?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rKSM on-chain rate is recording how many KSMs could be unstaked with 1
          rKSM token. It will start from 1 and gradually increase along with the
          staking rewards generated continuously.
          <br />
          <br />
          You could refer to{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rksm-solution"
            target="_blank"
            rel="noreferrer"
          >
            rKSM Solution
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
            What&apos;s the rKSM secondary market peg?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Secondary market peg is the trading price of rKSM against the KSM on
          secondary markets like{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x3c3842c4d3037ae121d69ea1e7a0b61413be806c"
            target="_blank"
            rel="noreferrer"
          >
            Uniswap
          </a>{" "}
          DEX. Sometimes the rKSM peg could be lower or higher than the on-chain
          rate due to the secondary market trading, but the rKSM token holders
          could always unstake the KSMs back according to the on-chain rate from
          StaFi.
        </div>
      </CollapseCard>
    </div>
  );
};

export default RTokenStakePage;
