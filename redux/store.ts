import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import appReducer from "./reducers/AppSlice";
import walletReducer from "./reducers/WalletSlice";
import ethReducer from "./reducers/EthSlice";
import rTokenReducer from "./reducers/RTokenSlice";
import maticReducer from './reducers/MaticSlice';
import fisReducer from './reducers/FisSlice';
import bridgeReducer from './reducers/BridgeSlice';
import bnbReducer from './reducers/BnbSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    wallet: walletReducer,
    eth: ethReducer,
    rToken: rTokenReducer,
		matic: maticReducer,
		fis: fisReducer,
    bridge: bridgeReducer,
		bnb: bnbReducer,
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
