import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { getEtherScanTxUrl } from "config/explorer";
import { getMaticAbi, getMaticTokenAddress } from "config/matic";
import { TokenName } from "interfaces/common";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import StafiServer from "servers/stafi";
import numberUtil from "utils/numberUtil";
import snackbarUtil from "utils/snackbarUtils";
import { createWeb3 } from "utils/web3Utils";
import Web3 from 'web3';
import { addNotice, setIsLoading, setStakeLoadingParams } from "./AppSlice";
import CommonSlice from "./CommonSlice";
import { bond, fisUnbond } from "./FisSlice";
import keyring from 'servers/keyring';
import { u8aToHex } from "@polkadot/util";

declare const ethereum: any;

const commonSlice = new CommonSlice();

const stafiServer = new StafiServer();

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
		setValidPools: (state: MaticState, action: PayloadAction<any | null>) => {
			if (action.payload === null) {
				state.validPools = [];
			} else {
				state.validPools.push(action.payload);
			}
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
		willReceiveAmount: string,
		chainId: number,
		targetAddress: string,
		cb?: Function
	): AppThunk => 
	async (dispatch, getState) => {
		try {
			dispatch(setIsLoading(true)); // stake button loading
			dispatch(
				setStakeLoadingParams({
					modalVisible: true,
					status: 'loading',
					tokenName: TokenName.MATIC,
					amount: stakeAmount,
					willReceiveAmount: willReceiveAmount,
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

			const amount = web3.utils.toWei(stakeAmount.toString());

			const validPools = getState().matic.validPools;
			const poolLimit = getState().matic.poolLimit;
			console.log(validPools, poolLimit);

			const selectedPool = commonSlice.getPool(amount, validPools, poolLimit);
			console.log('selectedPool', selectedPool);
			if (!selectedPool) return null;

			const result = await contract.methods
				.transfer(selectedPool.address, amount.toString())
				.send();
			console.log('result', result);
			dispatch(
				setStakeLoadingParams({
					progressDetail: {
						sending: {
							broadcastStatus: 'loading',
						}
					}
				})
			)

			if (result && result.status) {
				snackbarUtil.success('Deposit successfully');
				const txHash = result.transactionHash;
				dispatch(
					addNotice(
						txHash,
						'rToken Stake',
						{
							transactionHash: txHash,
							sender: metaMaskAccount,
						},
						{
							tokenName: TokenName.MATIC,
							amount: stakeAmount,
						},
						getEtherScanTxUrl(result.transactionHash),
						'Confirmed',
					)
				);

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
						console.log('txDetail', txDetail);
						break;
					}
				}

				const blockHash = txDetail && txDetail.blockHash;
				if (!blockHash) {
					dispatch(
						setStakeLoadingParams({
							status: 'error',
							progressDetail: {
								sending: {
									totalStatus: 'error',
									broadcastStatus: 'error',
								}
							}
						})
					);
					console.error('blockHash error');
				}

				console.log('sending succeeded, proceeding signature');
				dispatch(
					setStakeLoadingParams({
						status: 'loading',
						txHash: txHash,
						scanUrl: getEtherScanTxUrl(txHash),
						progressDetail: {
							sending: {
								totalStatus: 'success',
								broadcastStatus: 'success',
								packStatus: 'success',
								finalizeStatus: 'success',
							},
							staking: {
								totalStatus: 'loading',
							}
						}
					})
				);

				blockHash &&
					dispatch(
						bond(
							metaMaskAccount,
							txHash,
							blockHash,
							amount,
							selectedPool.poolPubKey,
							rSymbol.Matic,
							chainId,
							targetAddress,
							(r: string) => {
								console.log('r', r);
							}
						)
					)
			} else {
				const txHash = result.transactionHash;
				dispatch(
					addNotice(
						txHash,
						'rToken Stake',
						{
							transactionHash: txHash,
							sender: metaMaskAccount,
						},
						{
							tokenName: TokenName.MATIC,
							amount: stakeAmount,
						},
						getEtherScanTxUrl(txHash),
						'Error'
					)
				);
				snackbarUtil.error('Error! Please try again');
			}
		} catch (err) {
			console.error(err);
			dispatch(setStakeLoadingParams({
				status: 'error',
			}));
		} finally {
			dispatch(setIsLoading(false));
			dispatch(updateMaticBalance());
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

export const getRMaticRate =
	(cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		const api = await stafiServer.createStafiApi();
		const result = await api.query.rTokenRate.rate(rSymbol.Matic);
		let ratio = numberUtil.rTokenRateToHuman(result.toJSON());
		ratio = ratio || 1;
		cb && cb(ratio);
		return ratio;
	}

export const unbond =
	(amount: string, recipient: string, willAmount: any, cb?: Function): AppThunk =>
	async (dispatch, getState) => {
		try {
			const validPools = getState().matic.validPools;
			let selectedPool = commonSlice.getPoolForUnbond(amount, validPools, rSymbol.Matic);
			if (!selectedPool) {
				cb && cb();
				return;
			}

			const keyringInstance = keyring.init(Symbol.Matic);

			dispatch(
				fisUnbond(
					amount,
					rSymbol.Matic,
					u8aToHex(keyringInstance.decodeAddress(recipient)),
					selectedPool.poolPubKey,
					// todo:
					'Unbond succeeded, unbonding period is around',
					(r?: string, txHash?: string) => {

					}
				)
			)
		} catch (err: any) {
			console.error(err);
		}
	}