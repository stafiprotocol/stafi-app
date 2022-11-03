import { createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";

const FisSlice = createSlice({
	name: 'fis',
	initialState: {

	},
	reducers: {

	}
});

export const bound = 
	(
		address: string,
		txHash: string,
		blockHash: string,
		amount: string,
		poolAddress: string,
		type: any,
		chainId: number,
		targetAddress: string,
		cb?: Function
	): AppThunk =>
	async (dispatch, getState) => {
		
	}