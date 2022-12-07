import { ApiPromise, WsProvider } from "@polkadot/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import type ExtType from "@polkadot/extension-inject/types";
import { convertToSS58 } from "utils/common";
import {
  getStorage,
  removeStorage,
  saveStorage,
  STORAGE_KEY_DISCONNECT_METAMASK,
  STORAGE_KEY_DOT_ACCOUNT,
  STORAGE_KEY_DOT_WALLET_ALLOWED_FLAG,
  STORAGE_KEY_KSM_ACCOUNT,
  STORAGE_KEY_KSM_WALLET_ALLOWED_FLAG,
  STORAGE_KEY_POLKADOT_ACCOUNT,
  STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG,
} from "utils/storage";
import { chainAmountToHuman } from "utils/number";
import { TokenSymbol, WalletType } from "interfaces/common";
import {
  setChooseAccountWalletType,
  setChooseAccountVisible,
  setRouteNextPage,
} from "./FisSlice";
import { cloneDeep } from "lodash";
import snackbarUtil from "utils/snackbarUtils";
import { getStafiRpc } from "config/env";
import { stafi_types } from "config/stafi_types";
import { stafiServer } from "servers/stafi";
import { ksmServer } from "servers/ksm";
import { dotServer } from "servers/dot";

export interface InjectedPolkadotAccountWithMeta
  extends ExtType.InjectedAccountWithMeta {
  fisBalance?: string;
  ksmBalance?: string;
  dotBalance?: string;
}

export type PolkadotWalletStatus =
  | "pending"
  | "connecting"
  | "success"
  | "fail"
  | "disconnected";

export interface WalletState {
  metaMaskAccount: string | undefined;
  metaMaskDisconnected: boolean;
  polkadotWalletStatus: PolkadotWalletStatus;
  polkadotExtensionAccounts: InjectedPolkadotAccountWithMeta[];
  polkadotAccount: string | undefined;
  polkadotBalance: string | undefined;
  ksmAccount: string | undefined;
  dotAccount: string | undefined;
}

const initialState: WalletState = {
  metaMaskAccount: undefined,
  metaMaskDisconnected: false,
  polkadotWalletStatus: "pending",
  // polkadotAccount: "34bwmgT1NtcL8FayGiFSB9F1qZFGPjhbDfTaZRoM2AXgjrpo",
  polkadotExtensionAccounts: [],
  polkadotAccount: "",
  polkadotBalance: undefined,
  ksmAccount: "",
  dotAccount: "",
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
    setMetaMaskDisconnected: (
      state: WalletState,
      action: PayloadAction<boolean>
    ) => {
      saveStorage(STORAGE_KEY_DISCONNECT_METAMASK, action.payload ? "1" : "");
      state.metaMaskDisconnected = action.payload;
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
    setKsmAccount: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      saveStorage(STORAGE_KEY_KSM_ACCOUNT, action.payload || "");
      state.ksmAccount = action.payload;
    },
    setDotAccount: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      saveStorage(STORAGE_KEY_DOT_ACCOUNT, action.payload || "");
      state.dotAccount = action.payload;
    },
  },
});

export const {
  setMetaMaskAccount,
  setMetaMaskDisconnected,
  setPolkadotWalletStatus,
  setPolkadotAccount,
  setPolkadotExtensionAccounts,
  setPolkadotBalance,
  setKsmAccount,
  setDotAccount,
} = walletSlice.actions;

export default walletSlice.reducer;

/**
 * Reload stafi balance.
 */
export const connectPolkadotJs =
  (
    showSelectAccountModal: boolean = false,
    walletType: WalletType | undefined = undefined
  ): AppThunk =>
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

      if (walletType === WalletType.Polkadot) {
        saveStorage(STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG, "1");
      } else if (walletType === WalletType.Polkadot_KSM) {
        saveStorage(STORAGE_KEY_KSM_WALLET_ALLOWED_FLAG, "1");
      } else if (walletType === WalletType.Polkadot_DOT) {
        saveStorage(STORAGE_KEY_DOT_WALLET_ALLOWED_FLAG, "1");
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
      dispatch(setPolkadotExtensionAccounts(accounts));

      // Check local selected account.
      const savedPolkadotAccount = getStorage(STORAGE_KEY_POLKADOT_ACCOUNT);
      const savedKsmAccount = getStorage(STORAGE_KEY_KSM_ACCOUNT);
      const savedDotAccount = getStorage(STORAGE_KEY_DOT_ACCOUNT);

      if (getStorage(STORAGE_KEY_POLKADOT_WALLET_ALLOWED_FLAG)) {
        // StaFi account.
        let matchPolkadotAccount = accounts.find((account) => {
          return account.address === savedPolkadotAccount;
        });
        // Use first account as default.
        if (!matchPolkadotAccount) {
          if (accounts.length > 0) {
            matchPolkadotAccount = accounts[0];
          }
        }
        if (
          matchPolkadotAccount &&
          (walletType === WalletType.Polkadot || !walletType)
        ) {
          dispatch(setPolkadotAccount(matchPolkadotAccount.address || ""));
        }
      }

      if (getStorage(STORAGE_KEY_KSM_WALLET_ALLOWED_FLAG)) {
        // KSM account.
        let matchKsmAccount = accounts.find((account) => {
          return account.address === savedKsmAccount;
        });
        // Use first account as default.
        if (!matchKsmAccount) {
          if (accounts.length > 0) {
            matchKsmAccount = accounts[0];
          }
        }
        if (
          matchKsmAccount &&
          (walletType === WalletType.Polkadot_KSM || !walletType)
        ) {
          dispatch(setKsmAccount(matchKsmAccount.address || ""));
        }
      }

      if (getStorage(STORAGE_KEY_DOT_WALLET_ALLOWED_FLAG)) {
        // DOT account.
        let matchDotAccount = accounts.find((account) => {
          return account.address === savedDotAccount;
        });
        // Use first account as default.
        if (!matchDotAccount) {
          if (accounts.length > 0) {
            matchDotAccount = accounts[0];
          }
        }
        if (
          matchDotAccount &&
          (walletType === WalletType.Polkadot_DOT || !walletType)
        ) {
          dispatch(setDotAccount(matchDotAccount.address || ""));
        }
      }

      if (showSelectAccountModal && accounts.length > 1 && walletType) {
        dispatch(setChooseAccountWalletType(walletType));
        dispatch(setChooseAccountVisible(true));
      } else {
        dispatch(setRouteNextPage(undefined));
      }
    } catch (err: unknown) {}
  };

/**
 * Reload stafi balance.
 */
export const updatePolkadotExtensionAccountsBalances =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const [stafiApi, ksmApi, dotApi] = await Promise.all([
        (async () => {
          return await stafiServer.createStafiApi();
        })(),
        (async () => {
          return await ksmServer.createKsmApi();
        })(),
        (async () => {
          return await dotServer.createDotApi();
        })(),
      ]);

      const accounts = cloneDeep(getState().wallet.polkadotExtensionAccounts);

      const reqList = accounts.map((account) => {
        return (async () => {
          const [fisBalanceResult, ksmBalanceResult, dotBalanceResult] =
            await Promise.all([
              (async () => {
                return await stafiApi.query.system.account(account.address);
              })(),
              (async () => {
                return await ksmApi.query.system.account(account.address);
              })(),
              (async () => {
                return await dotApi.query.system.account(account.address);
              })(),
            ]);
          let fisBalance = chainAmountToHuman(
            fisBalanceResult.data.free.toString(),
            TokenSymbol.FIS
          );
          let ksmBalance = chainAmountToHuman(
            // @ts-ignore
            ksmBalanceResult.data.free.toString(),
            TokenSymbol.FIS
          );
          let dotBalance = chainAmountToHuman(
            // @ts-ignore
            dotBalanceResult.data.free.toString(),
            TokenSymbol.FIS
          );

          return { fisBalance, ksmBalance, dotBalance };
        })();
      });

      const balanceList = await Promise.all(reqList);
      accounts.forEach((account, index) => {
        account.fisBalance = balanceList[index].fisBalance;
        account.ksmBalance = balanceList[index].ksmBalance;
        account.dotBalance = balanceList[index].dotBalance;
      });

      dispatch(setPolkadotExtensionAccounts(accounts));
    } catch (err: unknown) {}
  };

/**
 * Update selected stafi address.
 */
export const updateSelectedPolkadotAccountBalance =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const api = await stafiServer.createStafiApi();
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
      } else if (walletType === WalletType.Polkadot_KSM) {
        dispatch(setKsmAccount(undefined));
        removeStorage(STORAGE_KEY_KSM_WALLET_ALLOWED_FLAG);
      } else if (walletType === WalletType.MetaMask) {
        dispatch(setMetaMaskDisconnected(true));
      }
    } catch (err: unknown) {}
  };
