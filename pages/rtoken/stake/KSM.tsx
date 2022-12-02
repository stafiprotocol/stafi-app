import { CollapseCard } from "components/common/CollapseCard";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { hooks } from "connectors/metaMask";
import { useKsmBalance } from "hooks/useKsmBalance";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName } from "interfaces/common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { connectMetaMask } from "utils/web3Utils";

const RTokenStakePage = () => {
  const { useChainId: useMetaMaskChainId } = hooks;
  const chainId = useMetaMaskChainId();
  const { setNavigation } = React.useContext(MyLayoutContext);
  const router = useRouter();
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { metaMaskAccount } = useWalletAccount();
  const balance = useKsmBalance();

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.KSM}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() => connectMetaMask(getMetamaskEthChainId())}
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
