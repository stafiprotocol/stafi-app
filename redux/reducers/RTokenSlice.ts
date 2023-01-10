import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getBep20RBnbTokenAbi,
  getBep20RDotTokenAbi,
  getBep20REthTokenAbi,
  getBep20RFisTokenAbi,
  getBep20RKsmTokenAbi,
} from "config/bep20Abi";
import { getBep20TokenContractConfig } from "config/bep20Contract";
import { getApiHost, getDropHost } from "config/env";
import {
  getErc20FisTokenAbi,
  getErc20RDotTokenAbi,
  getErc20REthTokenAbi,
  getErc20RFisTokenAbi,
  getErc20RKsmTokenAbi,
} from "config/erc20Abi";
import { getErc20TokenContractConfig } from "config/erc20Contract";
import { getBSCRMaticAbi, getERCMaticAbi } from "config/matic";
import { getWeb3ProviderUrlConfig } from "config/metaMask";
import { RTokenName, TokenName, TokenStandard } from "interfaces/common";
import { rSymbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import StafiServer, { stafiServer } from "servers/stafi";
import numberUtil from "utils/numberUtil";
import {
  getNativeFisBalance,
  getNativeRTokenBalance,
} from "utils/polkadotUtils";
import { getTokenSymbol } from "utils/rToken";
import { getSplAssetBalance } from "utils/solanaUtils";
import {
  createWeb3,
  getBep20AssetBalance,
  getErc20AssetBalance,
} from "utils/web3Utils";
import Web3 from "web3";

export type FisBalanceStore = {
  [tokenStandard in TokenStandard]: string | undefined;
};

export type RTokenBalanceStore = {
  [tokenStandard in TokenStandard]: RTokenBalanceCollection;
};

export type RTokenBalanceCollection = {
  [tokenName in TokenName]?: string;
};

export type RTokenRatioCollection = {
  [tokenName in TokenName]?: string;
};

export type RTokenStakerAprCollection = {
  [tokenName in TokenName]?: string;
};

export type TokenPoolDataStore = {
  [tokenName in TokenName]?: PoolData;
};

interface PoolData {
  stakedValue: string;
  stakedAmount: string;
}

export interface PriceItem {
  // rETH, ETH, rMATIC, etc.
  symbol: string;
  price: string;
}

export interface RTokenState {
  priceList: PriceItem[];
  fisBalanceStore: FisBalanceStore;
  rTokenBalanceStore: RTokenBalanceStore;
  rTokenRatioStore: RTokenRatioCollection;
  rTokenStakerAprStore: RTokenStakerAprCollection;
  tokenPoolData: TokenPoolDataStore;
}

const initialState: RTokenState = {
  priceList: [],
  fisBalanceStore: {
    [TokenStandard.Native]: undefined,
    [TokenStandard.ERC20]: undefined,
    [TokenStandard.BEP20]: undefined,
    [TokenStandard.SPL]: undefined,
  },
  rTokenBalanceStore: {
    [TokenStandard.Native]: {},
    [TokenStandard.ERC20]: {},
    [TokenStandard.BEP20]: {},
    [TokenStandard.SPL]: {},
  },
  rTokenRatioStore: {},
  rTokenStakerAprStore: {},
  tokenPoolData: {},
};

export const rTokenSlice = createSlice({
  name: "rToken",
  initialState,
  reducers: {
    setPriceList: (state: RTokenState, action: PayloadAction<PriceItem[]>) => {
      state.priceList = action.payload;
    },
    setFisBalanceStore: (
      state: RTokenState,
      action: PayloadAction<FisBalanceStore>
    ) => {
      state.fisBalanceStore = action.payload;
    },
    setRTokenBalanceStore: (
      state: RTokenState,
      action: PayloadAction<RTokenBalanceStore>
    ) => {
      state.rTokenBalanceStore = action.payload;
    },
    setRTokenRatioStore: (
      state: RTokenState,
      action: PayloadAction<RTokenRatioCollection>
    ) => {
      state.rTokenRatioStore = action.payload;
    },
    setRTokenStakerAprStore: (
      state: RTokenState,
      action: PayloadAction<RTokenRatioCollection>
    ) => {
      state.rTokenStakerAprStore = action.payload;
    },
    setTokenPoolData: (
      state: RTokenState,
      action: PayloadAction<TokenPoolDataStore>
    ) => {
      state.tokenPoolData = action.payload;
    },
  },
});

export const {
  setPriceList,
  setFisBalanceStore,
  setRTokenBalanceStore,
  setRTokenRatioStore,
  setRTokenStakerAprStore,
  setTokenPoolData,
} = rTokenSlice.actions;

export default rTokenSlice.reducer;

export const updateRTokenPriceList =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const response = await fetch(
        `${getDropHost()}/stafi/v1/webapi/rtoken/pricelist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        dispatch(setPriceList(resJson.data));
      }
    } catch (err: unknown) {}
  };

export const clearRTokenBalance =
  (tokenStandard: TokenStandard | undefined, tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      if (!tokenStandard) {
        return;
      }

      let newBalance = undefined;
      const rTokenBalanceStore = getState().rToken.rTokenBalanceStore;
      const newValue = {
        ...rTokenBalanceStore,
        [tokenStandard]: {
          ...rTokenBalanceStore[tokenStandard],
          [tokenName]: newBalance,
        },
      };

      dispatch(setRTokenBalanceStore(newValue));
    } catch (err: unknown) {}
  };

export const updateFisBalance =
  (tokenStandard: TokenStandard | undefined): AppThunk =>
  async (dispatch, getState) => {
    try {
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      const polkadotAccount = getState().wallet.polkadotAccount;
      const solanaAccount = getState().wallet.solanaAccount;
      if (!tokenStandard) {
        return;
      }

      let newBalance = undefined;
      if (tokenStandard === TokenStandard.Native) {
        newBalance = await getNativeFisBalance(polkadotAccount);
      } else if (tokenStandard === TokenStandard.ERC20) {
        // Query erc20 rToken balance.
        const erc20TokenContractConfig = getErc20TokenContractConfig();
        let tokenAbi = getErc20FisTokenAbi();
        let tokenAddress = erc20TokenContractConfig.FIS;
        newBalance = await getErc20AssetBalance(
          metaMaskAccount,
          tokenAbi,
          tokenAddress,
          TokenName.FIS
        );
      } else if (tokenStandard === TokenStandard.SPL) {
        newBalance = await getSplAssetBalance(solanaAccount, TokenName.FIS);
      }

      if (newBalance !== undefined) {
        const fisBalanceStore = getState().rToken.fisBalanceStore;
        const newValue = {
          ...fisBalanceStore,
          [tokenStandard]: newBalance,
        };

        dispatch(setFisBalanceStore(newValue));
      }
    } catch (err: unknown) {}
  };
export const updateRTokenBalance =
  (tokenStandard: TokenStandard | undefined, tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      const polkadotAccount = getState().wallet.polkadotAccount;
      const solanaAccount = getState().wallet.solanaAccount;
      if (!tokenStandard) {
        return;
      }

      let newBalance = undefined;
      if (tokenStandard === TokenStandard.Native) {
        newBalance = await getNativeRTokenBalance(
          polkadotAccount,
          getTokenSymbol(tokenName)
        );
      } else if (tokenStandard === TokenStandard.BEP20) {
        // Query bep20 rToken balance.
        const bep20TokenContractConfig = getBep20TokenContractConfig();
        let tokenAbi = undefined;
        let tokenAddress = undefined;
        if (tokenName === TokenName.ETH) {
          tokenAbi = getBep20REthTokenAbi();
          tokenAddress = bep20TokenContractConfig.rETH;
        } else if (tokenName === TokenName.FIS) {
          tokenAbi = getBep20RFisTokenAbi();
          tokenAddress = bep20TokenContractConfig.rFIS;
        } else if (tokenName === TokenName.MATIC) {
          tokenAbi = getBSCRMaticAbi();
          tokenAddress = bep20TokenContractConfig.rMATIC;
        } else if (tokenName === TokenName.BNB) {
          tokenAbi = getBep20RBnbTokenAbi();
          tokenAddress = bep20TokenContractConfig.rBNB;
        } else if (tokenName === TokenName.KSM) {
          tokenAbi = getBep20RKsmTokenAbi();
          tokenAddress = bep20TokenContractConfig.rKSM;
        } else if (tokenName === TokenName.DOT) {
          tokenAbi = getBep20RDotTokenAbi();
          tokenAddress = bep20TokenContractConfig.rDOT;
        }
        newBalance = await getBep20AssetBalance(
          metaMaskAccount,
          tokenAbi,
          tokenAddress,
          tokenName
        );
      } else if (tokenStandard === TokenStandard.ERC20) {
        // Query erc20 rToken balance.
        const erc20TokenContractConfig = getErc20TokenContractConfig();
        let tokenAbi = undefined;
        let tokenAddress = undefined;
        if (tokenName === TokenName.FIS) {
          tokenAbi = getErc20RFisTokenAbi();
          tokenAddress = erc20TokenContractConfig.rFIS;
        } else if (tokenName === TokenName.ETH) {
          tokenAbi = getErc20REthTokenAbi();
          tokenAddress = erc20TokenContractConfig.rETH;
        } else if (tokenName === TokenName.MATIC) {
          tokenAbi = getERCMaticAbi();
          tokenAddress = erc20TokenContractConfig.rMATIC;
        } else if (tokenName === TokenName.KSM) {
          tokenAbi = getErc20RKsmTokenAbi();
          tokenAddress = erc20TokenContractConfig.rKSM;
        } else if (tokenName === TokenName.DOT) {
          tokenAbi = getErc20RDotTokenAbi();
          tokenAddress = erc20TokenContractConfig.rDOT;
        }
        newBalance = await getErc20AssetBalance(
          metaMaskAccount,
          tokenAbi,
          tokenAddress,
          tokenName
        );
      } else if (tokenStandard === TokenStandard.SPL) {
        let rTokenName;
        if (tokenName === TokenName.SOL) {
          rTokenName = RTokenName.rSOL;
        }
        newBalance = await getSplAssetBalance(solanaAccount, rTokenName);
      }

      if (newBalance !== undefined) {
        const rTokenBalanceStore = getState().rToken.rTokenBalanceStore;
        const newValue = {
          ...rTokenBalanceStore,
          [tokenStandard]: {
            ...rTokenBalanceStore[tokenStandard],
            [tokenName]: newBalance,
          },
        };

        dispatch(setRTokenBalanceStore(newValue));
      }
    } catch (err: unknown) {}
  };

export const updateRTokenRatio =
  (tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      let newRatio = "--";

      if (tokenName === TokenName.ETH) {
        const erc20TokenContractConfig = getErc20TokenContractConfig();
        const web3 = createWeb3(
          new Web3.providers.WebsocketProvider(
            getWeb3ProviderUrlConfig().stafiEth
          )
        );

        let contract = new web3.eth.Contract(
          getErc20REthTokenAbi(),
          erc20TokenContractConfig.rETH
        );
        const amount = web3.utils.toWei("1");
        const result = await contract.methods.getEthValue(amount).call();
        newRatio = web3.utils.fromWei(result, "ether");
      } else {
        const api = await new StafiServer().createStafiApi();
        const result = await api.query.rTokenRate.rate(
          getTokenSymbol(tokenName)
        );
        let ratio = numberUtil.rTokenRateToHuman(result.toJSON());
        newRatio = (ratio || 1) + "";
      }

      const rTokenRatioStore = getState().rToken.rTokenRatioStore;
      const newValue = {
        ...rTokenRatioStore,
        [tokenName]: newRatio,
      };
      dispatch(setRTokenRatioStore(newValue));
    } catch (err: unknown) {}
  };

export const updateRTokenStakerApr =
  (tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      let newApr = "--";

      if (tokenName === TokenName.ETH) {
        const response = await fetch(`${getApiHost()}/reth/v1/poolData`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const resJson = await response.json();
        if (resJson && resJson.status === "80000") {
          newApr = resJson.data.stakeApr;
        }
      } else if (tokenName === TokenName.MATIC) {
        const api = await stafiServer.createStafiApi();
        try {
          const eraResult = await api.query.rTokenLedger.chainEras(
            rSymbol.Matic
          );
          let currentEra = eraResult.toJSON() as number;
          if (currentEra) {
            let rateResult = await api.query.rTokenRate.eraRate(
              rSymbol.Matic,
              currentEra - 1
            );
            const currentRate = rateResult.toJSON() as number;
            const rateResult2 = await api.query.rTokenRate.eraRate(
              rSymbol.Matic,
              currentEra - 8
            );
            let lastRate = rateResult2.toJSON() as number;
            newApr =
              ((currentRate - lastRate) / 1000000000000 / 7) * 365.25 * 100 +
              "";
          }
        } catch (err) {
          console.error(err);
        }
      } else if (tokenName === TokenName.BNB) {
        const api = await stafiServer.createStafiApi();
        try {
          const eraResult = await api.query.rTokenLedger.chainEras(rSymbol.Bnb);
          let currentEra = eraResult.toJSON() as number;
          if (currentEra) {
            let rateResult = await api.query.rTokenRate.eraRate(
              rSymbol.Bnb,
              currentEra - 1
            );
            const currentRate = rateResult.toJSON() as number;
            const rateResult2 = await api.query.rTokenRate.eraRate(
              rSymbol.Bnb,
              currentEra - 2
            );
            let lastRate = rateResult2.toJSON() as number;
            if (currentRate && lastRate && currentRate > lastRate) {
              newApr =
                ((currentRate - lastRate) / 1000000000000) * 365.25 * 100 + "";
            } else {
              newApr = "2.5";
            }
          }
        } catch (err) {
          console.error(err);
        }
      } else if (tokenName === TokenName.KSM) {
        const api = await stafiServer.createStafiApi();
        try {
          const eraResult = await api.query.rTokenLedger.chainEras(rSymbol.Ksm);
          let currentEra = eraResult.toJSON() as number;
          if (currentEra) {
            let rateResult = await api.query.rTokenRate.eraRate(
              rSymbol.Ksm,
              currentEra - 1
            );
            const currentRate = rateResult.toJSON() as number;
            const rateResult2 = await api.query.rTokenRate.eraRate(
              rSymbol.Ksm,
              currentEra - 29
            );
            let lastRate = rateResult2.toJSON() as number;
            if (currentRate && lastRate && currentRate > lastRate) {
              newApr =
                ((currentRate - lastRate) / 1000000000000 / 7) * 365.25 * 100 +
                "";
            } else {
              newApr = "16.0";
            }
          }
        } catch (err) {
          console.error(err);
        }
      } else if (tokenName === TokenName.DOT) {
        const api = await new StafiServer().createStafiApi();
        try {
          const eraResult = await api.query.rTokenLedger.chainEras(rSymbol.Dot);
          let currentEra = eraResult.toJSON() as number;
          if (currentEra) {
            let rateResult = await api.query.rTokenRate.eraRate(
              rSymbol.Dot,
              currentEra - 1
            );
            const currentRate = rateResult.toJSON() as number;
            const rateResult2 = await api.query.rTokenRate.eraRate(
              rSymbol.Dot,
              currentEra - 8
            );
            let lastRate = rateResult2.toJSON() as number;
            if (currentRate && lastRate && currentRate > lastRate) {
              newApr =
                ((currentRate - lastRate) / 1000000000000 / 7) * 365.25 * 100 +
                "";
            } else {
              newApr = "14.9";
            }
          }
        } catch (err) {
          console.error(err);
        }
      } else if (tokenName === TokenName.SOL) {
        const api = await new StafiServer().createStafiApi();
        try {
          const eraResult = await api.query.rTokenLedger.chainEras(rSymbol.Sol);
          let currentEra = eraResult.toJSON() as number;
          if (currentEra) {
            let rateResult = await api.query.rTokenRate.eraRate(
              rSymbol.Sol,
              currentEra - 1
            );
            const currentRate = rateResult.toJSON() as number;
            const rateResult2 = await api.query.rTokenRate.eraRate(
              rSymbol.Sol,
              currentEra - 2
            );
            let lastRate = rateResult2.toJSON() as number;
            if (currentRate && lastRate && currentRate > lastRate) {
              newApr =
                ((currentRate - lastRate) / 1000000000000 / 2.54) *
                  365.25 *
                  100 +
                "";
            } else {
              newApr = "7.2";
            }
          }
        } catch (err) {
          console.error(err);
        }
      }

      const rTokenStakerAprStore = getState().rToken.rTokenStakerAprStore;
      const newValue = {
        ...rTokenStakerAprStore,
        [tokenName]: newApr,
      };
      dispatch(setRTokenStakerAprStore(newValue));
    } catch (err: unknown) {}
  };

export const updateTokenPoolData =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const response = await fetch(
        `${getDropHost()}/stafi/v1/webapi/rtoken/stakevalues`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rsymbols: ["rmatic", "rbnb", "rksm", "rdot", "rsol"],
          }),
        }
      );

      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        const { stakeList } = resJson.data;
        if (!Array.isArray(stakeList) || stakeList.length === 0) return;

        let poolDataStore: TokenPoolDataStore = {};
        stakeList.forEach((data: any) => {
          const poolData: PoolData = {
            stakedAmount: data.stakeAmount,
            stakedValue: data.stakeValue,
          };
          if (data.rsymbol === "Rmatic") {
            poolDataStore.MATIC = poolData;
          } else if (data.rsymbol === "Rbnb") {
            poolDataStore.BNB = poolData;
          } else if (data.rsymbol === "Rksm") {
            poolDataStore.KSM = poolData;
          } else if (data.rsymbol === "Rdot") {
            poolDataStore.DOT = poolData;
          } else if (data.rsymbol === "Rsol") {
            poolDataStore.SOL = poolData;
          }
        });

        dispatch(setTokenPoolData(poolDataStore));
      }
    } catch (err) {
      console.error(err);
    }
  };
