import { TokenName } from "interfaces/common";

export function estimateUnbondDays(tokenName: TokenName) {
  if (tokenName === TokenName.MATIC) {
    return 9;
  }
  return 0;
}
