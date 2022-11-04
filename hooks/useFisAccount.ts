import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useFisAccount() {
	const { fisAccounts, fisAccount, stakedAmount } = useAppSelector((state: RootState) => {
		return {
			fisAccounts: state.fis.accounts,
			fisAccount: state.fis.fisAccount,
			stakedAmount: state.fis.stakedAmount,
		}
	});

	return { fisAccounts, fisAccount, stakedAmount };
}