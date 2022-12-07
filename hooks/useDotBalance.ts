import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useDotBalance() {
  const dotBalance = useAppSelector((state: RootState) => {
    const polkadotExtensionAccounts = state.wallet.polkadotExtensionAccounts;
    const dotAccount = state.wallet.dotAccount;

    const matched = polkadotExtensionAccounts.find(
      (account) => account.address === dotAccount
    );
    if (matched) {
      return matched.dotBalance;
    } else {
      return "--";
    }
  });

  return dotBalance;
}
