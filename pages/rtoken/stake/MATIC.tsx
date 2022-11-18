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
        balance={balance}
      />
    </div>
  );
};

export default RMaticStakePage;
