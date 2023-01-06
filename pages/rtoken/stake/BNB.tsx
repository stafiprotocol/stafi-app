import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskBscChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getPools, updateBnbBalance } from "redux/reducers/BnbSlice";
import { connectMetaMask } from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";

const RBnbStakePage = () => {
  const { useChainId: useMetaMaskChainId } = hooks;
  const chainId = useMetaMaskChainId();
  const { setNavigation } = React.useContext(MyLayoutContext);

  const dispatch = useAppDispatch();

  const tokenStandard = useTokenStandard(TokenName.BNB);

  const rTokenBalance = useRTokenBalance(tokenStandard, TokenName.BNB);

  const { metaMaskAccount } = useWalletAccount();

  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { polkadotAccount } = useWalletAccount();

  const { balance, refreshDataFlag } = useAppSelector((state: RootState) => {
    const balance = state.bnb.balance;
    if (isNaN(Number(balance))) {
      return { balance: "--" };
    }
    const transferrableAmount = Math.max(0, Number(balance) - 0.0003) + "";
    return {
      balance: transferrableAmount,
      refreshDataFlag: state.app.refreshDataFlag,
    };
  });

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    dispatch(updateBnbBalance());
  }, [dispatch, metaMaskAccount, chainId, refreshDataFlag]);

  useEffect(() => {
    dispatch(getPools());
    // dispatch(updateFisAccounts());
  }, [dispatch]);

  const onClickStake = () => {
    if (metaMaskAccount) {
      dispatch(updateBnbBalance());
      setStakeModalVisible(true);
    } else {
      return;
    }
  };

  const getDefaultReceivingAddress = () => {
    if (tokenStandard === TokenStandard.Native) {
      return polkadotAccount;
    }
    return metaMaskAccount;
  };

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.BNB}
        onClickStake={onClickStake}
        onClickConnectWallet={() => {
          dispatch(connectMetaMask(getMetamaskBscChainId()));
        }}
      />

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">rBNB Reward</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.BNB}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.BNB} />

      <RTokenIntegrations tokenName={TokenName.BNB} />

      <RTokenStakeModal
        rTokenBalance={rTokenBalance}
        defaultReceivingAddress={getDefaultReceivingAddress()}
        tokenName={TokenName.BNB}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance || "--"}
        onClickConnectWallet={() =>
          dispatch(connectMetaMask(getMetamaskBscChainId()))
        }
      />

      <div className="mt-[.56rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to obtain BEP20 rBNB?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          You can swap rBNB tokens into BEP-20 format at 1:1 ratio through the
          swapping function{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.stafi.io/rAsset/home/native/erc"
            target="_blank"
            rel="noreferrer"
          >
            rAsset
          </a>
          . Please refer to this guide to swap native rBNB into BEP20 format:
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
            What&apos;s the contract address of rBNB?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rBNB Contract Address:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://etherscan.io/address/0x3dbb00c9be5a327e25caf4f650844c5dba81e34b"
            target="_blank"
            rel="noreferrer"
          >
            0xf027e525d491ef6ffcc478555fbb3cfabb3406a6
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What are the commissions and fees in rBNB?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          <span className="font-semibold">Stake BNB</span>: Ethereum Gas Fee +
          Bridge Fee (pay for the cross-chain interaction).
          <br />
          <br />
          <span className="font-semibold">Unstake BNB</span>: 0.2% unstake
          fee(based on the amount of unstaked rBNB).
          <br />
          <br />
          Details:{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rbnb-solution#rbnb-charge"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rbnb-solution#rbnb-charge
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
          unstaked rBNB tokens.
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
          rBNB liquid staking rewards are mainly decided by the BSC chain&apos;s
          staking APY, delegation strategy and the original validator’s slash
          risks.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to get my rBNB back?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          After completing the &quot;Unstake&quot; operation, plz wait for
          around 16 days to get the unstaked BNB tokens, which will be
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
            How to calculate rBNB on-chain rate?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rBNB on-chain rate is recording how many BNBs could be unstaked with 1
          rBNB token. It will start from 1 and gradually increase along with the
          staking rewards generated continuously.
          <br />
          <br />
          You could refer to{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rbnb-solution"
            target="_blank"
            rel="noreferrer"
          >
            rBNB Solution
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
            What’s the rBNB secondary market peg?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Secondary market peg is the trading price of rBNB against the BNB on
          secondary markets like{" "}
          <a
            className="text-primary cursor-pointer underline"
            href="https://pancakeswap.finance/swap?inputCurrency=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c&outputCurrency=0xf027e525d491ef6ffcc478555fbb3cfabb3406a6"
            target="_blank"
            rel="noreferrer"
          >
            Pancake
          </a>{" "}
          DEX. Sometimes the rBNB peg could be lower or higher than the on-chain
          rate due to the secondary market trading, but the rBNB token holders
          could always unstake the BNBs back according to the on-chain rate from
          StaFi.
        </div>
      </CollapseCard>
    </div>
  );
};

export default RBnbStakePage;
