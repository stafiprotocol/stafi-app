import { TokenName, TokenStandard } from "interfaces/common";
import { useEffect } from "react";
// import { getTransactionFees } from "redux/reducers/FisSlice";
import {
  getBondFees as getMaticBondFee,
  getStakeRelayFee as getMaticStakeRelayFee,
  getUnbondCommision as getMaticUnbondCommision,
  getUnbondFees as getMaticUnbondFee,
} from "redux/reducers/MaticSlice";
import {
  getBondFee as getBnbBondFee,
  getUnbondCommision as getBnbUnbondCommision,
  getUnbondFee as getBnbUnbondFee,
} from "redux/reducers/BnbSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useTransactionCost(
  tokenName: TokenName,
  tokenStandard: TokenStandard
) {
  const dispatch = useAppDispatch();

  const {
    unbondCommision,
    unbondFees,
    bondTxFees,
    bondFees,
    unbondTxFees,
    relayFee,
  } = useAppSelector((state: RootState) => {
    if (tokenName === TokenName.MATIC) {
      return {
        unbondCommision: state.matic.unbondCommision,
        unbondFees: state.matic.unbondFees,
        bondTxFees: state.matic.bondTxFees,
        unbondTxFees: state.matic.unbondTxFees,
        bondFees: state.matic.bondFees,
        relayFee: state.matic.relayFee,
      };
    } else if (tokenName === TokenName.BNB) {
      return {
        bondFees: state.bnb.bondFee,
        unbondFees: state.bnb.unbondFee,
        relayFee: "--",
				unbondCommision: state.bnb.unbondCommision,
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
      dispatch(getMaticUnbondCommision());
      dispatch(getMaticUnbondFee());
      dispatch(getMaticBondFee());
      dispatch(getMaticStakeRelayFee());
    } else if (tokenName === TokenName.BNB) {
			dispatch(getBnbBondFee());
			dispatch(getBnbUnbondCommision());
			dispatch(getBnbUnbondFee());
		}
  }, [dispatch]);

  return {
    unbondCommision,
    unbondFees,
    bondTxFees,
    unbondTxFees,
    bondFees,
    relayFee,
  };
}
