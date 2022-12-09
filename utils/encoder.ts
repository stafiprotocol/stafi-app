import { hexToU8a } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import { rSymbol } from "keyring/defaults";
import { STAFI_SS58_FORMAT } from "./constants";

export function getPoolAddress(poolPubkey: string, symbol: rSymbol) {
  if (symbol === rSymbol.Matic || symbol === rSymbol.Bnb) {
    return poolPubkey;
  } else if (symbol === rSymbol.Atom) {
    return encodeAddress(hexToU8a(poolPubkey), STAFI_SS58_FORMAT);
  } else {
    return encodeAddress(poolPubkey, STAFI_SS58_FORMAT);
  }
}
