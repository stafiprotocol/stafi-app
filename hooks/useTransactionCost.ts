import { useEffect } from "react";
// import { getTransactionFees } from "redux/reducers/FisSlice";
import { getBondFees, getUnbondCommision, getUnbondFees } from "redux/reducers/MaticSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useTransactionCost() {
	const dispatch = useAppDispatch();

	const { unbondCommision, unbondFees, bondTxFees, bondFees, unbondTxFees } = useAppSelector((state: RootState) => {
		return {
			unbondCommision: state.matic.unbondCommision,
			unbondFees: state.matic.unbondFees,
			bondTxFees: state.matic.bondTxFees,
			unbondTxFees: state.matic.unbondTxFees,
			bondFees: state.matic.bondFees,
		}
	});

	useEffect(() => {
		dispatch(getUnbondCommision());
		dispatch(getUnbondFees());
		dispatch(getBondFees());
	}, [dispatch]);

	return {
		unbondCommision,
		unbondFees,
		bondTxFees,
		unbondTxFees,
		bondFees,
	};
}
