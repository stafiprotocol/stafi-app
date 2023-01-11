import { checkAddress } from "@polkadot/util-crypto/address/check";
import { validateAddress } from "@polkadot/util-crypto/address/validate";
import base58 from "bs58";
import { isAddress } from "web3-utils";

export function validateSS58Address(address: string): boolean {
  try {
    const isValid = validateAddress(address);
    return isValid;
  } catch {
    return false;
  }
}

export function validateETHAddress(address: string): boolean {
  return isAddress(address);
}

export function validateSolanaAddress(address: string): boolean {
  try {
    const decoded = base58.decode(address);
    if (decoded.length != 32) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}
