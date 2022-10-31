import { CollapseCard } from "components/common/CollapseCard";
import { RewardChartPanel } from "components/data/RewardChartPanel";
import { MyLayoutContext } from "components/layout/layout";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { useAppSelector } from "hooks/common";
import { ChartDu, TokenName } from "interfaces/common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { RootState } from "redux/store";

const RTokenStakePage = () => {
  const { setNavigation, setTargetMetaMaskChainId } =
    React.useContext(MyLayoutContext);
  const router = useRouter();
  const [chartDu, setChartDu] = useState(ChartDu.ALL);
  const [stakeModalVisible, setStakeModalVisible] = useState(false);

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
  }, [setTargetMetaMaskChainId]);

  return (
    <div>
      <StakeOverview
        tokeName={TokenName.ETH}
        onClickStake={() => setStakeModalVisible(true)}
      />

      <CollapseCard
        background="#0A131B"
        mt=".36rem"
        title={<div className="text-white text-[.32rem]">rETH Rewards</div>}
      >
        <RewardChartPanel
          chartXData={["0", "1", "2"]}
          chartYData={["10", "11", "12"]}
          chartDu={chartDu}
          setChartDu={setChartDu}
          lastEraReward="0.0001"
          totalToken="11"
          totalTokenValue="1827.19"
          last24hToken="0.1"
          last24hTokenValue="188.1"
        />
      </CollapseCard>

      <StakeMyHistory />

      <RTokenStakeModal
        tokenName={TokenName.ETH}
        visible={stakeModalVisible}
        onClose={() => setStakeModalVisible(false)}
        balance={balance}
      />
    </div>
  );
};

export default RTokenStakePage;
