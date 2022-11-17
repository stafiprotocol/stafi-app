import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useWalletAccount() {
  const {
    metaMaskAccount,
    polkadotAccount,
    polkadotBalance,
    polkadotExtensionAccounts,
  } = useAppSelector((state: RootState) => {
    return {
      metaMaskAccount: state.wallet.metaMaskAccount,
      polkadotAccount: state.wallet.polkadotAccount,
      polkadotBalance: state.wallet.polkadotBalance,
      polkadotExtensionAccounts: state.wallet.polkadotExtensionAccounts,
    };
  });

  return {
    metaMaskAccount,
    polkadotAccount,
    polkadotBalance,
    polkadotExtensionAccounts,
  };
}
