import { ApiPromise } from "@polkadot/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import type ExtType from "@polkadot/extension-inject/types";
import { convertToSS58 } from "utils/common";
import {
  getStorage,
  saveStorage,
  STORAGE_KEY_POLKADOT_ACCOUNT,
  STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG,
} from "utils/storage";
import { chainAmountToHuman } from "utils/number";
import { TokenSymbol } from "interfaces/common";

export interface InjectedPolkadotAccountWithMeta
  extends ExtType.InjectedAccountWithMeta {
  balance?: string;
}

export type PolkadotWalletStatus =
  | "pending"
  | "connecting"
  | "success"
  | "fail"
  | "disconnected";

export interface WalletState {
  metaMaskAccount: string | undefined;
  polkadotWalletStatus: PolkadotWalletStatus;
  polkadotExtensionAccounts: InjectedPolkadotAccountWithMeta[] | undefined;
  polkadotAccount: string | undefined;
  polkadotBalance: string;
}

const initialState: WalletState = {
  metaMaskAccount: undefined,
  polkadotWalletStatus: "pending",
  polkadotAccount: "5FTw7Z3L9ypHfpZ93V2NuUebmNgJd3bqHeEnpBDLyZ9HzRpb",
  polkadotExtensionAccounts: undefined,
  polkadotBalance: "--",
};

export const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setMetaMaskAccount: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      state.metaMaskAccount = action.payload;
    },
    setPolkadotWalletStatus: (
      state: WalletState,
      action: PayloadAction<PolkadotWalletStatus>
    ) => {
      state.polkadotWalletStatus = action.payload;
    },
    setPolkadotAccount: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      state.polkadotAccount = action.payload;
    },
    setPolkadotExtensionAccounts: (
      state: WalletState,
      action: PayloadAction<InjectedPolkadotAccountWithMeta[] | undefined>
    ) => {
      state.polkadotExtensionAccounts = action.payload;
    },
    setPolkadotBalance: (state: WalletState, action: PayloadAction<string>) => {
      state.polkadotBalance = action.payload;
    },
  },
});

export const {
  setMetaMaskAccount,
  setPolkadotWalletStatus,
  setPolkadotAccount,
  setPolkadotExtensionAccounts,
  setPolkadotBalance,
} = walletSlice.actions;

export default walletSlice.reducer;

/**
 * Reload stafi balance.
 */
export const connectPolkadotJs =
  (api: ApiPromise | null, showSelectAccountModal: boolean = false): AppThunk =>
  async (dispatch, getState) => {
    if (!window) {
      return;
    }

    const { web3Accounts, web3Enable } = await import(
      "@polkadot/extension-dapp"
    );

    if (!api) {
      return;
    }

    try {
      const extensions = await web3Enable("stafi-app");
      if (extensions.length === 0) {
        // no extension installed, or the user did not accept the authorization
        // in this case we should inform the use and give a link to the extension
        return;
      }

      const newAccounts = await web3Accounts();
      const accounts: InjectedPolkadotAccountWithMeta[] = newAccounts?.map(
        ({ address, ...other }) => ({
          ...other,
          address: convertToSS58(address, 20),
        })
      );

      // Check local selected account.
      const savedPolkadotAccount = getStorage(STORAGE_KEY_POLKADOT_ACCOUNT);
      let matchAccount = accounts.find((account) => {
        return account.address === savedPolkadotAccount;
      });

      // Use first account as default.
      if (!matchAccount) {
        if (accounts.length > 0) {
          matchAccount = accounts[0];
        }
      }

      if (matchAccount) {
        dispatch(updatePolkadotAccount(api, savedPolkadotAccount));
      }

      for (let account of accounts) {
        const result: any = await api.query.system.account(account.address);
        if (result) {
          let fisFreeBalance = chainAmountToHuman(
            result.data.free.toString(),
            TokenSymbol.FIS
          );
          account.balance = fisFreeBalance.toString();
        }
      }

      dispatch(setPolkadotExtensionAccounts(accounts));

      // if (showSelectAccountModal) {
      //   dispatch(setStaFiChainAccountModalVisible(true));
      // }

      saveStorage(STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG, "1");
    } catch (err: unknown) {}
  };

/**
 * Update selected stafi address.
 */
export const updatePolkadotAccount =
  (api: ApiPromise | null, address: string | null): AppThunk =>
  async (dispatch, getState) => {
    if (!api || !address) {
      return;
    }

    dispatch(setPolkadotAccount(address));
    dispatch(setPolkadotBalance("--"));

    const result: any = await api.query.system.account(address);
    if (result) {
      let fisFreeBalance = chainAmountToHuman(
        result.data.free.toString(),
        TokenSymbol.FIS
      );
      dispatch(setPolkadotBalance(fisFreeBalance.toString()));
    }
  };
