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
		type: any,
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
		console.log('signature succeeded');

		await sleep(5000);

		const { web3Enable, web3FromSource } = await import('@polkadot/extension-dapp');
		web3Enable('stafi/rtoken');
		const injector = await web3FromSource('polkadot-js');

		let bondResult: any;
		// todo: chainId
		if (chainId === 1) {
			bondResult = await stafiApi.tx.rTokenSeries.liquidityBond(
				pubkey,
				signature,
				poolPubKey,
				blockHash,
				txHash,
				amount,
				type,
			);
		} else {

		}

		try {
			let index = 0;
			bondResult.signAndSend(fisAddress, {signer: injector.signer}, (result: any) => {
				if (index === 0) {
					index++;
				}
				if (result.status.isInBlock) {
					
				}
			})
		} catch (err: any) {
			console.error(err);
		}
	}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}