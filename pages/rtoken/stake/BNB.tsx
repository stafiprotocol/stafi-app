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
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";
import { TokenName, TokenStandard } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { getPools, updateMaticBalance } from "redux/reducers/MaticSlice";
import { connectMetaMask } from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";

const RBnbStakePage = () => {
  const { useChainId: useMetaMaskChainId } = hooks;
  const chainId = useMetaMaskChainId();
  const { setNavigation } = React.useContext(MyLayoutContext);

  const dispatch = useAppDispatch();

  const tokenStandard = useTokenStandard(TokenName.MATIC);

  const { metaMaskAccount } = useWalletAccount();

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
    </div>
  );
};

export default RBnbStakePage;
