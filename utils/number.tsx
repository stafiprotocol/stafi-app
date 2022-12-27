import { TokenSymbol } from "interfaces/common";
import { rSymbol } from "keyring/defaults";
import { bignumberDependencies, create, multiplyDependencies } from "mathjs";

// mathjs optimization
const config = {
  // optionally, you can specify configuration
};
// Create just the functions we need
export const { multiply, bignumber } = create(
  {
    multiplyDependencies,
    bignumberDependencies,
  },
  config
);

function formatScientificNumber(x: any): string {
  if (Math.abs(x) < 1.0) {
    var e = parseInt(x.toString().split("e-")[1]);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = "0." + new Array(e).join("0") + x.toString().substring(2);
    }
  } else {
    var e = parseInt(x.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += new Array(e + 1).join("0");
    }
  }
  return x.toString();
}

export function formatNumber(
  num: string | number | undefined,
  options: {
    decimals?: number;
    fixedDecimals?: boolean;
    withSplit?: boolean;
    toReadable?: boolean;
    roundMode?: "round" | "floor" | "ceil";
  } = {}
) {
  if (num === undefined || num === "") {
    return "--";
  }
  if (isNaN(Number(num))) {
    return "--";
  }

  let decimals = options.decimals === undefined ? 6 : options.decimals;
  const withSplit = options.withSplit === undefined ? true : options.withSplit;
  const fixedDecimals =
    options.fixedDecimals === undefined ? true : options.fixedDecimals;
  const toReadable =
    options.toReadable === undefined ? true : options.toReadable;
  const roundMode = options.roundMode || "floor";
  let suffix = "";

  let newNum = "0";
  if (toReadable && Number(num) > 1000000) {
    newNum = Number(num) / 1000000 + "";
    suffix = "M";
    decimals = 2;
  } else if (toReadable && Number(num) > 1000) {
    newNum = Number(num) / 1000 + "";
    suffix = "K";
    decimals = 2;
  } else {
    newNum = num + "";
  }

  const roundMethod =
    roundMode === "floor"
      ? Math.floor
      : roundMode === "ceil"
      ? Math.ceil
      : Math.round;

  newNum =
    roundMethod(Number(newNum) * Math.pow(10, decimals)) /
      Math.pow(10, decimals) +
    "";

  if (fixedDecimals) {
    newNum = Number(newNum).toFixed(decimals);
  }

  if (withSplit) {
    var parts = newNum.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".") + suffix;
  } else {
    return newNum + suffix;
  }
}

export function chainAmountToHuman(
  num: string,
  tokenSymbol: TokenSymbol | rSymbol | undefined
) {
  if (num === "" || num === undefined || num === null || isNaN(Number(num))) {
    return "--";
  }
  let factor;
  switch (tokenSymbol) {
    case TokenSymbol.DOT:
    case rSymbol.Dot:
      factor = "10000000000";
      break;
    case TokenSymbol.ATOM:
    case rSymbol.Atom:
      factor = "1000000";
      break;
    case TokenSymbol.FIS:
    case rSymbol.Fis:
      factor = "1000000000000";
      break;
    case TokenSymbol.KSM:
    case rSymbol.Ksm:
      factor = "1000000000000";
      break;
    case TokenSymbol.SOL:
    case rSymbol.Sol:
      factor = "1000000000";
      break;
    case TokenSymbol.ETH:
    case rSymbol.Eth:
      factor = "1000000000000000000";
      break;
    case TokenSymbol.MATIC:
    case rSymbol.Matic:
      factor = "1000000000000000000";
      break;
    case TokenSymbol.BNB:
    case rSymbol.Bnb:
      factor = "100000000";
      break;
    case TokenSymbol.StafiHub:
    case rSymbol.StafiHub:
      factor = "1000000";
      break;
    default:
      factor = "1000000000000";
      break;
  }
  // console.log(Web3.utils.toBN(num).div(Web3.utils.toBN(factor)));

  return Number(num) / Number(factor) + "";

  // return Web3.utils.toBN(num).div(Web3.utils.toBN(factor)).toString();
}

export function rTokenRateToHuman(num: string | number) {
  // return divide(Number(num), 1000000000000) + "";
  return Number(num) / 1000000000000 + "";
  // return Web3.utils.toBN(num).div(Web3.utils.toBN("1000000000000")).toString();
}

export function numberToChain(input: string | number, symbol: rSymbol): string {
  if (isNaN(Number(input))) {
    return "--";
  }
  let factor;
  switch (symbol) {
    case rSymbol.Dot:
      factor = "10000000000";
      break;
    case rSymbol.Atom:
      factor = "1000000";
      break;
    case rSymbol.Fis:
      factor = "1000000000000";
      break;
    case rSymbol.Ksm:
      factor = "1000000000000";
      break;
    case rSymbol.Sol:
      factor = "1000000000";
      break;
    case rSymbol.Eth:
      factor = "1000000000000000000";
      break;
    case rSymbol.Matic:
      factor = "1000000000000000000";
      break;
    case rSymbol.Bnb:
      factor = "100000000";
      break;
    case rSymbol.StafiHub:
      factor = "1000000";
      break;
    default:
      factor = "1000000000000";
      break;
  }

  const res = formatScientificNumber(
    multiply(bignumber(input), bignumber(factor))
  );

  return parseInt(res).toString();
}

export function formatLargeAmount(amount: string | number) {
  if (!isNaN(Number(amount)) && Number(amount) > 1000) {
    return formatNumber(amount, { decimals: 2 });
  }
  return formatNumber(amount, { decimals: 4 });
}

export function getDecimals(tokenSymbol: TokenSymbol | rSymbol | undefined) {
  let factor;
  switch (tokenSymbol) {
    case TokenSymbol.DOT:
    case rSymbol.Dot:
      factor = "10000000000";
      break;
    case TokenSymbol.ATOM:
    case rSymbol.Atom:
      factor = "1000000";
      break;
    case TokenSymbol.FIS:
    case rSymbol.Fis:
      factor = "1000000000000";
      break;
    case TokenSymbol.KSM:
    case rSymbol.Ksm:
      factor = "1000000000000";
      break;
    case TokenSymbol.SOL:
    case rSymbol.Sol:
      factor = "1000000000";
      break;
    case TokenSymbol.ETH:
    case rSymbol.Eth:
      factor = "1000000000000000000";
      break;
    case TokenSymbol.MATIC:
    case rSymbol.Matic:
      factor = "1000000000000000000";
      break;
    case TokenSymbol.BNB:
    case rSymbol.Bnb:
      factor = "100000000";
      break;
    case TokenSymbol.StafiHub:
    case rSymbol.StafiHub:
      factor = "1000000";
      break;
    default:
      factor = "1000000000000";
      break;
  }

  return Number(factor);
}
