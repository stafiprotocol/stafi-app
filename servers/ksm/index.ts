import { ApiPromise, WsProvider } from "@polkadot/api-old";
import { KeypairType } from "@polkadot/util-crypto/types";
import { getKsmRpc } from "config/env";
import { SubstrateKeyring } from "keyring/SubstrateKeyring";

let ksmApi: any = null;

export default class KsmServer extends SubstrateKeyring {
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
    if (ksmApi) return ksmApi;

    ksmApi = this.createSubstrateApi(getKsmRpc());
    return ksmApi;
  }

  private async createSubstrateApi(provider: string) {
    const wsProvider = new WsProvider(provider);
    return await ApiPromise.create({
      provider: wsProvider,
    });
  }
}

export const ksmServer = new KsmServer();
