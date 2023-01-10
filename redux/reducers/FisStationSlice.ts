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
import snackbarUtil from "utils/snackbarUtils";
import { CANCELLED_MESSAGE } from "utils/constants";
import { stafiServer } from "servers/stafi";
import { dotServer } from "servers/dot";
import { ksmServer } from "servers/ksm";

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
  swapLoading: boolean;
}

const initialState: FisStatonState = {
  swapLimit: {
    max: 0,
    min: 0,
  },
  poolInfoList: [],
  swapLoading: false,
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
    setSwapLoading: (state: FisStatonState, aciton: PayloadAction<boolean>) => {
      state.swapLoading = aciton.payload;
    },
  },
});

export const { setSwapLimit, setPoolInfoList, setSwapLoading } =
  fisStationSlice.actions;

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
    tokenAmount: string,
    fisAmount: string,
    minOutFisAmount: string | number,
    cb?: Function
  ): AppThunk =>
  async (dispatch, getState) => {
    const poolInfoList = getState().fisStation.poolInfoList;
    const selectedPoolInfo = poolInfoList.find(
      (info: PoolInfoItem) => info.symbol === tokenName
    );
    if (!selectedPoolInfo) return;

    dispatch(setSwapLoading(true));

    if (tokenName === TokenName.ETH) {
      dispatch(
        handleSwapEth(
          selectedPoolInfo.poolAddress,
          tokenAmount,
          fisAmount,
          minOutFisAmount
        )
      );
    } else if (tokenName === TokenName.DOT || tokenName === TokenName.KSM) {
      dispatch(
        handleSwapDotAndKsm(
          tokenName,
          selectedPoolInfo.poolAddress,
          tokenAmount,
          fisAmount,
          minOutFisAmount
        )
      );
    }
  };

export const handleSwapEth =
  (
    poolAddress: string,
    tokenAmount: string,
    fisAmount: string,
    minOutFisAmount: string | number
  ): AppThunk =>
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
          throw new Error("signature error");
        });
      if (!signature) {
        throw new Error("signature error");
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
        throw new Error("bundle address error");
      }

      const bundleAddressId = resJson.data.bundleAddressId;

      const amountInWei = Web3.utils.toWei(tokenAmount, "ether");
      const amountHex = Web3.utils.toHex(amountInWei);

      const txParams = {
        value: amountHex,
        gas: "0x54647",
        to: poolAddress,
        from: metaMaskAccount,
        chainId: getMetamaskEthChainId(),
      };
      const txHash = await ethereum
        .request({
          method: "eth_sendTransaction",
          params: [txParams],
        })
        .catch((err: any) => {
          throw new Error(err);
        });
      if (!txHash) {
        throw new Error("send transaction failed");
      }

      let txDetail;
      while (true) {
        await sleep(3000);
        txDetail = await ethereum
          .request({
            method: "eth_getTransactionByHash",
            params: [txHash],
          })
          .catch((err: any) => {
            throw new Error(err.message);
          });
        if (!txDetail || txDetail.blockHash) {
          break;
        }
      }

      const blockHash = txDetail && txDetail.blockHash;
      if (!blockHash) {
        throw new Error("get block hash error");
      }

      const minOutAmount = numberUtil.tokenAmountToChain(
        minOutFisAmount + "",
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
    } catch (err: any) {
      dispatch(setSwapLoading(false));
      if (err.code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error(err.message);
      }
    }
  };

export const handleSwapDotAndKsm =
  (
    tokenName: TokenName.DOT | TokenName.KSM,
    poolAddress: string,
    tokenAmount: string,
    fisAmount: string,
    minOutFisAmount: string | number
  ): AppThunk =>
  async (dispatch, getState) => {
    let address;
    if (tokenName === TokenName.DOT) {
      address = getState().wallet.dotAccount;
    } else {
      address = getState().wallet.ksmAccount;
    }
    const polkadotAccount = getState().wallet.polkadotAccount;
    if (!address || !polkadotAccount) return;

    const amount = numberUtil.tokenAmountToChain(
      tokenAmount,
      tokenName === TokenName.DOT ? rSymbol.Dot : rSymbol.Ksm
    );
    const minOutAmount = numberUtil.tokenAmountToChain(
      minOutFisAmount + "",
      rSymbol.Fis
    );

    const { web3Enable, web3FromSource } = await import(
      "@polkadot/extension-dapp"
    );
    web3Enable(stafiServer.getWeb3EnableName());
    const injector = await web3FromSource(stafiServer.getPolkadotJsSource());

    let api;
    if (tokenName === TokenName.DOT) {
      api = await dotServer.createDotApi();
    } else {
      api = await ksmServer.createKsmApi();
    }

    const dotKeyringInstance = keyring.init(Symbol.Dot);
    const ksmKeyringInstance = keyring.init(Symbol.Ksm);
    const fisKeyringInstance = keyring.init(Symbol.Fis);

    let pubKey: `0x${string}`;
    if (tokenName === TokenName.DOT) {
      pubKey = u8aToHex(dotKeyringInstance.decodeAddress(address));
    } else {
      pubKey = u8aToHex(ksmKeyringInstance.decodeAddress(address));
    }
    const stafiAddress = u8aToHex(
      fisKeyringInstance.decodeAddress(polkadotAccount)
    );

    const signature = await fisStationSignature(address, stafiAddress);
    if (!signature) {
      console.error("signature error");
      return;
    }

    const response = await await fetch(
      `${getApiHost()}/feeStation/api/v1/station/bundleAddress`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stafiAddress,
          symbol: tokenName,
          poolAddress,
          signature,
          pubKey,
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
      throw new Error("bundle address error");
    }

    const bundleAddressId = resJson.data.bundleAddressId;

    const ex = await api.tx.balances.transferKeepAlive(poolAddress, amount);
    ex.signAndSend(address, { signer: injector.signer }, (result: any) => {
      const tx = ex.hash.toHex();
      const asInBlock = result.status.asInBlock;

      if (result.status.isInBlock) {
        result.events
          .filter((e: any) => e.event.section === "system")
          .forEach((data: any) => {
            if (data.event.method === "ExtrinsicFailed") {
              const [dispatchError] = data.event.data;
              if (dispatchError.isModule) {
              }
            } else if (data.event.method === "ExtrinsicSuccess") {
              const params: UploadSwapInfoParams = {
                stafiAddress,
                symbol: tokenName,
                blockHash: asInBlock,
                txHash: tx,
                poolAddress,
                signature,
                pubKey,
                inAmount: amount,
                minOutAmount,
                bundleAddressId,
              };
              dispatch(uploadSwapInfo(params));
            }
          });
      }
    }).catch((err: any) => {});
  };

export const uploadSwapInfo =
  (params: UploadSwapInfoParams): AppThunk =>
  async (dispatch, getState) => {
    try {
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
        dispatch(setSwapLoading(false));
        snackbarUtil.success("Swap Succeeded");
      } else {
        throw new Error("swap error");
      }
    } catch (err: any) {
      dispatch(setSwapLoading(false));
      snackbarUtil.error(err);
    }
  };

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fisStationSignature = async (address: string, data: any) => {
  const { web3Enable, web3FromSource } = await import(
    "@polkadot/extension-dapp"
  );
  web3Enable(stafiServer.getWeb3EnableName());
  const injector = await web3FromSource(stafiServer.getPolkadotJsSource());

  const signRaw = injector.signer.signRaw;
  if (!signRaw) return;
  const { signature } = await signRaw({
    address,
    data,
    type: "bytes",
  });

  return signature;
};
