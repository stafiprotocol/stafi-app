import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function usePolkadotAccount() {
  const { polkadotAccount, fisAccounts } = useAppSelector((state: RootState) => {
    return {
      polkadotAccount: state.polkadotjs.polkadotAccount,
			fisAccounts: state.polkadotjs.fisAccounts,
    };
  });

  return { polkadotAccount, fisAccounts };
}
