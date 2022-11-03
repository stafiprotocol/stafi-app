import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { getMaticAbi, getMaticTokenAddress } from "config/matic";
import { TokenName } from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import { createWeb3 } from "utils/web3Utils";
import Web3 from 'web3';
import { setIsLoading, setStakeLoadingParams } from "./AppSlice";
import CommonSlice from "./CommonSlice";
import { bound } from "./FisSlice";

declare const ethereum: any;

const commonSlice = new CommonSlice();

export interface MaticState {
	txLoading: boolean;
	balance: string;
	validPools: any[];
	poolLimit: any;
}

const initialState: MaticState = {
	txLoading: false,
	balance: "",
	validPools: [],
	poolLimit: 0,
}

export const maticSlice = createSlice({
	name: "matic",
	initialState,
	reducers: {
		setMaticTxLoading: (state: MaticState, action: PayloadAction<boolean>) => {
			state.txLoading = action.payload;
		},
		setMaticBalance: (state: MaticState, action: PayloadAction<string>) => {
			state.balance = action.payload;
		},
		setValidPools: (state: MaticState, action: PayloadAction<any[]>) => {

		},
		setPoolLimit: (state: MaticState, action: PayloadAction<any>) => {
			state.poolLimit = action.payload;
		},
	}
});

export const {
	setMaticBalance,
	setMaticTxLoading,
	setPoolLimit,
	setValidPools,
} = maticSlice.actions;

export default maticSlice.reducer;

export const updateMaticBalance = (): AppThunk => async (dispatch, getState) => {
	const account = getState().wallet.metaMaskAccount;
	if (!account) return;
	if (!window.ethereum) return;

	let web3 = new Web3(window.ethereum as any);
	let contract = new web3.eth.Contract(getMaticAbi(), getMaticTokenAddress(), {
		from: account
	});

	try {
		contract.methods
			.balanceOf(account)
			.call()
			.then((balance: any) => {
				dispatch(setMaticBalance(Web3.utils.fromWei(balance.toString())));
			})
			.catch((e: any) => {
				console.error(e);
			})
	} catch (e) {
		console.error(e);
	}
}

export const handleMaticStake = 
	(
		stakeAmount: string,
		chainId: number,
		targetAddress: string,
		cb?: Function
	): AppThunk => 
	async (dispatch, getState) => {
		dispatch(setIsLoading(true));
		dispatch(
			setStakeLoadingParams({
				modalVisible: true,
				status: 'loading',
				tokenName: TokenName.MATIC,
				amount: stakeAmount,
				willReceiveAmount: stakeAmount,
				progressDetail: {
					sending: {
						totalStatus: 'loading',
					},
				},
			})
		);

		const metaMaskAccount = getState().wallet.metaMaskAccount;
		if (!metaMaskAccount) {
			throw new Error('Please connect MetaMask');
		}
		
		const web3 = createWeb3();
		const contract = new web3.eth.Contract(
			getMaticAbi(),
			getMaticTokenAddress(),
			{
				from: metaMaskAccount,
			}
		);

		const amount = web3.utils.toWei(stakeAmount);

		const validPools = getState().matic.validPools;
		const poolLimit = getState().matic.poolLimit;

		const selectedPool = commonSlice.getPool(amount, validPools, poolLimit);
		console.log('selectedPool', selectedPool);
		if (!selectedPool) return null;

		const sendTokens = await contract.methods.transfer(selectedPool.address, amount).send();
		console.log('sendTokens', sendTokens);
		if (sendTokens && sendTokens.status) {
			const txHash = sendTokens.transactionHash;
			let txDetail;
			while (true) {
				await sleep(5000);
				txDetail = await ethereum
					.request({
						method: 'eth_getTransactionByHash',
						params: [txHash],
					})
					.catch((err: any) => {
						console.error(err);
					});

				if (txDetail.blockHash || !txDetail) {
					break;
				}
			}

			console.log('txDetail', txDetail);
			const blockHash = txDetail && txDetail.blockHash;
			if (!blockHash) {

			}

			blockHash &&
				dispatch(
					bound(
						metaMaskAccount,
						txHash,
						blockHash,
						amount,
						'',
						'MATIC',
						1,
						targetAddress,
						() => {

						}
					)
				)
		}
	}

const sleep = (ms: number) => {
	return new Promise(resolve => setTimeout(resolve, ms));
}
export const getPools = 
	(cb?: Function): AppThunk => 
	async (dispatch, getState) => {
		commonSlice.getPools(rSymbol.Matic, Symbol.Matic, (data: any) => {
			dispatch(setValidPools(data));
			console.log('pools', data);
			cb && cb();
		});

		const data = await commonSlice.poolBalanceLimit(rSymbol.Matic);
		dispatch(setPoolLimit(data));
		console.log('poolLimit', data);
	}
