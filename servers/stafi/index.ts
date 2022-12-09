import { KeypairType } from "@polkadot/util-crypto/types";
import { SubstrateKeyring } from "keyring/SubstrateKeyring";
import { ApiPromise, WsProvider } from "@polkadot/api-old";
import { getStafiRpc } from "config/env";
import { stafi_types } from "config/stafi_types";

let stafiApi: any = null;

export default class StafiServer extends SubstrateKeyring {
  constructor(keypairType: KeypairType = "sr25519") {
    super(keypairType);
    this._ss58_format = 20;
    this._symbol = "fis";
  }

  getWeb3EnableName() {
    return "stafi/rtoken";
  }

  getPolkadotJsSource() {
    return "polkadot-js";
  }

  async createStafiApi(): Promise<ApiPromise> {
    if (stafiApi) return stafiApi;

    stafiApi = this.createSubstrateApi(getStafiRpc(), stafi_types);
    return stafiApi;
  }

  private async createSubstrateApi(provider: string, types: any) {
    const wsProvider = new WsProvider(provider);
    return await ApiPromise.create({
      provider: wsProvider,
      types,
    });
  }
}

export const stafiServer = new StafiServer();
