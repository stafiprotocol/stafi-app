import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import appReducer from "./reducers/AppSlice";
import walletReducer from "./reducers/WalletSlice";
import txReducer from "./reducers/TxSlice";
import ethReducer from "./reducers/EthSlice";
import rTokenReducer from "./reducers/RTokenSlice";
import maticReducer from "./reducers/MaticSlice";
import ksmReducer from "./reducers/KsmSlice";
import dotReducer from "./reducers/DotSlice";
import fisReducer from "./reducers/FisSlice";
import solReducer from "./reducers/SolSlice";
import bridgeReducer from "./reducers/BridgeSlice";
import bnbReducer from "./reducers/BnbSlice";
import mintProgramReducer from "./reducers/MintProgramSlice";
import fisStationReducer from "./reducers/FisStationSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    wallet: walletReducer,
    tx: txReducer,
    eth: ethReducer,
    rToken: rTokenReducer,
    matic: maticReducer,
    ksm: ksmReducer,
    dot: dotReducer,
    sol: solReducer,
    fis: fisReducer,
    bridge: bridgeReducer,
    bnb: bnbReducer,
    mintProgram: mintProgramReducer,
    fisStation: fisStationReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
