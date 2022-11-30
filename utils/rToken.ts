import {
  DexType,
  TokenName,
  TokenStandard,
  TokenSymbol,
  WalletType,
} from "interfaces/common";
import { formatNumber } from "./number";
import curveIcon from "public/dex/curve.svg";
import pancakeIcon from "public/dex/pancake.svg";
import rDEXIcon from "public/dex/r_dex.png";
import sifchainIcon from "public/dex/sifchain.svg";
import uniswapIcon from "public/dex/uniswap.png";
import { getMetamaskMaticChainId } from "config/metaMask";
import quickswapIcon from "public/dex/quick_swap.png";
import metaMask from "public/wallet/metaMask.svg";
import polkadot from "public/wallet/polkadot.svg";
import { EraRewardModel } from "hooks/useRTokenReward";
import dayjs from "dayjs";

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

export function getEraEstTimeTip(
  rewardItem: EraRewardModel,
  tokenName: TokenName
) {
  if (
    Number(rewardItem.addedRTokenAmount) < 0 ||
    getRewardText(rewardItem.reward) !== "--"
  ) {
    return "";
  }
  const updateTime = getExchangeRateUpdateTime(tokenName);
  const passedTime =
    (updateTime * 60 * 60 * 1000 -
      new Date().getTime() +
      rewardItem.startTimestamp) /
    1000;
  const leftHours = Math.floor(passedTime / (60 * 60));
  let leftMinutes = Math.floor((passedTime - leftHours * 60 * 60) / 60);
  if (leftHours < 1) {
    return `${leftMinutes < 1 ? 'A few' : leftMinutes} minutes left for data refresh`;
  }
  return `${leftHours} hours ${leftMinutes} mins left for data refresh`;
}

export function getExchangeRateUpdateTime(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) return 8;
  if (tokenName === TokenName.MATIC) return 24;
  return 24;
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
  } else if (type === DexType.Quickswap) {
    return quickswapIcon;
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
  if (tokenName === TokenName.MATIC) {
    return [
      {
        type: DexType.rDEX,
        tokenStandard: TokenStandard.Native,
        url: "https://app.rdex.finance/swap?first=rMATIC&second=FIS",
      },
      {
        type: DexType.Quickswap,
        tokenStandard: TokenStandard.ERC20,
        url: "https://quickswap.exchange/#/swap?inputCurrency=0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270&outputCurrency=0x9f28e2455f9ffcfac9ebd6084853417362bc5dbb",
      },
    ];
  }
  return [];
}

export function getWalletIcon(walletType: WalletType | undefined) {
  if (walletType === WalletType.MetaMask) {
    return metaMask;
  }
  if (walletType === WalletType.Polkadot) {
    return polkadot;
  }
  return undefined;
}
