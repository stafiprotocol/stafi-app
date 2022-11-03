import { rSymbol, Symbol } from "keyring/defaults";
import { KeyringStruct } from "keyring/SubstrateKeyring";
import StafiServer from "servers/stafi";

export class KeyringServer {
	public init(symbol: Symbol): KeyringStruct {
		switch (symbol) {
			case Symbol.Xtz:
			case Symbol.Fis:
				return new StafiServer();
			// todo:
			default:
				return new StafiServer();
		}
	}

	public initByRSymbol(symbol: rSymbol): KeyringStruct {
		switch (symbol) {
			case rSymbol.Fis:
				return new StafiServer();
			// todo:
			default:
				return new StafiServer();
		}
	}
}

const keyringInstance = new KeyringServer();
export default keyringInstance;