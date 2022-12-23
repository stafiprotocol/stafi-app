import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RTokenName, TokenSymbol } from "interfaces/common";
import { AppThunk } from "redux/store";
import RPoolServer from "servers/rpool";
import { stafiServer } from "servers/stafi";
import { rTokenNameToTokenSymbol } from "utils/rToken";
import keyring from "servers/keyring";
import { Symbol } from "keyring/defaults";
import { stringToHex, u8aToHex } from "@polkadot/util";
import { PriceItem } from "./RTokenSlice";
import { cloneDeep } from "lodash";
import { setIsLoading } from "./AppSlice";
import snackbarUtil from "utils/snackbarUtils";
import { CANCELLED_MESSAGE } from "utils/constants";

declare const ethereum: any;

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
  total_rtoken_amount: string;
  left_amount: string;
  cycle: number;
  apr?: string;
}

// todo: type
export interface MintOverview {
  actData: RTokenActs;
  userMintToken: any;
  userMintRatio: any;
  userMintReward: any;
  fisTotalReward: any;
  fisClaimableReward: any;
  fisLockedReward: any;
  claimIndexes: any;
  vesting: string;
}

export type RTokenActsCollection = {
  [rTokenName in RTokenName]?: RTokenActs[];
};

export interface MintProgramState {
  rTokenActs: RTokenActsCollection;
  queryActsLoading: boolean;
  mintOverview: MintOverview | null;
  firstQueryActs: boolean;
}

const initialState: MintProgramState = {
  rTokenActs: {},
  queryActsLoading: false,
  mintOverview: null,
  firstQueryActs: true,
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
    setQueryActsLoading: (
      state: MintProgramState,
      action: PayloadAction<boolean>
    ) => {
      state.queryActsLoading = action.payload;
    },
    setMintOverview: (
      state: MintProgramState,
      action: PayloadAction<MintOverview>
    ) => {
      state.mintOverview = action.payload;
    },
    setFirstQueryActs: (
      state: MintProgramState,
      action: PayloadAction<boolean>
    ) => {
      state.firstQueryActs = action.payload;
    },
  },
});

export const {
  setRTokenActs,
  setQueryActsLoading,
  setMintOverview,
  setFirstQueryActs,
} = mintProgramSlice.actions;

export default mintProgramSlice.reducer;

export const getMintPrograms = (): AppThunk => async (dispatch, getState) => {
  dispatch(setQueryActsLoading(true));

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
      // console.log(getState().mintProgram.rTokenActs);
      dispatch(setFirstQueryActs(false));
    })
    .catch((err: any) => {})
    .finally(() => {
      dispatch(setQueryActsLoading(false));
    });
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
      const acts: RTokenActs[] = await rPoolServer.getRTokenMintRewardsActs(
        tokenSymbol
      );
      const rTokenActs = getState().mintProgram.rTokenActs;
      const newValue = {
        ...rTokenActs,
        [rTokenName]: acts,
      };

      dispatch(setRTokenActs(newValue));
    } catch (err: unknown) {}
  };

export const claimRTokenReward =
  (
    amount: string,
    claimIndexes: any[],
    tokenSymbol: TokenSymbol,
    cycle: number,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    // todo: add noti
    try {
      dispatch(setIsLoading(true));

      const api = await stafiServer.createStafiApi();
      const txs = claimIndexes.map((index: any) =>
        api.tx.rClaim.claimRtokenReward(tokenSymbol, cycle, index)
      );
      if (txs.length === 0) {
        throw new Error("No txs found");
      }
      const tx = await api.tx.utility.batch(txs);
      if (!tx) {
        throw new Error("tx error");
      }
      const polkadotAccount = getState().wallet.polkadotAccount;
      if (!polkadotAccount) {
        throw new Error("Invalid Polkadot account");
      }

      const { web3Enable, web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );
      web3Enable(stafiServer.getWeb3EnableName());
      const injector = await web3FromSource(stafiServer.getPolkadotJsSource());

      tx.signAndSend(
        polkadotAccount,
        // @ts-ignore
        { signer: injector.signer },
        (result: any) => {
          if (result.status.isInBlock) {
            result.events
              .filter((r: any) => r.event.section === "system")
              .forEach((r: any) => {
                const data = r.event.data;
                const method = r.event.method;
                if (method === "ExtrinsicFailed") {
                  dispatch(setIsLoading(false));
                  const [dispatchError] = data;
                  if (dispatchError.isModule) {
                    try {
                      const mod = dispatchError.asModule;
                      const error = data.registry.findMetaError(
                        new Uint8Array([
                          mod.index.toNumber(),
                          mod.error.toNumber(),
                        ])
                      );

                      let messageStr =
                        "Something is wrong, please try again later!";
                      if (error.name == "NominateSwitchClosed") {
                        messageStr =
                          "Unable to stake, system is waiting for matching validators";
                      } else if (error.name == "LiquidityBondZero") {
                        messageStr = "The amount should be larger than 0";
                      } else if (error.name == "PoolLimitReached") {
                        messageStr =
                          "The cumulative FIS amount exceeds the pool limit, please try again later!";
                      } else if (error.name == "InsufficientFis") {
                        messageStr =
                          "Insufficient balance of the pool, please try again later!";
                      }
                      snackbarUtil.error(messageStr);
                    } catch (err: any) {
                      snackbarUtil.error(err.message);
                    }
                  }
                } else if (method === "ExtrinsicSuccess") {
                  dispatch(setIsLoading(false));
                  const txHash = tx.hash.toHex();
                  snackbarUtil.success("Claim Successfully");
                  cb && cb();
                }
              });
          } else if (result.isError) {
            dispatch(setIsLoading(false));
            snackbarUtil.error(result.toHuman());
          }
        }
      ).catch((err: any) => {
        dispatch(setIsLoading(false));
        if (err.message === "Error: Cancelled") {
          snackbarUtil.error(CANCELLED_MESSAGE);
        } else {
          snackbarUtil.error(err.message);
        }
      });
    } catch (err: any) {
      dispatch(setIsLoading(false));
      snackbarUtil.error(err.message);
    }
  };

export const claimREthReward =
  (
    amount: string,
    claimIndexes: any[],
    cycle: number,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      const polkadotAccount = getState().wallet.polkadotAccount;
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      if (!polkadotAccount || !metaMaskAccount) {
        throw new Error("No wallet account");
      }
      const keyringInstance = keyring.init(Symbol.Fis);
      const fisPubkey = u8aToHex(
        keyringInstance.decodeAddress(polkadotAccount),
        -1,
        false
      );
      const msg = stringToHex(fisPubkey);
      const signature = await ethereum
        .request({ method: "personal_sign", params: [metaMaskAccount, msg] })
        .catch((err: any) => {
          throw new Error(err);
        });
      if (!signature) {
        throw new Error("signature error");
      }
      const api = await stafiServer.createStafiApi();
      const txs = claimIndexes.map((index: any) =>
        api.tx.rClaim.claimRethReward(metaMaskAccount, signature, cycle, index)
      );
      if (txs.length === 0) {
        throw new Error("no txs found");
      }
      const tx = await api.tx.utility.batch(txs);
      if (!tx) {
        throw new Error("tx error");
      }
      const { web3Enable, web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );
      web3Enable(stafiServer.getWeb3EnableName());
      const injector = await web3FromSource(stafiServer.getPolkadotJsSource());

      tx.signAndSend(
        polkadotAccount,
        // @ts-ignore
        { signer: injector.signer },
        (result: any) => {
          if (result.status.isInBlock) {
            result.events
              .filter((r: any) => r.event.section === "system")
              .forEach((r: any) => {
                const data = r.event.data;
                const method = r.event.method;
                if (method === "ExtrinsicFailed") {
                  const [dispatchError] = data;
                  if (dispatchError.isModule) {
                    try {
                      const mod = dispatchError.asModule;
                      const error = data.registry.findMetaError(
                        new Uint8Array([
                          mod.index.toNumber(),
                          mod.error.toNumber(),
                        ])
                      );

                      let messageStr =
                        "Something is wrong, please try again later!";
                      if (error.name == "NominateSwitchClosed") {
                        messageStr =
                          "Unable to stake, system is waiting for matching validators";
                      } else if (error.name == "LiquidityBondZero") {
                        messageStr = "The amount should be larger than 0";
                      } else if (error.name == "PoolLimitReached") {
                        messageStr =
                          "The cumulative FIS amount exceeds the pool limit, please try again later!";
                      } else if (error.name == "InsufficientFis") {
                        messageStr =
                          "Insufficient balance of the pool, please try again later!";
                      }
                      snackbarUtil.error(messageStr);
                    } catch (err: any) {
                      snackbarUtil.error(err.message);
                    }
                    dispatch(setIsLoading(false));
                  }
                } else if (method === "ExtrinsicSuccess") {
                  dispatch(setIsLoading(false));
                  snackbarUtil.success("Claim Successfully");
                  cb && cb();
                }
              });
          } else if (result.isError) {
            dispatch(setIsLoading(false));
            snackbarUtil.error(result.toHuman());
          }
        }
      ).catch((err: any) => {
        dispatch(setIsLoading(false));
        if (err.message === "Error: Cancelled") {
          snackbarUtil.error(CANCELLED_MESSAGE);
        } else {
          snackbarUtil.error(err.message);
        }
      });
    } catch (err: any) {
      dispatch(setIsLoading(false));
      snackbarUtil.error(err.message);
    }
  };

export const getMintOverview =
  (rTokenName: RTokenName, cycle: number): AppThunk =>
  async (dispatch, getState) => {
    const metaMaskAccount = getState().wallet.metaMaskAccount;
    const polkadotAccount = getState().wallet.polkadotAccount;
    const priceList = getState().rToken.priceList;
    const fisPrice = priceList.find(
      (item: PriceItem) => item.symbol === RTokenName.rFIS
    );
    if (!fisPrice) return;
    if (rTokenName === RTokenName.rETH) {
      if (!metaMaskAccount) return;
    } else {
      if (!polkadotAccount) return;
    }
    const response = await rPoolServer.getRTokenMintOverview(
      rTokenNameToTokenSymbol(rTokenName),
      cycle,
      polkadotAccount as string,
      metaMaskAccount as string,
      fisPrice.price
    );
    if (!response) return;
    let vesting: string = "0";
    if (isNaN(response.vesting)) {
      vesting = "--";
    } else if (response.vesting * 1 > 0) {
      vesting = Math.ceil(response.vesting * 1) + "D";
    }
    const mintOverview: MintOverview = {
      actData: response.actData,
      userMintToken: response.myMint,
      userMintRatio: response.myMintRatio,
      userMintReward: response.myReward,
      fisTotalReward: response.fisTotalReward,
      fisClaimableReward: response.fisClaimableReward,
      fisLockedReward: response.fisLockedReward,
      claimIndexes: cloneDeep(response.claimIndexes),
      vesting,
    };

    dispatch(setMintOverview(mintOverview));
  };
