import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WalletState {
  metaMaskAccount: string | undefined;
}

const initialState: WalletState = {
  metaMaskAccount: undefined,
};

export const walletSlice = createSlice({
  name: "eth",
  initialState,
  reducers: {
    setMetaMaskAccount: (
      state: WalletState,
      action: PayloadAction<string | undefined>
    ) => {
      state.metaMaskAccount = action.payload;
    },
  },
});

export const { setMetaMaskAccount } = walletSlice.actions;

export default walletSlice.reducer;
