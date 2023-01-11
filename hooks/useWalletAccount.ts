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
    solanaAccount,
    solanaBalance,
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
      solanaAccount: state.wallet.phantomDisconnected
        ? undefined
        : state.wallet.solanaAccount,
      solanaBalance: state.wallet.solanaBalance,
    };
  });

  return {
    metaMaskAccount,
    polkadotExtensionAccounts,
    polkadotAccount,
    polkadotBalance,
    ksmAccount,
    dotAccount,
    solanaAccount,
    solanaBalance,
  };
}
