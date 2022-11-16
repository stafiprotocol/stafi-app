import { CollapseCard } from "components/common/CollapseCard";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { MyLayoutContext } from "components/layout/layout";
import { RMaticStakeModal } from "components/modal/RMaticStakeModal";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId, getMetamaskMaticChainId } from "config/metaMask";
import { useAppSelector } from "hooks/common";
import { ChartDu, TokenName, TokenStandard } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { RootState } from "redux/store";
import { useAppDispatch } from "hooks/common";
import { getPools, updateMaticBalance } from "redux/reducers/MaticSlice";
import { FisAccount, setAccounts, setFisAccount, updateFisAccounts, updateFisBalance } from "redux/reducers/FisSlice";
import { useFisAccount } from "hooks/useFisAccount";
import { KeyringServer } from "servers/keyring";
import { Symbol } from "keyring/defaults";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { updateRTokenBalance, updateRTokenRatio } from "redux/reducers/RTokenSlice";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";
import { useTokenStandard } from "hooks/useTokenStandard";
import { useWalletAccount } from "hooks/useWalletAccount";

const RMaticStakePage = () => {
	const { setNavigation, setTargetMetaMaskChainId } =
		React.useContext(MyLayoutContext);
	
	const dispatch = useAppDispatch();

	const tokenStandard = useTokenStandard(TokenName.MATIC);

	const { metaMaskAccount } = useWalletAccount();

	const [chartDu, setChartDu] = useState(ChartDu.ALL);
	const [stakeModalVisible, setStakeModalVisible] = useState(false);

	const { fisAccounts, fisAccount, stakedAmount } = useFisAccount();

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
		setTargetMetaMaskChainId(getMetamaskMaticChainId());
	}, [setTargetMetaMaskChainId]);

	useEffect(() => {
		dispatch(updateMaticBalance());
	}, [metaMaskAccount]);

	useEffect(() => {
		dispatch(getPools());
		dispatch(updateFisAccounts());
	}, []);

	useEffect(() => {
		if (fisAccount.address) {
			dispatch(updateFisBalance());
		}
	}, [fisAccount]);

	const onClickStake = () => {
		if (fisAccount.address) {
			dispatch(updateMaticBalance());
			setStakeModalVisible(true);
		} else {
		}
	}

	const getDefaultReceivingAddress = () => {
		if (tokenStandard === TokenStandard.Native) {
			return fisAccount.address;
		}
		return metaMaskAccount;
	}

	return (
		<div>
			<StakeOverview
				tokenName={TokenName.MATIC}
				onClickStake={onClickStake}
				onClickConnectWallet={() => {}}
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
	)
}

export default RMaticStakePage;