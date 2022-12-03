import { TokenName } from "interfaces/common";
import { useEffect } from "react";
// import { getTransactionFees } from "redux/reducers/FisSlice";
import {
  getBondFees,
  getStakeRelayFee,
  getUnbondCommision,
  getUnbondFees,
} from "redux/reducers/MaticSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useTransactionCost(tokenName: TokenName) {
  const dispatch = useAppDispatch();

  const { unbondCommision, unbondFees, bondTxFees, bondFees, unbondTxFees } =
    useAppSelector((state: RootState) => {
      if (tokenName === TokenName.MATIC) {
        return {
          unbondCommision: state.matic.unbondCommision,
          unbondFees: state.matic.unbondFees,
          bondTxFees: state.matic.bondTxFees,
          unbondTxFees: state.matic.unbondTxFees,
          bondFees: state.matic.bondFees,
          relayFee: state.matic,
        };
      }
      return {
        unbondCommision: "--",
        unbondFees: "--",
        bondTxFees: "--",
        unbondTxFees: "--",
        bondFees: "--",
        relayFee: "--",
      };
    });

  useEffect(() => {
    if (tokenName === TokenName.MATIC) {
      dispatch(getUnbondCommision());
      dispatch(getUnbondFees());
      dispatch(getBondFees());
			dispatch(getStakeRelayFee());
    }
  }, [dispatch]);

  return {
    unbondCommision,
    unbondFees,
    bondTxFees,
    unbondTxFees,
    bondFees,
  };
}
