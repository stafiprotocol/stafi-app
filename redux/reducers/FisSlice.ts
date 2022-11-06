import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import CommonSlice from "./CommonSlice";
import numberUtil from "utils/numberUtil";
import keyring from 'servers/keyring';
import StafiServer from "servers/stafi";
import { stringToHex, u8aToHex } from "@polkadot/util";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

export interface FisAccount {
	name: string | undefined;
	address: string;
	balance: string;
}

export interface FisState {
	fisAccount: FisAccount;
	accounts: FisAccount[];
	stakedAmount: number | string;
}

const initialState: FisState = {
	fisAccount: {
		name: '',
		address: '',
		balance: '--',
	},
	accounts: [],
	stakedAmount: '--',
};

const FisSlice = createSlice({
	name: 'fis',
	initialState,
	reducers: {
		setFisAccount(state: FisState, action: PayloadAction<FisAccount>) {
			state.fisAccount = action.payload;
		},
		setAccounts(state: FisState, action: PayloadAction<FisAccount[]>) {
			state.accounts = action.payload;
		},
		setStakedAmount(state: FisState, action: PayloadAction<number | string>) {
			state.stakedAmount = action.payload;
		},
	},
});

export const {
	setFisAccount,
	setAccounts,
	setStakedAmount,
} = FisSlice.actions;

export default FisSlice.reducer;

export const updateFisBalance = (): AppThunk => async (dispatch, getState) => {
	const account = getState().fis.fisAccount;
	if (!account.address) return;
	const data: any = await commonSlice.queryRBalance(account.address, rSymbol.Matic);
	if (data) {
		dispatch(setStakedAmount(numberUtil.tokenAmountToHuman(data.free, rSymbol.Matic)));
	} else {
		dispatch(setStakedAmount(numberUtil.handleFisAmountToFixed(0)));
	}
}

export const bound = 
	(
		address: string,
		txHash: string,
		blockHash: string,
		amount: string,
		poolAddress: string,
		type: rSymbol,
		chainId: number,
		targetAddress: string,
		cb?: Function
	): AppThunk =>
	async (dispatch, getState) => {
		const fisAddress = getState().fis.fisAccount.address;
		const keyringInstance = keyring.init(Symbol.Fis);
		let signature = '';
		const stafiApi = await stafiServer.createStafiApi();
		let pubkey = '';
		let poolPubKey = poolAddress;
		// todo: other rTokens, here only rMatic
		if (type === rSymbol.Matic) {
			await sleep(3000);

			const metaMaskAccount = getState().wallet.metaMaskAccount;
			const fisPubkey = u8aToHex(keyringInstance.decodeAddress(fisAddress), -1, false);
			const msg = stringToHex(fisPubkey);
			pubkey = address;
			signature = await ethereum
				.request({
					method: 'personal_sign',
					params: [metaMaskAccount, msg],
				})
				.catch((err: any) => {
					console.error(err);
				});
			console.log('signature succeeded, proceeding staking');
		}

		await sleep(5000);

		const { web3Enable, web3FromSource } = await import('@polkadot/extension-dapp');
		web3Enable('stafi/rtoken');
		const injector = await web3FromSource('polkadot-js');

		let bondResult: any;
		// todo: chainId
		console.log('stafiApi', stafiApi);
		if (chainId === 1) {
			bondResult = await stafiApi.tx.rTokenSeries.liquidityBond(
				pubkey,
				signature,
				poolPubKey,
				blockHash,
				txHash,
				amount.toString(),
				type,
			);
			console.log({
				pubkey,
				signature,
				poolPubKey,
				blockHash,
				txHash,
				amount,
				type,
			});
		} else {

		}
		console.log(bondResult);

		try {
			let index = 0;
			console.log(fisAddress, injector.signer)
			bondResult
				.signAndSend(fisAddress, {signer: injector.signer}, (result: any) => {
					if (index === 0) {
						index++;
					}
					const tx = bondResult.hash.toHex();
					try {
						if (result.status.isInBlock) {
							console.log('inBlock');
							console.log('events', result.events);
							result.events
								.filter((e: any) => e.event.section === 'system')
								.forEach((data: any) => {
									console.log(data.event.method);
									if (data.event.method === 'ExtrinsicFailed') {
										const [dispatchError] = data.event.data;
										if (dispatchError.isModule) {
											try {
												const mod = dispatchError.asModule;
												const error = data.registry.findMetaError(
													new Uint8Array([mod.index.toNumber(), mod.error.toNumber()]),
												);

												let msgStr = 'Something is wrong, please try again later';
												if (error.name === '') {
													msgStr = '';
												}
												msgStr && console.log(msgStr);
											} catch (err) {
												console.error(err);
											}
											console.log('fail')
										}
									} else if (data.event.method === 'ExtrinsicSuccess') {
										dispatch(
											getMinting(type, txHash, blockHash)
										);
										console.log('loading');
									}
								});
						} else if (result.isError) {
							console.log(result.toHuman());
						}
						if (result.status.isFinalized) {
							console.log('finalized');
						}
					} catch (err) {
						console.error(err);
					}
			})
			.catch((err: any) => {
				console.log(err);
			})
		} catch (err: any) {
			console.error(err);
		}
	}

export const getMinting =
	(type: number, txHash: string, blockHash: string, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		let bondSuccessParamArr: any[] = [];
		bondSuccessParamArr.push(blockHash);
		bondSuccessParamArr.push(txHash);
		let statusObj = {
			num: 0,
		};
		dispatch(
			rTokenSeriesBondStates(type, bondSuccessParamArr, statusObj)
		);
	}

export const rTokenSeriesBondStates =
	(type: number, bondSuccessParamArr: any, statusObj: any, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		statusObj.num = statusObj.num + 1;
		const stafiApi = await stafiServer.createStafiApi();
		const result = await stafiApi.query.rTokenSeries.bondStates(type, bondSuccessParamArr);

		let bondState = result.toJSON();
		if (bondState === 'Success') {
			console.log('success')
		} else if (bondState === 'Fail') {
			console.log('failer')
		} else if (bondState === null) {
			console.log('stakingFailure')
		} else if (statusObj.num <= 40) {
			console.log('pending')
		} else {
			console.log('failure')
		}
	}
function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
