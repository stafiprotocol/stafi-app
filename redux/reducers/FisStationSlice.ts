import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getApiHost } from "config/env";
import { TokenName, TokenSymbol } from "interfaces/common";
import { AppThunk } from "redux/store";
import numberUtil from "utils/numberUtil";
import keyring from "servers/keyring";
import { rSymbol, Symbol } from "keyring/defaults";
import { u8aToHex, stringToHex } from "@polkadot/util";
import Web3 from "web3";
import {
  getMetamaskEthChainId,
  getMetamaskMaticChainId,
} from "config/metaMask";

declare const ethereum: any;

export interface SwapLimit {
  max: number;
  min: number;
}

export interface PoolInfoItem {
  symbol: TokenName;
  swapRate: string;
  poolAddress: string;
}

export interface FisStatonState {
  swapLimit: SwapLimit;
  poolInfoList: PoolInfoItem[];
}

const initialState: FisStatonState = {
  swapLimit: {
    max: 0,
    min: 0,
  },
  poolInfoList: [],
};

export const fisStationSlice = createSlice({
  name: "fisStation",
  initialState,
  reducers: {
    setSwapLimit: (state: FisStatonState, action: PayloadAction<SwapLimit>) => {
      state.swapLimit = action.payload;
    },
    setPoolInfoList: (
      state: FisStatonState,
      action: PayloadAction<PoolInfoItem[]>
    ) => {
      state.poolInfoList = action.payload;
    },
  },
});

export const { setSwapLimit, setPoolInfoList } = fisStationSlice.actions;

export default fisStationSlice.reducer;

export const updatePoolInfoList =
  (): AppThunk => async (dispatch, getState) => {
    try {
      const response = await fetch(
        `${getApiHost()}/feeStation/api/v1/station/poolInfo`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resJson = await response.json();
      if (resJson && resJson.status === "80000") {
        const { swapMaxLimit, swapMinLimit, poolInfoList } = resJson.data;
        dispatch(
          setSwapLimit({
            max: numberUtil.fisAmountToHuman(swapMaxLimit),
            min: numberUtil.fisAmountToHuman(swapMinLimit),
          })
        );
        dispatch(setPoolInfoList(poolInfoList));
      }
    } catch (err: any) {}
  };

interface UploadSwapInfoParams {
  stafiAddress: string;
  symbol: string;
  blockHash: string;
  txHash: string;
  poolAddress: string;
  signature: string;
  pubKey: string;
  inAmount: string;
  minOutAmount: string;
  bundleAddressId: string;
}

export const handleSwap =
  (
    tokenName: TokenName,
    amount: string,
    minOutFisAmount: string,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    const poolInfoList = getState().fisStation.poolInfoList;
    const selectedPoolInfo = poolInfoList.find(
      (info: PoolInfoItem) => info.symbol === tokenName
    );
    if (!selectedPoolInfo) return;

    if (tokenName === TokenName.ETH) {
      dispatch(
        handleSwapEth(selectedPoolInfo.poolAddress, amount, minOutFisAmount)
      );
    }
  };

export const handleSwapEth =
  (poolAddress: string, amount: string, minOutFisAmount: string): AppThunk =>
  async (dispatch, getState) => {
    try {
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      const polkadotAccount = getState().wallet.polkadotAccount;
      if (!metaMaskAccount || !polkadotAccount) {
        return;
      }
      const keyringInstance = keyring.init(Symbol.Fis);
      const stafiAddress = u8aToHex(
        keyringInstance.decodeAddress(polkadotAccount)
      );
      const data = stringToHex(polkadotAccount);

      const signature = await ethereum
        .request({
          method: "personal_sign",
          params: [metaMaskAccount, data],
        })
        .catch((err: any) => {
          console.error(err);
        });
      if (!signature) {
        throw new Error("");
      }
      const response = await fetch(
        `${getApiHost()}/feeStation/api/v1/station/bundleAddress`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stafiAddress,
            symbol: "ETH",
            poolAddress,
            signature,
            pubKey: metaMaskAccount,
          }),
        }
      );
      const resJson = await response.json();
      if (
        !resJson ||
        resJson.status !== "80000" ||
        !resJson.data ||
        !resJson.data.bundleAddressId
      ) {
        throw new Error("");
      }

      const bundleAddressId = resJson.data.bundleAddressId;

      const amountInWei = Web3.utils.toWei(amount, "ether");
      const amountHex = Web3.utils.toHex(amountInWei);
      const txParams = {
        value: amountHex,
        gas: "0x54647",
        to: poolAddress,
        from: metaMaskAccount,
        chainId: getMetamaskMaticChainId(),
      };
      const txHash = await ethereum
        .request({
          method: "eth_sendTransaction",
          params: [txParams],
        })
        .catch((err: any) => {});
      if (!txHash) {
        throw new Error("");
      }

      let txDetail;
      while (true) {
        await sleep(3000);
        txDetail = await ethereum
          .request({
            method: "eth_getTransactionByHash",
            params: [txHash],
          })
          .catch((err: any) => {});
        if (!txDetail || txDetail.blockHash) {
          break;
        }
      }

      const blockHash = txDetail && txDetail.blockHash;
      if (!blockHash) {
        throw new Error("");
      }

      const minOutAmount = numberUtil.tokenAmountToChain(
        minOutFisAmount,
        rSymbol.Fis
      );
      const params: UploadSwapInfoParams = {
        stafiAddress,
        symbol: "ETH",
        blockHash,
        txHash,
        poolAddress,
        signature,
        pubKey: metaMaskAccount,
        inAmount: amountInWei,
        bundleAddressId,
        minOutAmount,
      };
      dispatch(uploadSwapInfo(params));
    } catch (err: any) {}
  };

export const uploadSwapInfo =
  (params: UploadSwapInfoParams): AppThunk =>
  async (dispatch, getState) => {
    const response = await fetch(
      `${getApiHost()}/feeStation/api/v2/station/swapInfo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    const resJson = await response.json();
    if (resJson.status === "80014") {
      throw new Error("Slippage exceeded");
    } else if (resJson.status === "80006") {
      throw new Error("Failed to verify signature");
    } else if (resJson.status === "80000") {
      console.log("succeeded");
    } else {
      throw new Error("swap error");
    }
  };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
