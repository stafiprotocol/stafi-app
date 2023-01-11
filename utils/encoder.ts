import { hexToU8a } from "@polkadot/util";
import { encodeAddress } from "@polkadot/util-crypto";
import { rSymbol } from "keyring/defaults";
import { STAFI_SS58_FORMAT } from "./constants";
import { PublicKey } from "@solana/web3.js";

export function getPoolAddress(poolPubkey: string, symbol: rSymbol) {
  if (symbol === rSymbol.Matic || symbol === rSymbol.Bnb) {
    return poolPubkey;
  } else if (symbol === rSymbol.Atom) {
    return encodeAddress(hexToU8a(poolPubkey), STAFI_SS58_FORMAT);
  } else if (symbol === rSymbol.Sol) {
    return new PublicKey(hexToU8a(poolPubkey)).toBase58();
  } else {
    return encodeAddress(poolPubkey, STAFI_SS58_FORMAT);
  }
}
