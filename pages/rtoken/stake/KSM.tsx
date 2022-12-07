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
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getKsmPools } from "redux/reducers/KsmSlice";
import { connectMetaMask } from "redux/reducers/WalletSlice";

const RTokenStakePage = () => {
  const dispatch = useAppDispatch();
  const { setNavigation } = React.useContext(MyLayoutContext);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { metaMaskAccount } = useWalletAccount();
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

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.KSM}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() =>
          dispatch(connectMetaMask(getMetamaskEthChainId()))
        }
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
        tokenName={TokenName.KSM}
        defaultReceivingAddress={metaMaskAccount}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance || "--"}
        editAddressDisabled
      />
    </div>
  );
};

export default RTokenStakePage;
