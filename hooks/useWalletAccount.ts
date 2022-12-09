import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useWalletAccount() {
  const {
    metaMaskAccount,
    polkadotExtensionAccounts,
    polkadotAccount,
    polkadotBalance,
    ksmAccount,
    dotAccount,
  } = useAppSelector((state: RootState) => {
    return {
      metaMaskAccount: state.wallet.metaMaskDisconnected
        ? undefined
        : state.wallet.metaMaskAccount,
      polkadotExtensionAccounts: state.wallet.polkadotExtensionAccounts,
      polkadotAccount: state.wallet.polkadotAccount,
      polkadotBalance: state.wallet.polkadotBalance,
      ksmAccount: state.wallet.ksmAccount,
      dotAccount: state.wallet.dotAccount,
    };
  });

  return {
    metaMaskAccount,
    polkadotExtensionAccounts,
    polkadotAccount,
    polkadotBalance,
    ksmAccount,
    dotAccount,
  };
}
