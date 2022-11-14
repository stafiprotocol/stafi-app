import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getBep20REthTokenAbi } from "config/bep20Abi";
import { getBep20TokenContractConfig } from "config/bep20Contract";
import { getApiHost, getDropHost } from "config/env";
import { getErc20REthTokenAbi } from "config/erc20Abi";
import { getErc20TokenContractConfig } from "config/erc20Contract";
import { getWeb3ProviderUrlConfig } from "config/metaMask";
import { TokenName, TokenStandard } from "interfaces/common";
import { AppThunk } from "redux/store";
import { getNativeRTokenBalance } from "utils/polkadotUtils";
import { getTokenSymbol } from "utils/rToken";
import {
  createWeb3,
  getBep20AssetBalance,
  getErc20AssetBalance,
} from "utils/web3Utils";
import Web3 from "web3";

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

interface PriceItem {
  // rETH, ETH, rMATIC, etc.
  symbol: string;
  price: string;
}

export interface RTokenState {
  priceList: PriceItem[];
  rTokenBalanceStore: RTokenBalanceStore;
  rTokenRatioStore: RTokenRatioCollection;
  rTokenStakerAprStore: RTokenStakerAprCollection;
}

const initialState: RTokenState = {
  priceList: [],
  rTokenBalanceStore: {
    [TokenStandard.Native]: {},
    [TokenStandard.ERC20]: {},
    [TokenStandard.BEP20]: {},
    [TokenStandard.SPL]: {},
  },
  rTokenRatioStore: {},
  rTokenStakerAprStore: {},
};

export const rTokenSlice = createSlice({
  name: "rToken",
  initialState,
  reducers: {
    setPriceList: (state: RTokenState, action: PayloadAction<PriceItem[]>) => {
      state.priceList = action.payload;
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
  },
});

export const {
  setPriceList,
  setRTokenBalanceStore,
  setRTokenRatioStore,
  setRTokenStakerAprStore,
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

export const updateRTokenBalance =
  (tokenStandard: TokenStandard | undefined, tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      const polkadotAccount = getState().wallet.polkadotAccount;
      if (!tokenStandard) {
        return;
      }

      let newBalance = "--";
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
        } else {
        }
        newBalance = await getBep20AssetBalance(
          metaMaskAccount,
          tokenAbi,
          tokenAddress
        );
      } else if (tokenStandard === TokenStandard.ERC20) {
        // Query erc20 rToken balance.
        const erc20TokenContractConfig = getErc20TokenContractConfig();
        let tokenAbi = undefined;
        let tokenAddress = undefined;
        if (tokenName === TokenName.ETH) {
          tokenAbi = getErc20REthTokenAbi();
          tokenAddress = erc20TokenContractConfig.rETH;
        } else {
        }
        newBalance = await getErc20AssetBalance(
          metaMaskAccount,
          tokenAbi,
          tokenAddress
        );
      }

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

export const updateRTokenRatio =
  (tokenName: TokenName): AppThunk =>
  async (dispatch, getState) => {
    try {
      let newRatio = "--";

      if (tokenName === TokenName.ETH) {
        const erc20TokenContractConfig = getErc20TokenContractConfig();
        const web3 = createWeb3(
          new Web3.providers.WebsocketProvider(getWeb3ProviderUrlConfig().eth)
        );

        let contract = new web3.eth.Contract(
          getErc20REthTokenAbi(),
          erc20TokenContractConfig.rETH
        );
        const amount = web3.utils.toWei("1");
        const result = await contract.methods.getEthValue(amount).call();
        newRatio = web3.utils.fromWei(result, "ether");
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
      }

      const rTokenStakerAprStore = getState().rToken.rTokenStakerAprStore;
      const newValue = {
        ...rTokenStakerAprStore,
        [tokenName]: newApr,
      };
      dispatch(setRTokenStakerAprStore(newValue));
    } catch (err: unknown) {}
  };
