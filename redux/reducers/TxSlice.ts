import { ApiPromise } from "@polkadot/api";
import type ExtType from "@polkadot/extension-inject/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenSymbol } from "interfaces/common";
import { QueueTx } from "interfaces/tx";
import {
  NO_ENOUGH_FEE_MESSAGE,
  NO_VALID_POOL_MESSAGE,
  TRANSACTION_FAILED_MESSAGE,
} from "utils/constants";
import { chainAmountToHuman } from "utils/number";
import { handleTxResults } from "utils/polkadotTx";
import snackbarUtil from "utils/snackbarUtils";
import {
  saveStorage,
  STORAGE_KEY_DISCONNECT_METAMASK,
  STORAGE_KEY_DOT_ACCOUNT,
  STORAGE_KEY_KSM_ACCOUNT,
  STORAGE_KEY_POLKADOT_ACCOUNT,
} from "utils/storage";
import { AppThunk } from "../store";
import { updateSelectedPolkadotAccountBalance } from "./WalletSlice";

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
  txStatus: string | undefined;
}

const initialState: WalletState = {
  txStatus: undefined,
};

export const txSlice = createSlice({
  name: "tx",
  initialState,
  reducers: {
    setTxStatus: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      state.txStatus = action.payload;
    },
  },
});

export const { setTxStatus } = txSlice.actions;

export default txSlice.reducer;

/**
 * Send polkadot transaction.
 */
export const sendPolkadotTx =
  (
    api: ApiPromise | null,
    address: string,
    balance: string,
    queueTx: QueueTx
  ): AppThunk =>
  async (dispatch, getState) => {
    if (!queueTx.extrinsic || !address || !api) {
      return;
    }

    const { web3FromAddress } = await import("@polkadot/extension-dapp");

    try {
      const injector = await web3FromAddress(address);
      api.setSigner(injector.signer);

      // const fisCost = queueTx.fisCost ? queueTx.fisCost : 0;
      // const paymentInfo = await queueTx.extrinsic.paymentInfo(address);
      // const fisFee = chainAmountToHuman(
      //   paymentInfo.partialFee.toJSON(),
      //   TokenSymbol.FIS
      // );
      // if (Number(fisCost) + Number(fisFee) > Number(balance)) {
      //   // snackbarUtil.error("No enough fee in your account");
      //   queueTx.txFailedCb && queueTx.txFailedCb(NO_ENOUGH_FEE_MESSAGE);
      //   return;
      // }

      const unsubscribe = await queueTx.extrinsic?.signAndSend(
        address,
        {},
        handleTxResults(
          {
            extrinsic: queueTx.extrinsic,
            txSuccessCb: (result) => {
              dispatch(updateSelectedPolkadotAccountBalance());
              queueTx.txSuccessCb && queueTx.txSuccessCb(result);
            },
            txFailedCb: (reason) => {
              // snackbarUtil.error(
              //   "Something is wrong, please try it again later"
              // );
              queueTx.txFailedCb && queueTx.txFailedCb(reason);
            },
          },
          () => {
            unsubscribe();
          }
        )
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "Cancelled") {
          // snackbarUtil.toast("Cancelled");
          queueTx.txCancelCb && queueTx.txCancelCb();
        } else {
          // snackbarUtil.error("Something is wrong, please try it again later");
          queueTx.txFailedCb && queueTx.txFailedCb(err.message);
        }
      }
    }
  };
