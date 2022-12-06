import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getMaticStakePortalAbi,
  getMaticStakePortalAddress,
} from "config/matic";
import { ChainId } from "interfaces/common";
import { AppThunk } from "redux/store";
import StafiServer from "servers/stafi";
import numberUtil from "utils/numberUtil";
import { createWeb3 } from "utils/web3Utils";

const stafiServer = new StafiServer();

export interface BridgeState {
  erc20BridgeFee: string;
  bep20BridgeFee: string;
  solBridgeFee: string;
}

const initialState: BridgeState = {
  erc20BridgeFee: "--",
  bep20BridgeFee: "--",
  solBridgeFee: "--",
};

export const bridgeSlice = createSlice({
  name: "bridge",
  initialState,
  reducers: {
    setErc20BridgeFee: (state: BridgeState, action: PayloadAction<string>) => {
      state.erc20BridgeFee = action.payload;
    },
    setBep20BridgeFee: (state: BridgeState, action: PayloadAction<string>) => {
      state.bep20BridgeFee = action.payload;
    },
    setSolBridgeFee: (state: BridgeState, action: PayloadAction<string>) => {
      state.solBridgeFee = action.payload;
    },
  },
});

export const { setBep20BridgeFee, setErc20BridgeFee, setSolBridgeFee } =
  bridgeSlice.actions;

export default bridgeSlice.reducer;

/**
 * query estimate bridge fees
 */
export const queryBridgeFees = (): AppThunk => async (dispatch, getState) => {
  try {
    const api = await stafiServer.createStafiApi();

    const resultErc20 = await api.query.bridgeCommon.chainFees(ChainId.ETH);
    if (resultErc20.toJSON()) {
      const fee = numberUtil.fisAmountToHuman(resultErc20.toJSON());
      dispatch(setErc20BridgeFee(numberUtil.handleFisAmountToFixed(fee)));
    }

    const resultBep20 = await api.query.bridgeCommon.chainFees(ChainId.BSC);
    if (resultBep20.toJSON()) {
      const fee = numberUtil.fisAmountToHuman(resultBep20.toJSON());
      dispatch(setBep20BridgeFee(numberUtil.handleFisAmountToFixed(fee)));
    }

    const resultSol = await api.query.bridgeCommon.chainFees(ChainId.SOL);
    if (resultSol.toJSON()) {
      const fee = numberUtil.fisAmountToHuman(resultSol.toJSON());
      dispatch(setSolBridgeFee(numberUtil.handleFisAmountToFixed(fee)));
    }
  } catch (err: any) {
    console.error(err);
  }
};

/**
 * query bridge fee from stakePortal
 * @returns 
 */
export const getBridgeFee = (): AppThunk => async (dispatch, getState) => {
  const web3 = createWeb3();
  const metaMaskAccount = getState().wallet.metaMaskAccount;
  const contractMatic = new web3.eth.Contract(
    getMaticStakePortalAbi(),
    getMaticStakePortalAddress(),
    {
      from: metaMaskAccount,
    }
  );

  const erc20BridgeFeeResult = await contractMatic.methods
    .bridgeFee(ChainId.ETH)
    .call();
  if (!isNaN(Number(erc20BridgeFeeResult))) {
    dispatch(setErc20BridgeFee(web3.utils.fromWei(erc20BridgeFeeResult)));
  }

  const bep20BridgeFeeResult = await contractMatic.methods
    .bridgeFee(ChainId.BSC)
    .call();
  if (!isNaN(Number(bep20BridgeFeeResult))) {
    dispatch(setBep20BridgeFee(web3.utils.fromWei(bep20BridgeFeeResult)));
  }

  const solBridgeFeeResult = await contractMatic.methods
    .bridgeFee(ChainId.SOL)
    .call();
  if (!isNaN(Number(solBridgeFeeResult))) {
    dispatch(setSolBridgeFee(web3.utils.fromWei(solBridgeFeeResult)));
  }
};
