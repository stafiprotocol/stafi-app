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
