import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getStafiEthContractConfig,
  getStafiLightNodeAbi,
  getStafiNetworkSettingsAbi,
  getStafiNodeManagerAbi,
  getStafiSuperNodeAbi,
} from "config/eth";
import { getEtherScanTxUrl } from "config/explorer";
import { AppThunk } from "redux/store";
import { CANCELLED_MESSAGE, COMMON_ERROR_MESSAGE } from "utils/constants";
import snackbarUtil from "utils/snackbarUtils";
import { getShortAddress } from "utils/string";
import { createWeb3 } from "utils/web3Utils";
import Web3 from "web3";
import { addNotice, setUnreadNoticeFlag } from "./AppSlice";

interface EthStakeParams {
  type: "solo" | "trust";
  pubkeys: string[];
  txHash: string;
  status: "staking" | "staked" | "waiting" | "active" | "exit" | "error";
}

export interface EthState {
  txLoading: boolean;
  balance: string;
  ethStakeModalVisible: boolean;
  ethStakeParams: EthStakeParams | undefined;
}

const initialState: EthState = {
  txLoading: false,
  balance: "",
  ethStakeModalVisible: false,
  // ethStakeParams: {
  //   type: "trust",
  //   pubkeys: [
  //     "0x920b903c9bbca7982e245db9888c4d0c092325f1b96bf41d532d161e9713834f9787eee0cbc508ab9465c63de254265e",
  //   ],
  //   txHash: "0x123",
  // },
  ethStakeParams: undefined,
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
    setEthStakeModalVisible: (
      state: EthState,
      action: PayloadAction<boolean>
    ) => {
      state.ethStakeModalVisible = action.payload;
    },
    setEthStakeParams: (
      state: EthState,
      action: PayloadAction<EthStakeParams | undefined>
    ) => {
      state.ethStakeParams = action.payload;
    },
  },
});

export const {
  setEthTxLoading,
  setEthBalance,
  setEthStakeModalVisible,
  setEthStakeParams,
} = ethSlice.actions;

export default ethSlice.reducer;

export const handleEthDeposit =
  (
    address: string,
    validatorKeys: any[],
    type: "solo" | "trust",
    callback?: (success: boolean, result: any) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setEthTxLoading(true));
      const web3 = createWeb3();
      const ethContractConfig = getStafiEthContractConfig();
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
          throw Error("Invalid trust node");
        }

        const depositEnabled = await contract.methods
          .getSuperNodeDepositEnabled()
          .call();
        if (!depositEnabled) {
          throw Error("Trust node deposits are currently disabled");
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
      callback && callback(true, result);

      dispatch(
        addNotice(
          result.transactionHash,
          "ETH Deposit",
          { transactionHash: result.transactionHash, sender: address },
          {
            type,
            amount:
              (type === "solo" ? 4 * pubkeys.length : pubkeys.length) + "",
            pubkeys,
          },
          getEtherScanTxUrl(result.transactionHash),
          "Confirmed"
        )
      );
    } catch (err: unknown) {
      dispatch(setEthTxLoading(false));
      // console.log(err);

      if (err instanceof Error) {
        snackbarUtil.error(err.message);
      } else if ((err as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error((err as any).message);
      }
    }
  };
export const handleEthStake =
  (
    address: string,
    validatorKeys: any[],
    type: "solo" | "trust",
    callback?: (success: boolean, result: any) => void
  ): AppThunk =>
  async (dispatch, getState) => {
    try {
      dispatch(setEthTxLoading(true));
      const web3 = createWeb3();
      const ethContractConfig = getStafiEthContractConfig();
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

      const result = await contract.methods
        .stake(pubkeys, signatures, depositDataRoots)
        .send();

      console.log("result", result);

      dispatch(setEthTxLoading(false));
      dispatch(
        setEthStakeParams({
          pubkeys,
          type,
          txHash: result.transactionHash,
          status: "staking",
        })
      );
      dispatch(setEthStakeModalVisible(true));
      callback && callback(true, result);

      dispatch(
        addNotice(
          result.transactionHash,
          "ETH Stake",
          { transactionHash: result.transactionHash, sender: address },
          {
            type,
            amount: 4 * pubkeys.length + "",
            pubkeys,
          },
          getEtherScanTxUrl(result.transactionHash),
          "Confirmed"
        )
      );
    } catch (err: unknown) {
      console.log(err);

      dispatch(setEthTxLoading(false));
      if (err instanceof Error) {
        snackbarUtil.error(err.message);
      } else if ((err as any).code === 4001) {
        snackbarUtil.error(CANCELLED_MESSAGE);
      } else {
        snackbarUtil.error((err as any).message);
      }
    }
  };
