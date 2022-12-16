import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RTokenName, TokenSymbol } from "interfaces/common";
import { AppThunk } from "redux/store";
import RPoolServer from "servers/rpool";

const rPoolServer = new RPoolServer();

export type RTokenActsCollection = {
  [rTokenName in RTokenName]?: any[];
};

export interface MintProgramState {
  rTokenActs: RTokenActsCollection;
}

const initialState: MintProgramState = {
  rTokenActs: {},
};

export const mintProgramSlice = createSlice({
  name: "mintProgram",
  initialState,
  reducers: {
    setRTokenActs: (
      state: MintProgramState,
      action: PayloadAction<RTokenActsCollection>
    ) => {
      state.rTokenActs = action.payload;
    },
  },
});

export const { setRTokenActs } = mintProgramSlice.actions;

export default mintProgramSlice.reducer;

export const getMintPrograms = (): AppThunk => async (dispatch, getState) => {
  Promise.all([
    dispatch(getREthMintInfo()),
    dispatch(getRTokenMintInfo(RTokenName.rATOM)),
    dispatch(getRTokenMintInfo(RTokenName.rBNB)),
    dispatch(getRTokenMintInfo(RTokenName.rDOT)),
    dispatch(getRTokenMintInfo(RTokenName.rFIS)),
    dispatch(getRTokenMintInfo(RTokenName.rKSM)),
    dispatch(getRTokenMintInfo(RTokenName.rMATIC)),
    dispatch(getRTokenMintInfo(RTokenName.rSOL)),
  ])
    .then(() => {})
    .catch((err: any) => {});
};

const getREthMintInfo = (): AppThunk => async (dispatch, getState) => {
  try {
    const acts: any[] = await rPoolServer.getREthMintRewardsActs();
    const rTokenActs = getState().mintProgram.rTokenActs;
    const newValue = {
      ...rTokenActs,
      [RTokenName.rETH]: acts,
    };

    dispatch(setRTokenActs(newValue));
  } catch (err: unknown) {}
};

const getRTokenMintInfo =
  (rTokenName: RTokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      const tokenSymbol = rTokenNameToTokenSymbol(rTokenName);
      const acts = await rPoolServer.getRTokenMintRewardsActs(tokenSymbol);
      const rTokenActs = getState().mintProgram.rTokenActs;
      const newValue = {
        ...rTokenActs,
        [rTokenName]: acts,
      };

      dispatch(setRTokenActs(newValue));
    } catch (err: unknown) {}
  };

const rTokenNameToTokenSymbol = (rTokenName: RTokenName): TokenSymbol => {
  switch (rTokenName) {
    case RTokenName.rATOM:
      return TokenSymbol.ATOM;
    case RTokenName.rBNB:
      return TokenSymbol.BNB;
    case RTokenName.rDOT:
      return TokenSymbol.DOT;
    case RTokenName.rETH:
      return TokenSymbol.ETH;
    case RTokenName.rFIS:
      return TokenSymbol.FIS;
    case RTokenName.rKSM:
      return TokenSymbol.KSM;
    case RTokenName.rMATIC:
      return TokenSymbol.MATIC;
    default:
      return TokenSymbol.SOL;
  }
};
