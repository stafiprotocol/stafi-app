declare const window: any;
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

export interface FisAccount {
	address: string;
	meta: {
		genesisHash: string;
		name: string;
		source: string;
	};
	type: string;
}

export interface PolkadotjsState {
  polkadotAccount: string | undefined;
	fisAccounts: FisAccount[];
}

const initialState: PolkadotjsState = {
  polkadotAccount: undefined,
	fisAccounts: [],
};

export const polkadotjsSlice = createSlice({
  name: "polkadotjs",
  initialState,
  reducers: {
    setPolkadotAccount: (
      state: PolkadotjsState,
      action: PayloadAction<string | undefined>
    ) => {
      state.polkadotAccount = action.payload;
    },
		setFisAccounts: (
			state: PolkadotjsState,
			action: PayloadAction<FisAccount[]>
		) => {
			state.fisAccounts = action.payload;
		},
  },
});

export const {
	setPolkadotAccount,
	setFisAccounts,
} = polkadotjsSlice.actions;

export default polkadotjsSlice.reducer;
