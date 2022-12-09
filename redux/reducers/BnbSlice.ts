import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BnbState {
  balance: string;
  stakedAmount: string;
}

const initialState: BnbState = {
  balance: "--",
  stakedAmount: "--",
};

export const bnbSlice = createSlice({
  name: "bnb",
  initialState,
  reducers: {
    setBalance: (state: BnbState, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setStakedAmount: (state: BnbState, action: PayloadAction<string>) => {
      state.stakedAmount = action.payload;
    },
  },
});

export const { setBalance, setStakedAmount } = bnbSlice.actions;

export default bnbSlice.reducer;
