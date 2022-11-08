import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getStafiLightNodeAbi,
  getStafiNetworkSettingsAbi,
  getStafiNodeManagerAbi,
  getStafiSuperNodeAbi,
  getStafiUserDepositAbi,
} from "config/erc20Abi";
import { getEtherScanTxUrl } from "config/explorer";
import { getErc20ContractConfig } from "config/erc20Contract";
import { TokenName, TokenStandard } from "interfaces/common";
import { AppThunk } from "redux/store";
import { CANCELLED_MESSAGE, COMMON_ERROR_MESSAGE } from "utils/constants";
import snackbarUtil from "utils/snackbarUtils";
import {
  removeStorage,
  STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP,
} from "utils/storage";
import { getShortAddress } from "utils/string";
import { createWeb3 } from "utils/web3Utils";
import Web3 from "web3";
import { addNotice, setIsLoading, setStakeLoadingParams } from "./AppSlice";
import { getApiHost } from "config/env";

interface EthStakeParams {
  type: "solo" | "trusted";
  pubkeys: string[];
  txHash: string;
  status: "staking" | "staked" | "waiting" | "active" | "exit" | "error";
}

export interface EthState {
  txLoading: boolean;
  balance: string;
  ethValidatorStakeModalVisible: boolean;
  ethValidatorStakeParams: EthStakeParams | undefined;
  gasPrice: string;
}

const initialState: EthState = {
  txLoading: false,
  balance: "",
  ethValidatorStakeModalVisible: false,
  // ethStakeParams: {
  //   type: "trusted",
  //   pubkeys: [
  //     "0x920b903c9bbca7982e245db9888c4d0c092325f1b96bf41d532d161e9713834f9787eee0cbc508ab9465c63de254265e",
  //   ],
  //   txHash: "0x123",
  //   status: 'waiting'
  // },
  ethValidatorStakeParams: undefined,
  gasPrice: "--",
};

export const ethSlice = createSlice({
  name: "eth",
  initialState,
  reducers: {
    setEthTxLoading: (state: EthState, action: PayloadAction<boolean>) => {
      state.txLoading = action.payload;
    },
    setEthBalance: (state: EthState, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    setEthValiatorStakeModalVisible: (
      state: EthState,
      action: PayloadAction<boolean>
    ) => {
      state.ethValidatorStakeModalVisible = action.payload;
    },
    setEthValidatorStakeParams: (
      state: EthState,
      action: PayloadAction<EthStakeParams | undefined>
    ) => {
      state.ethValidatorStakeParams = action.payload;
    },
    setGasPrice: (state: EthState, action: PayloadAction<string>) => {
      state.gasPrice = action.payload;
    },
  },
});

export const {
  setEthTxLoading,
  setEthBalance,
  setEthValiatorStakeModalVisible,
  setEthValidatorStakeParams,
  setGasPrice,
} = ethSlice.actions;

declare const window: any;
export default ethSlice.reducer;

export const updateEthBalance = (): AppThunk => async (dispatch, getState) => {
  const account = getState().wallet.metaMaskAccount;
  if (!account) {
    return;
  }

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });

    dispatch(setEthBalance(Web3.utils.fromWei(balance.toString())));
  } catch {}
};

export const updateEthGasPrice = (): AppThunk => async (dispatch, getState) => {
  const response = await fetch(`${getApiHost()}/reth/v1/gasPrice`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const resJson = await response.json();
  if (resJson && resJson.status === "80000") {
    dispatch(
      setGasPrice(
        Number(resJson.data?.baseFee) + Number(resJson.data?.priorityFee) + ""
      )
    );
  }
};

export const handleEthValidatorDeposit =
  (
    address: string,
    validatorKeys: any[],
    type: "solo" | "trusted",
    callback?: (success: boolean, result: any) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setEthTxLoading(true));
      const web3 = createWeb3();
      const ethContractConfig = getErc20ContractConfig();
      let contract = new web3.eth.Contract(
        type === "solo" ? getStafiLightNodeAbi() : getStafiSuperNodeAbi(),
        type === "solo"
          ? ethContractConfig.stafiLightNode
          : ethContractConfig.stafiSuperNode,
        {
          from: address,
        }
      );

      const pubkeys: string[] = [];
      const signatures: string[] = [];
      const depositDataRoots: string[] = [];

      validatorKeys.forEach((validatorKey) => {
        pubkeys.push("0x" + validatorKey.pubkey);
        signatures.push("0x" + validatorKey.signature);
        depositDataRoots.push("0x" + validatorKey.deposit_data_root);
      });

      // console.log("pubkeys", pubkeys);
      // console.log("signatures", signatures);
      // console.log("depositDataRoots", depositDataRoots);

      const sendParams =
        type === "solo"
          ? { value: Web3.utils.toWei(4 * validatorKeys.length + "") }
          : {};

      if (type === "solo") {
        const depositEnabled = await contract.methods
          .getLightNodeDepositEnabled()
          .call();
        if (!depositEnabled) {
          throw Error("Light node deposits are currently disabled");
        }

        const statusRequests = pubkeys.map((pubkey) => {
          return (async () => {
            const status = await contract.methods
              .getLightNodePubkeyStatus(pubkey)
              .call();
            return status;
          })();
        });

        const statusList = await Promise.all(statusRequests);
        statusList.forEach((status, index) => {
          if (Number(status) !== 0) {
            throw Error(
              `pubkey ${getShortAddress(pubkeys[index], 10)} already exists`
            );
          }
        });
      } else {
        let nodeManagerContract = new web3.eth.Contract(
          getStafiNodeManagerAbi(),
          ethContractConfig.stafiNodeManager
        );
        const exist = await nodeManagerContract.methods
          .getSuperNodeExists(address)
          .call();
        if (!exist) {
          throw Error("Invalid trusted node");
        }

        const depositEnabled = await contract.methods
          .getSuperNodeDepositEnabled()
          .call();
        if (!depositEnabled) {
          throw Error("Trusted node deposits are currently disabled");
        }

        const statusRequests = pubkeys.map((pubkey) => {
          return (async () => {
            const status = await contract.methods
              .getSuperNodePubkeyStatus(pubkey)
              .call();
            return status;
          })();
        });

        const statusList = await Promise.all(statusRequests);
        statusList.forEach((status, index) => {
          if (Number(status) !== 0) {
            throw Error(
              `pubkey ${getShortAddress(pubkeys[index], 10)} already exists`
            );
          }
        });

        const accountPubkeyCount = await contract.methods
          .getSuperNodePubkeyCount(address)
          .call();
        let networkSettingsContract = new web3.eth.Contract(
          getStafiNetworkSettingsAbi(),
          ethContractConfig.stafiNetworkSettings
        );
        const pubkeyLimit = await networkSettingsContract.methods
          .getSuperNodePubkeyLimit()
          .call();
        if (Number(accountPubkeyCount) + pubkeys.length > pubkeyLimit) {
          throw Error("Pubkey amount over limit");
        }
      }

      const result = await contract.methods
        .deposit(pubkeys, signatures, depositDataRoots)
        .send(sendParams);
      console.log("result", result);

      dispatch(setEthTxLoading(false));
      callback && callback(result?.status, result);

      if (result?.status) {
        dispatch(
          addNotice(
            result.transactionHash,
            "ETH Deposit",
            { transactionHash: result.transactionHash, sender: address },
            {
              type,
              amount: (type === "solo" ? 4 * pubkeys.length : 0) + "",
              pubkeys,
            },
            getEtherScanTxUrl(result.transactionHash),
            "Confirmed"
          )
        );
      } else {
        throw new Error(COMMON_ERROR_MESSAGE);
      }
    } catch (err: unknown) {
      dispatch(setEthTxLoading(false));
      if ((err as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error((err as any).message);
      }
    }
  };

export const handleEthValidatorStake =
  (
    address: string,
    validatorKeys: any[],
    type: "solo" | "trusted",
    callback?: (success: boolean, result: any) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setEthTxLoading(true));
      const web3 = createWeb3();
      const ethContractConfig = getErc20ContractConfig();
      let contract = new web3.eth.Contract(
        type === "solo" ? getStafiLightNodeAbi() : getStafiSuperNodeAbi(),
        type === "solo"
          ? ethContractConfig.stafiLightNode
          : ethContractConfig.stafiSuperNode,
        {
          from: address,
        }
      );

      const pubkeys: string[] = [];
      const signatures: string[] = [];
      const depositDataRoots: string[] = [];

      validatorKeys.forEach((validatorKey) => {
        pubkeys.push("0x" + validatorKey.pubkey);
        signatures.push("0x" + validatorKey.signature);
        depositDataRoots.push("0x" + validatorKey.deposit_data_root);
      });

      // console.log("pubkeys", pubkeys);
      // console.log("signatures", signatures);
      // console.log("depositDataRoots", depositDataRoots);

      dispatch(
        setEthValidatorStakeParams({
          pubkeys,
          type,
          status: "staking",
          txHash: "",
        })
      );
      dispatch(setEthValiatorStakeModalVisible(true));

      const result = await contract.methods
        .stake(pubkeys, signatures, depositDataRoots)
        .send();

      // console.log("result", result);

      dispatch(setEthTxLoading(false));
      callback && callback(result?.status, result);

      if (result?.status) {
        removeStorage(STORAGE_KEY_HIDE_ETH_VALIDATOR_FEE_TIP);
        dispatch(
          setEthValidatorStakeParams({
            pubkeys,
            type,
            txHash: result.transactionHash,
            status: "staking",
          })
        );

        dispatch(
          addNotice(
            result.transactionHash,
            "ETH Stake",
            { transactionHash: result.transactionHash, sender: address },
            {
              type,
              amount: 32 * pubkeys.length + "",
              pubkeys,
            },
            getEtherScanTxUrl(result.transactionHash),
            "Confirmed"
          )
        );
      } else {
        throw new Error(COMMON_ERROR_MESSAGE);
      }
    } catch (err: unknown) {
      dispatch(setEthTxLoading(false));
      if ((err as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        dispatch(setEthValiatorStakeModalVisible(false));
        dispatch(setEthValidatorStakeParams(undefined));
      } else {
        snackbarUtil.error((err as any).message);
      }
    }
  };

export const handleEthTokenStake =
  (
    tokenStandard: TokenStandard | undefined,
    stakeAmount: string,
    willReceiveAmount: string,
    newRTokenBalance: string,
    callback?: (success: boolean, result: any) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      if (!tokenStandard) {
        return;
      }

      dispatch(setIsLoading(true));
      dispatch(
        setStakeLoadingParams({
          modalVisible: true,
          status: "loading",
          tokenStandard,
          tokenName: TokenName.ETH,
          amount: stakeAmount,
          willReceiveAmount,
          newRTokenBalance,
          progressDetail: {
            sending: {
              totalStatus: "loading",
            },
          },
        })
      );

      const web3 = createWeb3();
      const metaMaskAccount = getState().wallet.metaMaskAccount;
      if (!metaMaskAccount) {
        throw new Error("Please connect MetaMask");
      }
      const contractConfig = getErc20ContractConfig();
      let contract = new web3.eth.Contract(
        getStafiUserDepositAbi(),
        contractConfig.userDeposit,
        {
          from: metaMaskAccount,
        }
      );

      const stakeAmountInWei = web3.utils.toWei(stakeAmount.toString());
      const result = await contract.methods
        .deposit()
        .send({ value: stakeAmountInWei });
      console.log("stake result", result);

      callback && callback(result.status, result);
      if (result && result.status) {
        snackbarUtil.success("Deposit successfully");
        const txHash = result.transactionHash;
        dispatch(
          addNotice(
            txHash,
            "rToken Stake",
            { transactionHash: txHash, sender: metaMaskAccount },
            {
              tokenName: TokenName.ETH,
              amount: stakeAmount,
            },
            getEtherScanTxUrl(result.transactionHash),
            "Confirmed"
          )
        );
        dispatch(
          setStakeLoadingParams({
            status: "success",
            txHash: txHash,
            scanUrl: getEtherScanTxUrl(txHash),
            progressDetail: {
              sending: {
                totalStatus: "success",
                broadcastStatus: "success",
                packStatus: "success",
              },
            },
          })
        );
      } else {
        const txHash = result.transactionHash;

        dispatch(
          addNotice(
            txHash,
            "rToken Stake",
            { transactionHash: txHash, sender: metaMaskAccount },
            {
              tokenName: TokenName.ETH,
              amount: stakeAmount,
            },
            getEtherScanTxUrl(result.transactionHash),
            "Error"
          )
        );
        snackbarUtil.error("Error! Please try again");
      }
    } catch (err: unknown) {
      if ((err as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
        dispatch(setStakeLoadingParams(undefined));
      } else {
        snackbarUtil.error((err as any).message);
        dispatch(
          setStakeLoadingParams({
            status: "error",
          })
        );
      }
    } finally {
      dispatch(setIsLoading(false));
      dispatch(updateEthBalance());
    }
  };
