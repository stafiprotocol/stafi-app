import { TokenName, TokenStandard, TokenSymbol } from "interfaces/common";

export function getSupportedTokenStandards(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) {
    return [TokenStandard.Native, TokenStandard.ERC20, TokenStandard.BEP20];
  }
  return [TokenStandard.Native, TokenStandard.ERC20, TokenStandard.BEP20];
}

export function getTokenSymbol(tokenName: TokenName): TokenSymbol | undefined {
  if (tokenName === TokenName.FIS) {
    return TokenSymbol.FIS;
  } else if (tokenName === TokenName.ETH) {
    return TokenSymbol.ETH;
  } else if (tokenName === TokenName.DOT) {
    return TokenSymbol.DOT;
  } else if (tokenName === TokenName.KSM) {
    return TokenSymbol.KSM;
  } else if (tokenName === TokenName.MATIC) {
    return TokenSymbol.MATIC;
  } else if (tokenName === TokenName.BNB) {
    return TokenSymbol.BNB;
  } else if (tokenName === TokenName.SOL) {
    return TokenSymbol.SOL;
  } else if (tokenName === TokenName.ATOM) {
    return TokenSymbol.ATOM;
  }
  return undefined;
}
