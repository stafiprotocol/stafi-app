import { CollapseCard } from "components/common/CollapseCard";
import { RewardChartPanel } from "components/data/RewardChartPanel";
import { MyLayoutContext } from "components/layout/layout";
import { RMaticStakeModal } from "components/modal/RMaticStakeModal";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { useAppSelector } from "hooks/common";
import { ChartDu, TokenName } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { RootState } from "redux/store";
import { usePolkadotAccount } from 'hooks/usePolkadotAccount';
import { ConnectPolkadotjsModal } from "components/modal/ConnectPolkadotjsModal";
import { useAppDispatch } from "hooks/common";
import { updateMaticBalance } from "redux/reducers/MaticSlice";

const RMaticStakePage = () => {
	const { setNavigation, setTargetMetaMaskChainId } =
		React.useContext(MyLayoutContext);
	
	const dispatch = useAppDispatch();

	const [chartDu, setChartDu] = useState(ChartDu.ALL);
	const [stakeModalVisible, setStakeModalVisible] = useState(false);

	const [connectPolkadotjsModalVisible, setConnectPolkadotjsModalVisible] = useState(false);

	const { fisAccounts } = usePolkadotAccount();

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
		setTargetMetaMaskChainId(getMetamaskEthChainId());
	}, [setTargetMetaMaskChainId]);

	const onClickStake = () => {
		// if polkadotAccount is valid
		console.log(fisAccounts)
		if (fisAccounts.length > 0) {
			dispatch(updateMaticBalance());
			setStakeModalVisible(true);
		} else {
			setConnectPolkadotjsModalVisible(true);
		}
	}

	return (
		<div>
			<StakeOverview
				tokeName={TokenName.MATIC}
				onClickStake={onClickStake}
			/>

			<CollapseCard
				background="#0A131B"
				mt=".36rem"
				title={<div className="text-white text-[.32rem]">rMATIC Rewards</div>}
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

			<RMaticStakeModal
				defaultReceivingAddress={fisAccounts[0] ? fisAccounts[0].address : undefined}
				tokenName={TokenName.MATIC}
				visible={stakeModalVisible}
				onClose={() => setStakeModalVisible(false)}
				balance={balance}
			/>

			<ConnectPolkadotjsModal
				visible={connectPolkadotjsModalVisible}
				onClose={() => setConnectPolkadotjsModalVisible(false)}
			/>
		</div>
	)
}

export default RMaticStakePage;