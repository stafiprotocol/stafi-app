import { isDev } from "config/env";
import { EraRewardModel } from "hooks/useRTokenReward";
import {
  DexType,
  RTokenName,
  RTokenSymbol,
  TokenName,
  TokenStandard,
  TokenSymbol,
  TokenType,
  WalletType,
} from "interfaces/common";
import { rSymbol } from "keyring/defaults";
import curveIcon from "public/dex/curve.svg";
import pancakeIcon from "public/dex/pancake.svg";
import quickswapIcon from "public/dex/quick_swap.png";
import atrixIcon from "public/dex/atrix.svg";
import rDEXIcon from "public/dex/r_dex.png";
import sifchainIcon from "public/dex/sifchain.svg";
import uniswapIcon from "public/dex/uniswap.png";
import metaMask from "public/wallet/metaMask.svg";
import phantom from "public/wallet/phantom.png";
import polkadot from "public/wallet/polkadot.svg";
import { isPolkadotWallet } from "./common";
import { formatNumber, getDecimals } from "./number";

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
  if (tokenName === TokenName.SOL) {
    // return [TokenStandard.Native, TokenStandard.ERC20, TokenStandard.BEP20];
    return [TokenStandard.Native, TokenStandard.SPL];
  }
  if (tokenName === TokenName.BNB) {
    return [TokenStandard.Native, TokenStandard.BEP20];
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

export function getTokenType(tokenName: TokenName | RTokenName): TokenType {
  if (tokenName === TokenName.FIS) {
    return TokenType.FIS;
  } else if (tokenName === RTokenName.rFIS) {
    return TokenType.rFIS;
  } else if (tokenName === RTokenName.rETH) {
    return TokenType.rETH;
  } else if (tokenName === RTokenName.rMATIC) {
    return TokenType.rMATIC;
  } else if (tokenName === RTokenName.rKSM) {
    return TokenType.rKSM;
  } else if (tokenName === RTokenName.rDOT) {
    return TokenType.rDOT;
  } else if (tokenName === RTokenName.rSOL) {
    return TokenType.rSOL;
  }
  return TokenType.FIS;
}

export function getTokenSymbolFromTokenType(tokenType: string): TokenSymbol {
  switch (tokenType) {
    case "rfis":
      return TokenSymbol.FIS;
    case "rdot":
      return TokenSymbol.DOT;
    case "rksm":
      return TokenSymbol.KSM;
    case "ratom":
      return TokenSymbol.ATOM;
    case "rsol":
      return TokenSymbol.SOL;
    case "rmatic":
      return TokenSymbol.MATIC;
    case "rbnb":
      return TokenSymbol.BNB;
    case "reth":
      return TokenSymbol.ETH;
    default:
      return TokenSymbol.FIS;
  }
}

export const rTokenNameToTokenSymbol = (
  rTokenName: RTokenName
): TokenSymbol => {
  switch (rTokenName) {
    case RTokenName.rATOM:
      return TokenSymbol.ATOM;
    case RTokenName.rBNB:
      return TokenSymbol.BNB;
    case RTokenName.rDOT:
      return TokenSymbol.DOT;
    case RTokenName.rETH:
      return TokenSymbol.ETH;
    case RTokenName.rFIS:
      return TokenSymbol.FIS;
    case RTokenName.rKSM:
      return TokenSymbol.KSM;
    case RTokenName.rMATIC:
      return TokenSymbol.MATIC;
    default:
      return TokenSymbol.SOL;
  }
};

export const rTokenSymbolToRTokenName = (
  rTokenSymbol: RTokenSymbol
): RTokenName => {
  switch (rTokenSymbol) {
    case RTokenSymbol.rETH:
      return RTokenName.rETH;
    case RTokenSymbol.rFIS:
      return RTokenName.rFIS;
    case RTokenSymbol.rDOT:
      return RTokenName.rDOT;
    case RTokenSymbol.rKSM:
      return RTokenName.rKSM;
    case RTokenSymbol.rATOM:
      return RTokenName.rATOM;
    case RTokenSymbol.rSOL:
      return RTokenName.rSOL;
    case RTokenSymbol.rMATIC:
      return RTokenName.rMATIC;
    default:
      return RTokenName.rBNB;
  }
};

export const rTokenNameToTokenName = (rTokenName: RTokenName): TokenName => {
  switch (rTokenName) {
    case RTokenName.rATOM:
      return TokenName.ATOM;
    case RTokenName.rBNB:
      return TokenName.BNB;
    case RTokenName.rDOT:
      return TokenName.DOT;
    case RTokenName.rETH:
      return TokenName.ETH;
    case RTokenName.rFIS:
      return TokenName.FIS;
    case RTokenName.rKSM:
      return TokenName.KSM;
    case RTokenName.rMATIC:
      return TokenName.MATIC;
    default:
      return TokenName.SOL;
  }
};
export function getTokenNameFromrSymbol(
  symbol: rSymbol
): TokenName | undefined {
  if (symbol === rSymbol.Fis) {
    return TokenName.FIS;
  } else if (symbol === rSymbol.Eth) {
    return TokenName.ETH;
  } else if (symbol === rSymbol.Dot) {
    return TokenName.DOT;
  } else if (symbol === rSymbol.Ksm) {
    return TokenName.KSM;
  } else if (symbol === rSymbol.Matic) {
    return TokenName.MATIC;
  } else if (symbol === rSymbol.Bnb) {
    return TokenName.BNB;
  } else if (symbol === rSymbol.Sol) {
    return TokenName.SOL;
  } else if (symbol === rSymbol.Atom) {
    return TokenName.ATOM;
  }
  return undefined;
}

export function getRTokenNameFromrSymbol(
  symbol: rSymbol
): RTokenName | undefined {
  if (symbol === rSymbol.Fis) {
    return RTokenName.rFIS;
  } else if (symbol === rSymbol.Eth) {
    return RTokenName.rETH;
  } else if (symbol === rSymbol.Dot) {
    return RTokenName.rDOT;
  } else if (symbol === rSymbol.Ksm) {
    return RTokenName.rKSM;
  } else if (symbol === rSymbol.Matic) {
    return RTokenName.rMATIC;
  } else if (symbol === rSymbol.Bnb) {
    return RTokenName.rBNB;
  } else if (symbol === rSymbol.Sol) {
    return RTokenName.rSOL;
  } else if (symbol === rSymbol.Atom) {
    return RTokenName.rATOM;
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
    return `${
      leftMinutes < 1 ? "A few" : leftMinutes
    } minutes left for data refresh`;
  }
  return `${leftHours} hours ${leftMinutes} mins left for data refresh`;
}

export function getExchangeRateUpdateTime(tokenName: TokenName) {
  if (tokenName === TokenName.ETH) return 8;
  if (tokenName === TokenName.MATIC) return 24;
  if (tokenName === TokenName.BNB) return 24;
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
  } else if (type === DexType.Atrix) {
    return atrixIcon;
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
  if (tokenName === TokenName.KSM) {
    return [
      {
        type: DexType.rDEX,
        tokenStandard: TokenStandard.Native,
        url: "https://app.rdex.finance/swap?first=rKSM&second=FIS",
      },
      {
        type: DexType.Uniswap,
        tokenStandard: TokenStandard.ERC20,
        url: "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x3c3842c4d3037ae121d69ea1e7a0b61413be806c",
      },
    ];
  }
  if (tokenName === TokenName.DOT) {
    return [
      {
        type: DexType.rDEX,
        tokenStandard: TokenStandard.Native,
        url: "https://app.rdex.finance/swap?first=rDOT&second=FIS",
      },
      {
        type: DexType.Uniswap,
        tokenStandard: TokenStandard.ERC20,
        url: "https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x505f5a4ff10985fe9f93f2ae3501da5fe665f08a",
      },
      {
        type: DexType.Pancake,
        tokenStandard: TokenStandard.BEP20,
        url: "https://pancakeswap.finance/swap?inputCurrency=0x1dab2a526c8ac1ddea86838a7b968626988d33de&outputCurrency=0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
      },
    ];
  }
  if (tokenName === TokenName.SOL) {
    return [
      {
        type: DexType.rDEX,
        tokenStandard: TokenStandard.Native,
        url: "https://app.rdex.finance/swap?first=rSOL&second=FIS",
      },
      {
        type: DexType.Atrix,
        tokenStandard: TokenStandard.SPL,
        url: "https://app.atrix.finance/swap?from=7hUdUTkJLwdcmt3jSEeqx4ep91sm1XwBxMDaJae6bD5D",
      },
    ];
  }
  if (tokenName === TokenName.BNB) {
    return [
      {
        type: DexType.rDEX,
        tokenStandard: TokenStandard.Native,
        url: "https://app.rdex.finance/swap?first=rBNB&second=FIS",
      },
      {
        type: DexType.Pancake,
        tokenStandard: TokenStandard.BEP20,
        url: "https://pancakeswap.finance/swap?inputCurrency=0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c&outputCurrency=0xf027e525d491ef6ffcc478555fbb3cfabb3406a6",
      },
    ];
  }
  return [];
}

export function getWalletIcon(walletType: WalletType | undefined) {
  if (walletType === WalletType.MetaMask) {
    return metaMask;
  }
  if (isPolkadotWallet(walletType)) {
    return polkadot;
  }
  if (walletType === WalletType.Phantom) {
    return phantom;
  }
  return undefined;
}

export function getRedeemDaysLeft(tokenName: TokenName | undefined) {
  if (tokenName === TokenName.MATIC) {
    return "9";
  }
  if (tokenName === TokenName.DOT) {
    return "29";
  }
  if (tokenName === TokenName.KSM) {
    return "8";
  }
  if (tokenName === TokenName.BNB) {
    return "16";
  }
  return "9";
}

export function getStakeTransactionCount(tokenName: TokenName | undefined) {
  if (tokenName === TokenName.MATIC || tokenName === TokenName.ETH) {
    return 1;
  }
  if (tokenName === TokenName.KSM || tokenName === TokenName.DOT) {
    return 3;
  }
  return 1;
}

export function getBridgeResourceId(tokenType: TokenType) {
  if (tokenType == "fis") {
    return "0x000000000000000000000000000000a9e0095b8965c01e6a09c97938f3860901";
  } else if (tokenType == "rfis") {
    if (isDev()) {
      return "0x000000000000000000000000000000b9e0095b8965c01e6a09c97938f3860901";
    } else {
      return "0x000000000000000000000000000000df7e6fee39d3ace035c108833854667701";
    }
  } else if (tokenType == "rksm") {
    return "0x00000000000000000000000000000004130f9412e9ecd9d97cf280361d2cbd01";
  } else if (tokenType == "rdot") {
    return "0x000000000000000000000000000000bada4d69537ffd62dbcde10ddda21b2001";
  } else if (tokenType == "ratom") {
    return "0x0000000000000000000000000000006e15faef60f5e197166fe64110456a8601";
  } else if (tokenType == "rsol") {
    return "0x000000000000000000000000000000659b930f8568952cb7b0c8b7eda3060b01";
  } else if (tokenType == "reth") {
    return "0x000000000000000000000000000000b2c61e66d44fd65f6070c628e20b44dd01";
  } else if (tokenType == "rmatic") {
    return "0x00000000000000000000000000000014c28bae959bb2de5085d17682eca7b001";
  } else if (tokenType == "rbnb") {
    return "0x000000000000000000000000000000ab226cdfdcd7e0d15fa85810f500d8e601";
  }
}

export function getRefinedStakedAmount(
  tokenName: TokenName,
  rTokenAmount: string | undefined,
  rTokenRatio: string | undefined
): string {
  if (!rTokenAmount || !rTokenRatio) {
    return "--";
  }
  const decimals = getDecimals(getTokenSymbol(tokenName));
  const stakedAmount = Number(rTokenAmount) * Number(rTokenRatio);
  const result =
    Math.ceil(((stakedAmount * 1000000) / decimals) * decimals) / 1000000;
  return result + "";
}
