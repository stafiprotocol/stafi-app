import { RootState } from "redux/store";
import { useAppSelector } from "./common";

export function useWalletAccount() {
  const { metaMaskAccount } = useAppSelector((state: RootState) => {
    return {
      metaMaskAccount: state.wallet.metaMaskAccount,
    };
  });

  return { metaMaskAccount };
}
