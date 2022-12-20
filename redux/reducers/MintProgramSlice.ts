import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RTokenName, TokenSymbol } from "interfaces/common";
import { AppThunk } from "redux/store";
import RPoolServer from "servers/rpool";
import { stafiServer } from "servers/stafi";
import { rTokenNameToTokenSymbol } from "utils/rToken";

const rPoolServer = new RPoolServer();

export interface RTokenActs {
	begin: number;
	end: number;
	endTimeStamp: number;
	nowBlock: number;
	mintedValue: string;
	reward_rate: number;
	total_native_token_amount: number;
	total_reward: string;
	left_amount: string;
}

export type RTokenActsCollection = {
  [rTokenName in RTokenName]?: RTokenActs[];
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
    .then(() => {
			console.log(getState().mintProgram.rTokenActs)
		})
    .catch((err: any) => {});
};

const getREthMintInfo = (): AppThunk => async (dispatch, getState) => {
  try {
    const acts: RTokenActs[] = await rPoolServer.getREthMintRewardsActs();
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
      const acts: RTokenActs[] = await rPoolServer.getRTokenMintRewardsActs(tokenSymbol);
      const rTokenActs = getState().mintProgram.rTokenActs;
      const newValue = {
        ...rTokenActs,
        [rTokenName]: acts,
      };

      dispatch(setRTokenActs(newValue));
    } catch (err: unknown) {}
  };

export const claimRTokenReward = (): AppThunk =>
async (dispatch, getState) => {
	// todo: add noti
	try {
		const api = await stafiServer.createStafiApi();
	} catch (err: any) {

	}
}