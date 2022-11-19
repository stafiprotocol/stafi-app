import { useEffect } from "react";
// import { getTransactionFees } from "redux/reducers/FisSlice";
import { getBondFees, getErc20BridgeFees, getUnbondCommision, getUnbondFees } from "redux/reducers/MaticSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";

export function useTransactionCost() {
	const dispatch = useAppDispatch();

	const { unbondCommision, unbondFees, bondTxFees, erc20BridgeFees, bondFees, unbondTxFees } = useAppSelector((state: RootState) => {
		return {
			unbondCommision: state.matic.unbondCommision,
			unbondFees: state.matic.unbondFees,
			bondTxFees: state.matic.bondTxFees,
			unbondTxFees: state.matic.unbondTxFees,
			erc20BridgeFees: state.matic.erc20BridgeFees,
			bondFees: state.matic.bondFees,
		}
	});

	useEffect(() => {
		dispatch(getUnbondCommision());
		dispatch(getUnbondFees());
		dispatch(getErc20BridgeFees());
		dispatch(getBondFees());
	}, [dispatch]);

	return {
		unbondCommision,
		unbondFees,
		bondTxFees,
		unbondTxFees,
		erc20BridgeFees,
		bondFees,
	};
}