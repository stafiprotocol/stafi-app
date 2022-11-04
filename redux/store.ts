import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import appReducer from "./reducers/AppSlice";
import walletReducer from "./reducers/WalletSlice";
import ethReducer from "./reducers/EthSlice";
import maticReducer from './reducers/MaticSlice';
import polkadotjsSlice from './reducers/PolkadotjsSlice';
import rTokenReducer from "./reducers/RTokenSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    wallet: walletReducer,
    eth: ethReducer,
		matic: maticReducer,
		polkadotjs: polkadotjsSlice,
    rToken: rTokenReducer,
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
