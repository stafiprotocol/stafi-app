import { keccakAsHex } from "@polkadot/util-crypto";
import { checkAddressChecksum } from "web3-utils";

export function openLink(url: string | undefined | null) {
  if (!url) {
    return;
  }
  const otherWindow = window.open();
  if (otherWindow) {
    otherWindow.opener = null;
    otherWindow.location = url;
  }
}

export function isServer() {
  return typeof window === undefined;
}

export function checkMetaMaskAddress(address: string) {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
    // If it's ALL lowercase or ALL upppercase
  } else if (
    /^(0x|0X)?[0-9a-f]{40}$/.test(address) ||
    /^(0x|0X)?[0-9A-F]{40}$/.test(address)
  ) {
    return true;
    // Otherwise check each case
  } else {
    return checkAddressChecksum(address);
    // address = address.replace(/^0x/i, "");
    // var addressHash = keccakAsHex(address.toLowerCase()).substr(2);

    // for (var i = 0; i < 40; i++) {
    //   // the nth letter should be uppercase if the nth digit of casemap is 1
    //   if (
    //     (parseInt(addressHash[i], 16) > 7 &&
    //       address[i].toUpperCase() !== address[i]) ||
    //     (parseInt(addressHash[i], 16) <= 7 &&
    //       address[i].toLowerCase() !== address[i])
    //   ) {
    //     return false;
    //   }
    // }
    // return true;
  }
}
