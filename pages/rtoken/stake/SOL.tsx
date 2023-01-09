import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { useAppDispatch } from "hooks/common";
import { useKsmBalance } from "hooks/useKsmBalance";
import { useRTokenBalance } from "hooks/useRTokenBalance";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard, WalletType } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getKsmPools } from "redux/reducers/KsmSlice";
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
    </div>
  );
};

export default RTokenStakePage;
