import {
  DexType,
  TokenName,
  TokenStandard,
  TokenSymbol,
} from "interfaces/common";
import { formatNumber } from "./number";
import curveIcon from "public/dex/curve.svg";
import pancakeIcon from "public/dex/pancake.svg";
import rDEXIcon from "public/dex/r_dex.png";
import sifchainIcon from "public/dex/sifchain.svg";
import uniswapIcon from "public/dex/uniswap.png";
import { getMetamaskMaticChainId } from "config/metaMask";

export interface DexItem {
  type: DexType;
  tokenStandard: TokenStandard;
  url: string;
}

export function getSupportedTokenStandards(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) {
    // return [TokenStandard.Native, TokenStandard.ERC20, TokenStandard.BEP20];
    return [TokenStandard.ERC20];
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

export function getRewardText(reward: string) {
  return reward !== "--"
    ? Number(reward) > 0 && Number(reward) < 0.000001
      ? "<0.000001"
      : `+${formatNumber(reward)}`
    : "--";
}

export function getDexIcon(type: DexType): any {
  if (type === DexType.rDEX) {
    return rDEXIcon;
  } else if (type === DexType.Uniswap) {
    return uniswapIcon;
  } else if (type === DexType.Pancake) {
    return pancakeIcon;
  } else if (type === DexType.Curve) {
    return curveIcon;
  } else if (type === DexType.Sifchain) {
    return sifchainIcon;
  }
}

export function getDexList(tokenName: TokenName): DexItem[] {
  if (tokenName === TokenName.ETH) {
    return [
      {
        type: DexType.rDEX,
        tokenStandard: TokenStandard.Native,
        url: "https://app.rdex.finance/swap?first=rETH&second=FIS",
      },
      {
        type: DexType.Uniswap,
        tokenStandard: TokenStandard.ERC20,
        url: "https://app.uniswap.org/#/swap?inputCurrency=0x9559aaa82d9649c7a7b220e7c461d2e74c9a3593&outputCurrency=ETH",
      },
      {
        type: DexType.Curve,
        tokenStandard: TokenStandard.ERC20,
        url: "https://curve.fi/reth",
      },
    ];
  }
  return [];
}
