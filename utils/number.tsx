import { TokenSymbol } from "interfaces/common";
import { divide } from "mathjs";
import Web3 from "web3";

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

  const decimals = options.decimals === undefined ? 6 : options.decimals;
  const withSplit = options.withSplit === undefined ? true : options.withSplit;
  const fixedDecimals =
    options.fixedDecimals === undefined ? false : options.fixedDecimals;
  const toReadable =
    options.toReadable === undefined ? true : options.toReadable;
  const roundMode = options.roundMode || "round";
  let suffix = "";

  let newNum = "0";
  if (toReadable && Number(num) > 1000000) {
    newNum = Number(num) / 1000000 + "";
    suffix = "M";
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
  tokenSymbol: TokenSymbol | undefined
) {
  if (isNaN(Number(num))) {
    return "--";
  }
  let factor;
  switch (tokenSymbol) {
    case TokenSymbol.DOT:
      factor = "10000000000";
      break;
    case TokenSymbol.ATOM:
      factor = "1000000";
      break;
    case TokenSymbol.FIS:
      factor = "1000000000000";
      break;
    case TokenSymbol.KSM:
      factor = "1000000000000";
      break;
    case TokenSymbol.SOL:
      factor = "1000000000";
      break;
    case TokenSymbol.ETH:
      factor = "1000000000000000000";
      break;
    case TokenSymbol.MATIC:
      factor = "1000000000000000000";
      break;
    case TokenSymbol.BNB:
      factor = "100000000";
      break;
    case TokenSymbol.StafiHub:
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
