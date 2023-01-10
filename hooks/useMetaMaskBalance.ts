import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useMetaMaskBalance() {
  const { ethBalance, maticBalance, bnbBalance } = useAppSelector(
    (state: RootState) => {
      return {
        ethBalance: state.eth.balance,
        maticBalance: state.matic.balance,
        bnbBalance: state.bnb.balance,
      };
    }
  );

  return {
    ethBalance,
    maticBalance,
    bnbBalance,
  };
}
