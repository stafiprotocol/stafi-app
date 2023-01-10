import { TokenName } from "interfaces/common";

export function estimateUnbondDays(tokenName: TokenName) {
  if (tokenName === TokenName.MATIC) {
    return 9;
  }
  if (tokenName === TokenName.SOL) {
    return 3;
  }
  if (tokenName === TokenName.KSM) {
    return 8;
  }
  if (tokenName === TokenName.DOT) {
    return 29;
  }
  if (tokenName === TokenName.BNB) {
    return 16;
  }
  return 9;
}
