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

const getTokenAbi = () => {
	const abi =
		'[{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"addMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"renounceMinter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"}],"name":"MinterAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"account","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"}]';
	return JSON.parse(abi);
}

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
		callback?: (success: boolean, result: any) => void
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
		// todo: pool

		let selectedPool = null;
		// todo: selectedPool.address
		const sendTokens = await contract.methods.transfer(selectedPool, amount).send();
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
			cb && cb();
		});

		const data = await commonSlice.poolBalanceLimit(rSymbol.Matic);
		dispatch(setPoolLimit(data));
	}
