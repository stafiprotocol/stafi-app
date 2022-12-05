import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useKsmBalance() {
  const ksmBalance = useAppSelector((state: RootState) => {
    const polkadotExtensionAccounts = state.wallet.polkadotExtensionAccounts;
    const ksmAccount = state.wallet.ksmAccount;

    const matched = polkadotExtensionAccounts.find(
      (account) => account.address === ksmAccount
    );
    if (matched) {
      return matched.ksmBalance;
    } else {
      return "--";
    }
  });

  return ksmBalance;
}
