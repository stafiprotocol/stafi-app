import { ApiPromise } from "@polkadot/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import type ExtType from "@polkadot/extension-inject/types";
import { convertToSS58 } from "utils/common";
import {
  getStorage,
  removeStorage,
  saveStorage,
  STORAGE_KEY_POLKADOT_ACCOUNT,
  STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG,
} from "utils/storage";
import { chainAmountToHuman } from "utils/number";
import { TokenSymbol, WalletType } from "interfaces/common";
import { setChooseAccountVisible, setRouteNextPage } from "./FisSlice";
import { cloneDeep } from "lodash";
import snackbarUtil from "utils/snackbarUtils";

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
  polkadotExtensionAccounts: InjectedPolkadotAccountWithMeta[];
  polkadotAccount: string | undefined;
  polkadotBalance: string | undefined;
}

const initialState: WalletState = {
  metaMaskAccount: undefined,
  polkadotWalletStatus: "pending",
  // polkadotAccount: "34bwmgT1NtcL8FayGiFSB9F1qZFGPjhbDfTaZRoM2AXgjrpo",
  polkadotAccount: "",
  polkadotExtensionAccounts: [],
  polkadotBalance: undefined,
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
      saveStorage(STORAGE_KEY_POLKADOT_ACCOUNT, action.payload || "");
      state.polkadotAccount = action.payload;
    },
    setPolkadotExtensionAccounts: (
      state: WalletState,
      action: PayloadAction<InjectedPolkadotAccountWithMeta[]>
    ) => {
      state.polkadotExtensionAccounts = action.payload;
    },
    setPolkadotBalance: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
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
  (showSelectAccountModal: boolean = false): AppThunk =>
  async (dispatch, getState) => {
    if (!window) {
      return;
    }

    const { web3Accounts, web3Enable } = await import(
      "@polkadot/extension-dapp"
    );

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

      if (accounts.length === 0) {
        snackbarUtil.warning("No account detected");
        return;
      }

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
        dispatch(setPolkadotAccount(matchAccount.address || ""));
      }
      dispatch(setPolkadotExtensionAccounts(accounts));

      if (showSelectAccountModal && accounts.length > 1) {
        dispatch(setChooseAccountVisible(true));
      } else {
        dispatch(setRouteNextPage(undefined));
      }

      saveStorage(STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG, "1");
    } catch (err: unknown) {}
  };

/**
 * Reload stafi balance.
 */
export const updatePolkadotExtensionAccountsBalances =
  (api: ApiPromise | null): AppThunk =>
  async (dispatch, getState) => {
    try {
      if (!api) {
        return;
      }

      const accounts = cloneDeep(getState().wallet.polkadotExtensionAccounts);
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
    } catch (err: unknown) {}
  };

/**
 * Update selected stafi address.
 */
export const updateSelectedPolkadotAccountBalance =
  (api: ApiPromise | null): AppThunk =>
  async (dispatch, getState) => {
    try {
      if (!api) {
        return;
      }

      const address = getState().wallet.polkadotAccount;

      if (!address) {
        dispatch(setPolkadotBalance("--"));
        return;
      }

      const result: any = await api.query.system.account(address);
      if (result) {
        let fisFreeBalance = chainAmountToHuman(
          result.data.free.toString(),
          TokenSymbol.FIS
        );
        dispatch(setPolkadotBalance(fisFreeBalance.toString()));
      }
    } catch (err: unknown) {}
  };

/**
 * Update selected stafi address.
 */
export const disconnectWallet =
  (walletType: WalletType): AppThunk =>
  async (dispatch, getState) => {
    try {
      if (walletType === WalletType.Polkadot) {
        dispatch(setPolkadotAccount(undefined));
        dispatch(setPolkadotBalance("--"));
        removeStorage(STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG);
      }
    } catch (err: unknown) {}
  };
