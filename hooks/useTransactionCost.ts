import { useEffect } from "react";
// import { getTransactionFees } from "redux/reducers/FisSlice";
import { getMaticUnbondTransactionFees, getUnbondCommision, getUnbondFees } from "redux/reducers/MaticSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useTransactionCost() {
	const dispatch = useAppDispatch();

	const { unbondCommision, unbondFees, transactionFees } = useAppSelector((state: RootState) => {
		return {
			unbondCommision: state.matic.unbondCommision,
			unbondFees: state.matic.unbondFees,
			transactionFees: state.matic.transactionFees,
		}
	});

	useEffect(() => {
		dispatch(getUnbondCommision());
		dispatch(getUnbondFees());
	}, [dispatch]);

	return {
		unbondCommision,
		unbondFees,
		transactionFees,
	};
}