import { ApiPromise } from "@polkadot/api";
import { AnyJson } from "@polkadot/types-codec/types";
import { hexToU8a } from "@polkadot/util";
import { TokenSymbol } from "interfaces/common";
import { QueueTx } from "interfaces/tx";
import { rSymbol, Symbol } from "keyring/defaults";
import { AppThunk } from "redux/store";
import keyring from "servers/keyring";
import { stafiServer } from "servers/stafi";
import { chainAmountToHuman } from "utils/number";
import numberUtil from "utils/numberUtil";
import { handleTxResults } from "utils/polkadotTx";
import snackbarUtil from "utils/snackbarUtils";
import { updateSelectedPolkadotAccountBalance } from "./WalletSlice";

export default class CommonSlice {
  async getPools(type: rSymbol, symbol: Symbol, cb?: Function) {
    const stafiApi = await stafiServer.createStafiApi();
    const poolsData = await stafiApi.query.rTokenLedger.bondedPools(type);
    let pools = poolsData.toJSON();

    // todo: check type of pools
    if (pools && (pools as AnyJson[]).length > 0) {
      pools = pools as AnyJson[];
      pools.forEach((poolPubKey: any) => {
        stafiApi.query.rTokenLedger
          .bondPipelines(type, poolPubKey)
          .then((bondedData: any) => {
            let active = 0;
            let bonded = bondedData.toJSON();
            if (bonded) {
              active = bonded.active;
            }
            const keyringInstance = keyring.init(symbol);

            let poolAddress;
            if (symbol === Symbol.Matic) {
              poolAddress = poolPubKey;
            } else if (symbol === Symbol.Bnb) {
              poolAddress = poolPubKey;
            } else if (symbol === Symbol.Atom) {
              poolAddress = keyringInstance.encodeAddress(hexToU8a(poolPubKey));
            } else {
              poolAddress = keyringInstance.encodeAddress(poolPubKey);
            }

            cb &&
              cb({
                address: poolAddress,
                poolPubKey,
                active,
              });
          })
          .catch((err: any) => {
            console.log("getPools error:", err);
            cb && cb(null);
          });
      });
    } else {
      cb && cb(null);
    }
  }

  async poolBalanceLimit(type: rSymbol) {
    const stafiApi = await stafiServer.createStafiApi();
    const result = await stafiApi.query.rTokenSeries.poolBalanceLimit(type);
    return result.toJSON();
  }

  async queryRBalance(fisAddress: string, rSymbol: rSymbol, cb?: Function) {
    const stafiApi = await stafiServer.createStafiApi();
    const accountData = await stafiApi.query.rBalances.account(
      rSymbol,
      fisAddress
    );
    const data = accountData.toJSON();
    cb && cb(data);
    return data;
  }

  getPool(
    tokenAmount: any,
    validPools: any[],
    poolLimit: any,
    errMsg?: string
  ) {
    const data = validPools.find((item: any) => {
      if (
        Number(poolLimit) === 0 ||
        Number(item.active) + Number(tokenAmount) <= Number(poolLimit)
      ) {
        return true;
      }
    });

    if (data) {
      return data;
    } else {
      console.error(errMsg || "No Matching pool");
      return null;
    }
  }

  getPoolForUnbond(
    tokenAmount: string,
    validPools: any[],
    type: rSymbol,
    msgStr?: string
  ) {
    const amount = numberUtil.tokenAmountToChain(tokenAmount.toString(), type);
    const data = validPools.find((item: any) => {
      if (Number(item.active) >= Number(amount)) return true;
    });
    if (!data) {
      console.error(msgStr || "No matching pool");
      return null;
    }
    return data;
  }

  async getUnbondFees(rsymbol: rSymbol) {
    const stafiApi = await stafiServer.createStafiApi();
    const result = await stafiApi.query.rTokenSeries.unbondFees(rsymbol);
    return result.toJSON();
  }

  async getUnbondCommision() {
    const stafiApi = await stafiServer.createStafiApi();
    const result = await stafiApi.query.rTokenSeries.unbondCommission();
    const unbondCommision = numberUtil.fisFeeToHuman(result.toJSON());
    return unbondCommision;
  }

  async getBondFees(rsymbol: rSymbol) {
    const stafiApi = await stafiServer.createStafiApi();
    const result = await stafiApi.query.rTokenSeries.bondFees(rsymbol);
    return result.toJSON();
  }
}
