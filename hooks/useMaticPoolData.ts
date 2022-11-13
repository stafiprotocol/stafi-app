import { getDropHost } from "config/env";
import { RequestStatus, TokenName } from "interfaces/common";
import { useCallback, useEffect, useState } from "react";
import { updateRTokenStakerApr } from "redux/reducers/RTokenSlice";
import { RootState } from "redux/store";
import { useAppDispatch, useAppSelector } from "./common";
import { useAppSlice } from "./selector";

export function useMaticPoolData() {
	const { updateFlag15s } = useAppSlice();
	const dispatch = useAppDispatch();
	
	const { maticApr } = useAppSelector((state: RootState) => {
		return {
			maticApr: state.rToken.rTokenStakerAprStore.MATIC,
		}
	});

	const [requestStatus, setRequestStatus] = useState<RequestStatus>(
		RequestStatus.loading
	);
	const [stakedMaticAmount, setStakedMaticAmount] = useState('');
	const [stakedMaticValue, setStakedMaticValue] = useState('');

	const udpatePoolData = useCallback(async () => {
		if (!updateFlag15s) return;
		try {
			const response = await fetch(
				`${getDropHost()}/stafi/v1/webapi/rtoken/stakevalues`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						rsymbols: ['rmatic']
					}),
				}
			);
			const resJson = await response.json();
			if (resJson && resJson.status === '80000') {
				setRequestStatus(RequestStatus.success);
				const { stakeList } = resJson.data;
				if (!Array.isArray(stakeList) || stakeList.length !== 1) return;
				const data = stakeList[0];
				if (data.rsymbol.toLowerCase() === 'rmatic') {
					setStakedMaticValue(data.stakeValue);
					setStakedMaticAmount(data.stakeAmount);
				}
			}
		} catch (err) {
			setRequestStatus(RequestStatus.error);
		}
	}, [updateFlag15s]);

	useEffect(() => {
		udpatePoolData();
	}, [udpatePoolData]);

	useEffect(() => {
		dispatch(
			updateRTokenStakerApr(TokenName.MATIC)
		);
	}, []);

	return {
		requestStatus,
		stakedMaticValue,
		stakedMaticAmount,
		maticApr,
	}
}