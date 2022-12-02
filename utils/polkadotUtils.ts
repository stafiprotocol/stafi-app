import { TokenSymbol } from "interfaces/common";
import StafiServer from "servers/stafi";
import { chainAmountToHuman } from "./number";

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
