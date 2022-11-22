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
import snackbarUtil from "utils/snackbarUtils";
import { CANCELLED_MESSAGE } from "utils/constants";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

export interface FisAccount {
	name: string | undefined;
	address: string;
	balance: string;
}

export interface FisState {
	chooseAccountVisible: boolean;
  routeNextPage: string | undefined;
}

const initialState: FisState = {
	chooseAccountVisible: false,
  routeNextPage: undefined,
};

const FisSlice = createSlice({
	name: 'fis',
	initialState,
	reducers: {
		setChooseAccountVisible(state: FisState, action: PayloadAction<boolean>) {
			state.chooseAccountVisible = action.payload;
		},
    setRouteNextPage(state: FisState, action: PayloadAction<string | undefined>) {
      state.routeNextPage = action.payload;
    },
	},
});

export const {
	setChooseAccountVisible,
  setRouteNextPage,
} = FisSlice.actions;

export default FisSlice.reducer;

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
		const fisAddress = getState().wallet.polkadotAccount;
		const keyringInstance = keyring.init(Symbol.Fis);
		let signature = '';
		const stafiApi = await stafiServer.createStafiApi();
		let pubkey = '';
		let poolPubKey = poolAddress;
		// todo: other rTokens, here only rMatic
		if (type === rSymbol.Matic) {
			await sleep(3000);

			const metaMaskAccount = getState().wallet.metaMaskAccount;
			const fisPubkey = u8aToHex(keyringInstance.decodeAddress(fisAddress as string), -1, false);
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
		if (chainId === 1) { // stafi chain id
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
			let swapAddress;
			if (chainId === 4) { // sol chain id
				// todo:
			} else {
				swapAddress = targetAddress;
			}
			bondResult = await stafiApi.tx.rTokenSeries.liquidityBondAndSwap(
				pubkey,
				signature,
				poolPubKey,
				blockHash,
				txHash,
				amount,
				type,
				swapAddress,
				chainId,
			)
		};
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
							// dispatch(
							// 	setStakeLoadingParams({
							// 		progressDetail: {
							// 			sending: {
							// 				totalStatus: 'success',
							// 				broadcastStatus: 'success',
							// 				packStatus: 'success',
							// 				finalizeStatus: 'success',
							// 			},
							// 			staking: {
							// 				totalStatus: 'success',
							// 				finalizeStatus: 'success',
							// 			}
							// 		}
							// 	})
							// );
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
					}
				}
			})
		);
		let bondSuccessParamArr: any[] = [];
		bondSuccessParamArr.push(blockHash);
		bondSuccessParamArr.push(txHash);

		dispatch(
			queryRTokenBondState(type, bondSuccessParamArr, (result: string) => {
				if (result === 'successful') {
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
								}
							}
						})
					);
				} else if (result === 'failure') {
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
								}
							}
            })
          );
        }
			})
		);
	}

export const queryRTokenBondState =
	(type: number, bondSuccessParamArr: any, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		const stafiApi = await stafiServer.createStafiApi();
		const result = await stafiApi.query.rTokenSeries.bondStates(type, bondSuccessParamArr);

		let bondState = result.toJSON();
    if (bondState === null || bondState === 'Fail') {
      console.log('mint failure');
      cb && cb('failure');
    } else if (bondState === 'Success') {
      console.log('mint success');
      cb && cb('successful');
    } else {
      console.log('mint pending');
      cb && cb('pending');
      setTimeout(() => {
        dispatch(
          queryRTokenBondState(type, bondSuccessParamArr, cb)
        );
      }, 15000);
    }
	}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fisUnbond =
	(amount: string, symbol: rSymbol, recipient: string, selectedPool: string, topstr: string, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		const address = getState().wallet.polkadotAccount as string;
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
			// @ts-ignore
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
				console.log(err)
				if ((err + '').startsWith('Error: Cancelled')) {
					cb && cb('Cancel');
					snackbarUtil.error(CANCELLED_MESSAGE);
					dispatch(setStakeLoadingParams(undefined));
				} else {
					snackbarUtil.error(err.message);
					dispatch(
						setStakeLoadingParams({
							status: 'error',
						})
					);
				}
			});
	};

export const getUnbondTransactionFees =
	(
		amount: string,
		rsymbol: rSymbol,
		recipient: string,
		selectedPool: string,
		cb?: (fee: string) => void,
	): AppThunk =>
	async (dispatch, getState) => {
		const address = getState().wallet.polkadotAccount as string;
		const api = await stafiServer.createStafiApi();
		
		try {
			const txInfo = await api.tx.rTokenSeries.liquidityUnbond(
				rsymbol,
				selectedPool,
				numberUtil.tokenAmountToChain(amount, rsymbol).toString(),
				recipient,
			).paymentInfo(address);
			const txFee = txInfo.partialFee.toNumber() / 1000000000000;
			cb && cb(txFee.toString());
		} catch (err) {
			console.log(err);
		}
	}

export const getBondTransactionFees =
	(
		amount: string,
		rsymbol: rSymbol,
		chainId: number,
		poolAddress: string,
		cb?: (fee: string) => void,
	): AppThunk =>
	async (dispatch, getState) => {
		const address = getState().wallet.polkadotAccount as string;
		if (!address) return;
		const api = await stafiServer.createStafiApi();
		try {
			let txInfo;
			if (chainId === 1) {
				txInfo = await api.tx.rTokenSeries
					.liquidityBond(
						address,
						'',
						poolAddress,
						'',
						'',
						amount,
						rsymbol,
					)
					.paymentInfo(address);
			} else {
				txInfo = await api.tx.rTokenSeries
					.liquidityBondAndSwap(
						address,
						'',
						poolAddress,
						'',
						'',
						amount,
						rsymbol,
						address,
						chainId,
					)
					.paymentInfo(address);
			}
			console.log(txInfo.partialFee.toHuman())
			const txFee = txInfo.partialFee.toNumber() / 1000000000000;
			cb && cb(txFee.toString());
		} catch (err) {
			console.log(err);
		}
	}
