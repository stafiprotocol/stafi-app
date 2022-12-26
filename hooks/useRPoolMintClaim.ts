import { RTokenName } from "interfaces/common";
import { useEffect } from "react";
import { getMintOverview } from "redux/reducers/MintProgramSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useWalletAccount } from "./useWalletAccount";

export function useRPoolMintClaim(rTokenName: RTokenName, cycle: number) {
  const dispatch = useAppDispatch();

  const { polkadotAccount, metaMaskAccount } = useWalletAccount();

  const { mintOverView } = useAppSelector((state: RootState) => {
    return {
      mintOverView: state.mintProgram.mintOverviews[rTokenName],
    };
  });

  useEffect(() => {
    dispatch(getMintOverview(rTokenName, cycle));
  }, [dispatch, rTokenName, cycle, polkadotAccount, metaMaskAccount]);

  return { mintOverView };
}
