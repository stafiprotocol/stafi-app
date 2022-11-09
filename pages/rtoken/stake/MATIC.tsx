import { CollapseCard } from "components/common/CollapseCard";
import { RewardChartPanel } from "components/rtoken/RTokenRewardChartPanel";
import { MyLayoutContext } from "components/layout/layout";
import { RMaticStakeModal } from "components/modal/RMaticStakeModal";
import { StakeMyHistory } from "components/rtoken/StakeMyHistory";
import { StakeOverview } from "components/rtoken/StakeOverview";
import { getMetamaskEthChainId } from "config/metaMask";
import { useAppSelector } from "hooks/common";
import { ChartDu, TokenName } from "interfaces/common";
import React, { useEffect, useState } from "react";
import { RootState } from "redux/store";
import { useAppDispatch } from "hooks/common";
import { getPools, updateMaticBalance } from "redux/reducers/MaticSlice";
import { FisAccount, setAccounts, setFisAccount, updateFisBalance } from "redux/reducers/FisSlice";
import { useFisAccount } from "hooks/useFisAccount";
import { KeyringServer } from "servers/keyring";
import { Symbol } from "keyring/defaults";
import { RTokenIntegrations } from "components/rtoken/RTokenIntegrations";
import { updateRTokenRatio } from "redux/reducers/RTokenSlice";
import { RTokenStakeModal } from "components/modal/RTokenStakeModal";

const RMaticStakePage = () => {
	const { setNavigation, setTargetMetaMaskChainId } =
		React.useContext(MyLayoutContext);
	
	const dispatch = useAppDispatch();

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
		setTargetMetaMaskChainId(getMetamaskEthChainId());
	}, [setTargetMetaMaskChainId]);

	useEffect(() => {
		const conn = async () => {
			const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
			const accounts = await web3Enable('stafi/rtoken').then(async () => await web3Accounts());
			const keyringInstance = new KeyringServer().init(Symbol.Fis);
			const fisAccounts: FisAccount[] = accounts.map(account => {
				const address = keyringInstance.encodeAddress(keyringInstance.decodeAddress(account.address));
				return {
					name: account.meta.name,
					address,
					balance: '--',
				};
			});
			dispatch(setAccounts(fisAccounts));
			if (fisAccounts.length > 1) {
				dispatch(setFisAccount(fisAccounts[1]));
			}
		}
		conn();
	}, []);

	useEffect(() => {
		dispatch(getPools());
	}, []);

	useEffect(() => {
		if (fisAccount.address) {
			dispatch(updateFisBalance());
		}
	}, [fisAccount]);

	const onClickStake = () => {
		// if polkadotAccount is valid
		console.log(fisAccounts)
		if (fisAccounts.length > 0) {
			dispatch(updateMaticBalance());
			setStakeModalVisible(true);
		} else {
		}
	}

	return (
		<div>
			<StakeOverview
				tokenName={TokenName.MATIC}
				onClickStake={onClickStake}
				onClickConnectWallet={() => {}}
			/>

			<CollapseCard
				background="#0A131B"
				mt=".36rem"
				title={<div className="text-white text-[.32rem]">rMATIC Rewards</div>}
			>
				<RewardChartPanel
					tokenName={TokenName.MATIC}
					onClickStake={() => {}}
				/>
			</CollapseCard>

			<StakeMyHistory tokenName={TokenName.MATIC} />

			<RTokenIntegrations tokenName={TokenName.MATIC} />

			<RTokenStakeModal
				defaultReceivingAddress={fisAccounts[1] ? fisAccounts[1].address : undefined}
				tokenName={TokenName.MATIC}
				visible={stakeModalVisible}
				onClose={() => setStakeModalVisible(false)}
				balance={balance}
			/>
		</div>
	)
}

export default RMaticStakePage;