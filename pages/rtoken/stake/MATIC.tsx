import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskMaticChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useAppDispatch, useAppSelector } from "hooks/common";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { ChartDu, TokenName, TokenStandard } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getPools, updateMaticBalance } from "redux/reducers/MaticSlice";
import { RootState } from "redux/store";
import { connectMetaMask } from "utils/web3Utils";

const RMaticStakePage = () => {
  const { useChainId: useMetaMaskChainId } = hooks;
  const chainId = useMetaMaskChainId();
  const { setNavigation } = React.useContext(MyLayoutContext);

  const dispatch = useAppDispatch();

  const tokenStandard = useTokenStandard(TokenName.MATIC);

  const { metaMaskAccount } = useWalletAccount();

  const [chartDu, setChartDu] = useState(ChartDu.ALL);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { polkadotAccount } = useWalletAccount();

	// const rTokenBalance = useRTokenBalance(tokenStandard, TokenName.MATIC);
  const { balance } = useAppSelector((state: RootState) => {
    return { balance: state.matic.balance };
  });

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    dispatch(updateMaticBalance());
  }, [dispatch, metaMaskAccount, chainId]);

  useEffect(() => {
    dispatch(getPools());
    // dispatch(updateFisAccounts());
  }, [dispatch]);

  const onClickStake = () => {
    if (polkadotAccount) {
      dispatch(updateMaticBalance());
      setStakeModalVisible(true);
    } else {
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
        tokenName={TokenName.MATIC}
        onClickStake={onClickStake}
        onClickConnectWallet={() => connectMetaMask(getMetamaskMaticChainId())}
      />

      <CollapseCard
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">rMATIC Reward</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.MATIC}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.MATIC} />

      <RTokenIntegrations tokenName={TokenName.MATIC} />

      <RTokenStakeModal
        defaultReceivingAddress={getDefaultReceivingAddress()}
        tokenName={TokenName.MATIC}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance || '--'}
      />

      <div className="mt-[.56rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to obtain ERC20 rMATIC?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          You can swap rMATIC tokens into ERC-20 format at 1:1 ratio through the swapping function{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://app.stafi.io/rAsset/home/native/erc"
            target="_blank"
            rel="noreferrer"
          >
            rAsset
          </a>
          . Please refer to this guide to swap native rMATIC into ERC20 format:
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
            What&apos;s the contract address of rMATIC?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rMATIC ERC20 Contract Address:{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://etherscan.io/address/0x3dbb00c9be5a327e25caf4f650844c5dba81e34b"
            target="_blank"
            rel="noreferrer"
          >
            0x3dbb00c9be5a327e25caf4f650844c5dba81e34b
          </a>
          <br />
          <br />
          rMATIC BEP20 Contract Address:{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://bscscan.com/address/0x117eefdde5e5aed6626ffedbb5d2ac955f64dbf3"
            target="_blank"
            rel="noreferrer"
          >
            0x117eefdde5e5aed6626ffedbb5d2ac955f64dbf3
          </a>
          <br />
          <br />
          rMATIC Contract Address on Polygon:{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://polygonscan.com/address/0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb"
            target="_blank"
            rel="noreferrer"
          >
            0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb
          </a>
          <br />
          <br />
          MATIC ERC20 Contract Address:{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://etherscan.io/address/0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"
            target="_blank"
            rel="noreferrer"
          >
            0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0
          </a>
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What are the commissions and fees in rMATIC?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          <span className="font-semibold">Stake MATIC</span>: N * (StaFi chain Gas Fee + Ethereum Gas Fee), 
          and the payment is made by native FIS. 
          In most cases, N is set to 2.
          <br />
          <br />
          <span className="font-semibold">Unstake MATIC</span>: 0.2% unstake fee(based on the amount of unstaked rMATIC) 
          and 10% Staking Reward Commission(based on the total staking rewards generated).
          <br />
          <br />
          Details:{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rmatic-solution#rmatic-charge"
            target="_blank"
            rel="noreferrer"
          >
            https://docs.stafi.io/rtoken-app/rmatic-solution#rmatic-charge
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
          <span className="font-semibold">Staking Reward Fee</span>: 10% of your staking reward( your total staking reward minus validator commission)
          <br />
          <br />
          <span className="font-semibold">Relay Fee</span>: The fee charged by the relayers to pay for the cross-chain contract 
          interaction service fee between StaFi chain and designated chain.
          <br />
          <br />
          <span className="font-semibold">Unstake Fee</span>: 0.2% of your unstaked rMATIC tokens.
          <br />
          <br />
          Those fees are split between node operators and the StaFi DAO, as well as developers who contribute to the stafi ecosystem.
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
          rMATIC liquid staking rewards are mainly decided by the Polygon chain&apos;s staking APY, 
          delegation strategy and the original validator’s slash risks.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to get my rMATIC back?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          After completing the &quot;Unstake&quot; operation, plz wait for around 9 days to get the unstaked MATIC tokens, 
          which will be automatically sent to your designated account after the lock-up period.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            How to calculate rMATIC on-chain rate?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          rMATIC on-chain rate is recording how many MATICs could be unstaked with 1 rMATIC token. 
          It will start from 1 and gradually increase along with the staking rewards generated continuously.
          <br />
          <br />
          You could refer to{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://docs.stafi.io/rtoken-app/rmatic-solution"
            target="_blank"
            rel="noreferrer"
          >
            rMATIC Solution
          </a>{' '}
          to check its calculation details.
        </div>
      </CollapseCard>

      <CollapseCard
        defaultCollapsed
        background="rgba(26, 40, 53, 0.2)"
        mt=".36rem"
        title={
          <div className="text-white text-[.32rem]">
            What’s the rMATIC secondary market peg?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem] leading-normal">
          Secondary market peg is the trading price of rMATIC against the MATIC on secondary markets like{' '}
          <a
            className="text-primary cursor-pointer underline"
            href="https://quickswap.exchange/#/swap?inputCurrency=0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270&outputCurrency=0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb"
            target="_blank"
            rel="noreferrer"
          >
            Quickswap
          </a>{' '}
          DEX. Sometimes the rMATIC peg could be lower or higher than the on-chain rate due to the secondary market trading, 
          but the rMATIC token holders could always unstake the MATICs back according to the on-chain rate from StaFi.
        </div>
      </CollapseCard>
    </div>
  );
};

export default RMaticStakePage;
