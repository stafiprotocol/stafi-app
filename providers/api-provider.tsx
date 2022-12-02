import { ApiPromise, WsProvider } from "@polkadot/api";
import { getStafiRpc } from "config/env";
import { stafi_types } from "config/stafi_types";
import { useAppDispatch, useAppSelector } from "hooks/common";
import React, { createContext, useEffect, useState } from "react";
import { setPolkadotWalletStatus } from "redux/reducers/WalletSlice";
import { RootState } from "redux/store";

export type ApiCtx = {
  api: ApiPromise | null;
  setApi: (api: ApiPromise) => void;
  setRandom: (num: number) => void;
};

export const ApiContext = createContext<ApiCtx | null>(null);

const ApiProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  const dispatch = useAppDispatch();
  const walletState = useAppSelector((state: RootState) => state.wallet);

  // const [state, dispatch] = useReducer(accountReducer, initialState);
  const [api, setApi] = useState<ApiPromise | null>(null);
  // for refresh
  const [random, setRandom] = useState<number>(0);

  useEffect(() => {
    const provider = new WsProvider(getStafiRpc());

    ApiPromise.create({
      provider: provider,
      types: stafi_types,
    })
      .then((api) => {
        setApi(api);

        (async () => {
          dispatch(setPolkadotWalletStatus("success"));
        })();
      })
      .catch((err) => {
        dispatch(setPolkadotWalletStatus("fail"));
      });

    dispatch(setPolkadotWalletStatus("connecting"));
  }, [dispatch, random]);

  /**
   * Connect to Polkadot.js when network connect success.
   */
  useEffect(() => {
    if (!api) {
      return;
    }

    if (walletState.polkadotWalletStatus !== "success") {
      return;
    }
  }, [api, dispatch, walletState.polkadotWalletStatus]);

  useEffect(() => {
    if (walletState.polkadotWalletStatus === "disconnected") {
      setRandom(Math.random());
    }
  }, [walletState.polkadotWalletStatus]);

  return (
    <ApiContext.Provider
      value={{
        api,
        setApi,
        setRandom,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
