import { TokenSymbol, WalletType } from "interfaces/common";
import { InjectedPolkadotAccountWithMeta } from "redux/reducers/WalletSlice";
import StafiServer from "servers/stafi";
import { chainAmountToHuman } from "./number";
import { decodeAddress } from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";

export async function getNativeRTokenBalance(
  userAddress: string | undefined,
  tokenSymbol: TokenSymbol | undefined
) {
  if (!userAddress || tokenSymbol === undefined) {
    return "--";
  }
  try {
    const api = await new StafiServer().createStafiApi();
    const accountData = await api.query.rBalances.account(
      tokenSymbol,
      userAddress
    );
    let data: any = accountData.toJSON();
    data = chainAmountToHuman(data ? data.free + "" : "0", tokenSymbol);
    return data;
  } catch (err: unknown) {
    // console.log(err);
    return "--";
  }
}

export function getPolkadotAccountBalance(
  address: string | undefined,
  extensionAccounts: InjectedPolkadotAccountWithMeta[],
  walletType: WalletType
) {
  const matchedExtensionAccount = extensionAccounts.find(
    (account) => account.address === address
  );

  if (!matchedExtensionAccount) {
    return "--";
  }

  if (walletType === WalletType.Polkadot_KSM) {
    return matchedExtensionAccount.ksmBalance || "--";
  } else if (walletType === WalletType.Polkadot_DOT) {
    return matchedExtensionAccount.dotBalance || "--";
  } else {
    return matchedExtensionAccount.fisBalance || "--";
  }
}

export const getPolkadotStakingSignature = async (address: any, data: any) => {
  try {
    const { web3Enable, web3FromSource } = await import(
      "@polkadot/extension-dapp"
    );
    web3Enable("stafi/rtoken");
    const injector = await web3FromSource("polkadot-js");
    const signRaw = injector?.signer?.signRaw;
    if (signRaw) {
      const { signature } = await signRaw({
        address: address,
        data: data,
        type: "bytes",
      });
      return signature;
    }
  } catch (err: unknown) {}

  return undefined;
};

export function polkadotAddressToHex(address: string) {
  return u8aToHex(decodeAddress(address));
}
