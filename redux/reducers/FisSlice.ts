import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import CommonSlice from "./CommonSlice";
import numberUtil from "utils/numberUtil";
import keyring from 'servers/keyring';
import StafiServer from "servers/stafi";
import { stringToHex, u8aToHex } from "@polkadot/util";
import { setStakeLoadingParams } from "./AppSlice";
import { getLocalStorageItem } from "utils/common";
import { connectPolkadot } from "utils/web3Utils";

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
	chooseAccountVisible: boolean;
}

const localStoredAccount: FisAccount = getLocalStorageItem('stafi_fis_account') ?
	{...getLocalStorageItem('stafi_fis_account'), balance: '--'}
	:
	{
		name: '',
		address: '',
		balance: '--',
	};

const initialState: FisState = {
	fisAccount: localStoredAccount,
	accounts: [],
	stakedAmount: '--',
	chooseAccountVisible: false,
};

const FisSlice = createSlice({
	name: 'fis',
	initialState,
	reducers: {
		setFisAccount(state: FisState, action: PayloadAction<FisAccount>) {
			state.fisAccount = action.payload;
			localStorage.setItem('stafi_fis_account', JSON.stringify({address: action.payload.address}));
		},
		setAccounts(state: FisState, action: PayloadAction<FisAccount[]>) {
			state.accounts = action.payload;
		},
		setFisAccounts(state: FisState, action: PayloadAction<FisAccount>) {
			const newAccount = action.payload;
			const accounts = state.accounts;
			const account = accounts.find((acc: FisAccount) => acc.address === newAccount.address);
			if (account) {
				account.balance = newAccount.balance;
				account.name = newAccount.name;
			} else {
				accounts.push(newAccount);
			}
		},
		setStakedAmount(state: FisState, action: PayloadAction<number | string>) {
			state.stakedAmount = action.payload;
		},
		setChooseAccountVisible(state: FisState, action: PayloadAction<boolean>) {
			state.chooseAccountVisible = action.payload;
		},
	},
});

export const {
	setFisAccount,
	setAccounts,
	setFisAccounts,
	setStakedAmount,
	setChooseAccountVisible,
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

export const updateFisAccounts = (): AppThunk => async (dispatch, getState) => {
	const accounts = await connectPolkadot();
	dispatch(setAccounts(accounts));
	if (accounts.length === 0) {
		dispatch(setFisAccount({name: '', address: '', balance: '--'}));
	} else {
		const fisAccount = getState().fis.fisAccount;
		const _account = accounts.find((acc: FisAccount) => acc.address === fisAccount.address);
		if (!_account) {
			dispatch(setFisAccount(accounts[0]));
			dispatch(setFisAccounts(accounts[0]));
		}
	}
}

export const queryBalance = (account: FisAccount): AppThunk =>
	async (dispatch, getState) => {
		dispatch(setFisAccounts(account));
		let _account = {...account};
		const api = await stafiServer.createStafiApi();
		const result = await api.query.system.account(account.address);
		if (result) {
			const freeBalance = numberUtil.fisAmountToHuman(result.data.free);
			_account.balance = numberUtil.handleEthAmountRound(freeBalance).toString();
		}
		const fisAccount = getState().fis.fisAccount;
		if (fisAccount && fisAccount.address === _account.address) {
			dispatch(setFisAccount(_account));
		}
		dispatch(setFisAccounts(_account));
	}

export const updateFisBalances = (): AppThunk => async (dispatch, getState) => {
	const accounts = getState().fis.accounts;
	if (accounts.length === 0) return;
	let queries: Promise<any>[] = [];
	accounts.forEach(async (account: FisAccount) => {
		queries.push(commonSlice.queryRBalance(account.address, rSymbol.Matic));
	});

	let newAccounts: FisAccount[] = [];
	Promise.all(queries).then((datas: any[]) => {
		for (let i = 0; i < accounts.length; i++) {
			let balance = '--';
			if (datas[i]) {
				balance = numberUtil.fisAmountToHuman(datas[i].free).toString();
			}
			let _account: FisAccount = {
				...accounts[i],
				balance,
			}
			newAccounts.push(_account);
		}
		dispatch(
			setAccounts(newAccounts)
		);
	});
}

export const bond = 
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
		dispatch(
			setStakeLoadingParams({
				progressDetail: {
					sending: {
						totalStatus: 'success',
						broadcastStatus: 'success',
						packStatus: 'success',
						finalizeStatus: 'success',
					},
					staking: {
						broadcastStatus: 'loading',
					}
				}
			})
		);
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
					dispatch(
						setStakeLoadingParams({
							status: 'error',
							progressDetail: {
								staking: {
									totalStatus: 'error',
									broadcastStatus: 'error',
								}
							}
						})
					);
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
					// const tx = bondResult.hash.toHex();
					try {
						if (result.status.isInBlock) {
							dispatch(
								setStakeLoadingParams({
									progressDetail: {
										sending: {
											totalStatus: 'success',
											broadcastStatus: 'success',
											packStatus: 'success',
											finalizeStatus: 'success',
										},
										staking: {
											broadcastStatus: 'success',
											packStatus: 'loading',
										}
									}
								})
							);
							console.log('inBlock');
							// console.log('events', result.events);
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
										dispatch(
											setStakeLoadingParams({
												status: 'error',
												progressDetail: {
													staking: {
														totalStatus: 'error',
														packStatus: 'error',
													}
												}
											})
										);
									} else if (data.event.method === 'ExtrinsicSuccess') {
										dispatch(
											setStakeLoadingParams({
												progressDetail: {
													sending: {
														totalStatus: 'success',
														broadcastStatus: 'success',
														packStatus: 'success',
														finalizeStatus: 'success',
													},
													staking: {
														packStatus: 'success',
														finalizeStatus: 'loading',
													}
												}
											})
										);
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
							dispatch(
								setStakeLoadingParams({
									progressDetail: {
										sending: {
											totalStatus: 'success',
											broadcastStatus: 'success',
											packStatus: 'success',
											finalizeStatus: 'success',
										},
										staking: {
											totalStatus: 'success',
											finalizeStatus: 'success',
										}
									}
								})
							);
							console.log('finalized');
						}
					} catch (err) {
						console.error(err);
					}
			})
			.catch((err: any) => {
				if (err === 'Error: Cancelled') {
					dispatch(
						setStakeLoadingParams({
							status: 'error',
							progressDetail: {
								sending: {
									totalStatus: 'success',
									broadcastStatus: 'success',
									packStatus: 'success',
									finalizeStatus: 'success',
								},
								staking: {
									totalStatus: 'error',
									broadcastStatus: 'error',
								}
							}
						})
					);
				}
				console.log(err);
			})
		} catch (err: any) {
			console.error(err);
		}
	}

export const getMinting =
	(type: number, txHash: string, blockHash: string, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		dispatch(
			setStakeLoadingParams({
				progressDetail: {
					sending: {
						totalStatus: 'success',
						broadcastStatus: 'success',
						packStatus: 'success',
						finalizeStatus: 'success',
					},
					staking: {
						totalStatus: 'success',
						broadcastStatus: 'success',
						packStatus: 'success',
						finalizeStatus: 'success',
					},
					minting: {
						totalStatus: 'loading',
						broadcastStatus: 'loading',
					}
				}
			})
		);
		let bondSuccessParamArr: any[] = [];
		bondSuccessParamArr.push(blockHash);
		bondSuccessParamArr.push(txHash);
		let statusObj = {
			num: 0,
		};
		dispatch(
			rTokenSeriesBondStates(type, bondSuccessParamArr, statusObj, (e: string) => {
				if (e === 'successful') {
					dispatch(
						setStakeLoadingParams({
							status: 'success',
							progressDetail: {
								sending: {
									totalStatus: 'success',
									broadcastStatus: 'success',
									packStatus: 'success',
									finalizeStatus: 'success',
								},
								staking: {
									totalStatus: 'success',
									broadcastStatus: 'success',
									packStatus: 'success',
									finalizeStatus: 'success',
								},
								minting: {
									totalStatus: 'success',
									broadcastStatus: 'success',
									packStatus: 'success',
									finalizeStatus: 'success',
								}
							}
						})
					);
				}
			})
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
			dispatch(
				setStakeLoadingParams({
					progressDetail: {
						sending: {
							totalStatus: 'success',
							broadcastStatus: 'success',
							packStatus: 'success',
							finalizeStatus: 'success',
						},
						staking: {
							totalStatus: 'success',
							broadcastStatus: 'success',
							packStatus: 'success',
							finalizeStatus: 'success',
						},

						minting: {
							broadcastStatus: 'success',
						}
					}
				})
			);
			cb && cb('successful');
			console.log('success')
		} else if (bondState === 'Fail') {
			dispatch(
				setStakeLoadingParams({
					status: 'error',
					progressDetail: {
						sending: {
							totalStatus: 'success',
							broadcastStatus: 'success',
							packStatus: 'success',
							finalizeStatus: 'success',
						},
						staking: {
							totalStatus: 'success',
							broadcastStatus: 'success',
							packStatus: 'success',
							finalizeStatus: 'success',
						},
						minting: {
							totalStatus: 'error',
							broadcastStatus: 'error',
						}
					}
				})
			);
			cb && cb('failure');
			console.log('failer')
		} else if (bondState === null) {
			cb && cb('stakingFailure');
			console.log('stakingFailure')
		} else if (statusObj.num <= 40) {
			cb && cb('pending');
			setTimeout(() => {
				dispatch(
					rTokenSeriesBondStates(type, bondSuccessParamArr, statusObj, cb)
				);
			}, 15000);
			console.log('pending')
		} else {
			dispatch(
				setStakeLoadingParams({
					status: 'error',
					progressDetail: {
						sending: {
							totalStatus: 'success',
							broadcastStatus: 'success',
							packStatus: 'success',
							finalizeStatus: 'success',
						},
						staking: {
							totalStatus: 'success',
							broadcastStatus: 'success',
							packStatus: 'success',
							finalizeStatus: 'success',
						},
						minting: {
							totalStatus: 'error',
							broadcastStatus: 'error',
						}
					}
				})
			);
			cb && cb('failure');
			console.log('failure')
		}
	}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fisUnbond =
	(amount: string, symbol: rSymbol, recipient: string, selectedPool: string, topstr: string, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		const address = getState().fis.fisAccount && getState().fis.fisAccount.address;
		const api = await stafiServer.createStafiApi();
		
		const { web3Enable, web3FromSource } = await import('@polkadot/extension-dapp');
		web3Enable(stafiServer.getWeb3EnableName());
		const injector = await web3FromSource(stafiServer.getPolkadotJsSource());

		dispatch(
			setStakeLoadingParams({
				progressDetail: {
					sending: {
						broadcastStatus: 'loading',
					}
				}
			})
		);

		const unbondResult = await api.tx.rTokenSeries.liquidityUnbond(
			symbol,
			selectedPool,
			numberUtil.tokenAmountToChain(amount, symbol).toString(),
			recipient,
		);

		unbondResult
			.signAndSend(address, { signer: injector.signer }, (result: any) => {
				try {
					if (result.status.isInBlock) {
						result.events
							.filter((e: any) => e.event.section === 'system')
							.forEach((data: any) => {
								if (data.event.method === 'ExtrinsicSuccess') {
									const txHash = unbondResult.hash.toHex();
									cb && cb('Success', txHash);
									console.log('success');
									dispatch(
										setStakeLoadingParams({
											status: 'success',
											progressDetail: {
												sending: {
													totalStatus: 'success',
												}
											}
										})
									);
								} else if (data.event.method === 'ExtrinsicFailed') {
									cb && cb('Failed');
									console.error('failed');
									dispatch(
										setStakeLoadingParams({
											status: 'error',
											progressDetail: {
												sending: {
													totalStatus: 'error',
												}
											}
										})
									);
								}
							});
					}
				} catch (err: any) {
					cb && cb('Failed');
				}
			})
			.catch((err: any) => {
				if (err === 'Error: Cancelled') {
					cb && cb('Cancel');
				} else {

				}
			});
	};
