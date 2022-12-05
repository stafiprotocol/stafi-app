import { ApiPromise, WsProvider } from "@polkadot/api";
import { KeypairType } from "@polkadot/util-crypto/types";
import { getPolkadotRpc } from "config/env";
import { SubstrateKeyring } from "keyring/SubstrateKeyring";

let dotApi: any = null;

export default class DotServer extends SubstrateKeyring {
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

  async createKsmApi(): Promise<ApiPromise> {
    if (dotApi) return dotApi;

    dotApi = this.createSubstrateApi(getPolkadotRpc());
    return dotApi;
  }

  private async createSubstrateApi(provider: string) {
    const wsProvider = new WsProvider(provider);
    return await ApiPromise.create({
      provider: wsProvider,
    });
  }
}

export const dotServer = new DotServer();
