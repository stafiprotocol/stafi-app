import { CollapseCard } from "components/common/CollapseCard";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { useAppSelector } from "hooks/common";
import { useWalletAccount } from "hooks/useWalletAccount";
import { ChartDu, TokenName, WalletType } from "interfaces/common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { RootState } from "redux/store";
import { connectMetaMask } from "utils/web3Utils";

const RTokenStakePage = () => {
  const { setNavigation, setTargetMetaMaskChainId, setWalletType } =
    React.useContext(MyLayoutContext);
  const router = useRouter();
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

  const { metaMaskAccount } = useWalletAccount();
  const { balance } = useAppSelector((state: RootState) => {
    return { balance: state.eth.balance };
  });

  useEffect(() => {
    setNavigation([
      { name: "rToken List", path: "/rtoken" },
      { name: "Stake" },
    ]);
  }, [setNavigation]);

  useEffect(() => {
    setTargetMetaMaskChainId(getMetamaskEthChainId());
    setWalletType(WalletType.MetaMask);
  }, [setTargetMetaMaskChainId, setWalletType]);

  return (
    <div>
      <StakeOverview
        tokenName={TokenName.ETH}
        onClickStake={() => setStakeModalVisible(true)}
        onClickConnectWallet={() => connectMetaMask(getMetamaskEthChainId())}
      />

      <CollapseCard
        background="#0A131B"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">rETH Rewards</div>}
      >
        <RewardChartPanel
          tokenName={TokenName.ETH}
          onClickStake={() => setStakeModalVisible(true)}
        />
      </CollapseCard>

      <StakeMyHistory tokenName={TokenName.ETH} />

      <RTokenIntegrations tokenName={TokenName.ETH} />

      <div className="mt-[.76rem] text-white text-[.32rem]">FAQs</div>

      <CollapseCard
        background="#0A131B"
        mt=".55rem"
        title={
          <div className="text-white text-[.32rem]">
            FAQs the first question?
          </div>
        }
      >
        <div className="text-text2 text-[.24rem] mx-[.56rem]">
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
          The answer for the first question, The answer for the first question,
        </div>
      </CollapseCard>

      <RTokenStakeModal
        tokenName={TokenName.ETH}
        defaultReceivingAddress={metaMaskAccount}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance}
      />
    </div>
  );
};

export default RTokenStakePage;
