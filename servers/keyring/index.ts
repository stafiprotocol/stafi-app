import { TokenSymbol } from "interfaces/common";
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

	public initByTokenSymbol(symbol: TokenSymbol | undefined): KeyringStruct {
		switch (symbol) {
			case TokenSymbol.FIS:
				return new StafiServer();
			// todo:
			default:
				return new StafiServer();
		}
	}
}

const keyringInstance = new KeyringServer();
export default keyringInstance;
