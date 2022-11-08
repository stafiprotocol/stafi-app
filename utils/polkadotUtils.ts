import { ApiPromise, WsProvider } from "@polkadot/api";
import { getStafiRpc } from "config/env";
import { stafi_types } from "config/stafi_types";
import { TokenSymbol } from "interfaces/common";
import { chainAmountToHuman } from "./number";

export async function getNativeRTokenBalance(
  userAddress: string | undefined,
  tokenSymbol: TokenSymbol | undefined
) {
  if (!userAddress || tokenSymbol === undefined) {
    return "--";
  }
  try {
    const provider = new WsProvider(getStafiRpc());
    const api = await ApiPromise.create({
      provider: provider,
      types: stafi_types,
    });
    const accountData = await api.query.rBalances.account(
      tokenSymbol,
      userAddress
    );
    let data = accountData.toJSON();
    data = chainAmountToHuman(data ? data + "" : "0", tokenSymbol);
    return data;
  } catch (err: unknown) {
    console.log(err);
    return "--";
  }
}
