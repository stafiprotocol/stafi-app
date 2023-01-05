import { TokenName, TokenStandard } from "interfaces/common";
import { useEffect } from "react";
import {
  getDotBondFees,
  getDotUnbondCommision,
  getDotUnbondFees,
} from "redux/reducers/DotSlice";
import {
  getKsmBondFees,
  getKsmUnbondCommision,
  getKsmUnbondFees,
  getKsmUnbondTxFees,
} from "redux/reducers/KsmSlice";
// import { getTransactionFees } from "redux/reducers/FisSlice";
import {
  getBondFees as getMaticBondFee,
  getStakeRelayFee as getMaticStakeRelayFee,
  getUnbondCommision as getMaticUnbondCommision,
  getUnbondFees as getMaticUnbondFee,
} from "redux/reducers/MaticSlice";
import {
	getBnbStakeRelayFee,
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
        relayFee: state.bnb.relayFee,
				unbondCommision: state.bnb.unbondCommision,
			};
    } else if (tokenName === TokenName.KSM) {
      return {
        unbondCommision: state.ksm.unbondCommision,
        unbondFees: state.ksm.unbondFees,
        bondTxFees: state.ksm.bondTxFees,
        unbondTxFees: state.ksm.unbondTxFees,
        bondFees: state.ksm.bondFees,
        relayFee: "--",
      };
    } else if (tokenName === TokenName.DOT) {
      return {
        unbondCommision: state.dot.unbondCommision,
        unbondFees: state.dot.unbondFees,
        bondTxFees: state.dot.bondTxFees,
        unbondTxFees: state.dot.unbondTxFees,
        bondFees: state.dot.bondFees,
        relayFee: "--",
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
			dispatch(getBnbStakeRelayFee());
		} else if (tokenName === TokenName.KSM) {
      dispatch(getKsmUnbondCommision());
      dispatch(getKsmUnbondFees());
      dispatch(getKsmBondFees());
    } else if (tokenName === TokenName.DOT) {
      dispatch(getDotUnbondCommision());
      dispatch(getDotUnbondFees());
      dispatch(getDotBondFees());
    }
  }, [dispatch, tokenName]);

  return {
    unbondCommision,
    unbondFees,
    bondTxFees,
    unbondTxFees,
    bondFees,
    relayFee,
  };
}
