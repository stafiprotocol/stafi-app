export function formatNumber(
  num: string | number | undefined,
  options: {
    decimals?: number;
    fixedDecimals?: boolean;
    withSplit?: boolean;
    toReadable?: boolean;
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
  let suffix = "";

  let newNum = "0";
  if (toReadable && Number(num) > 1000000) {
    newNum = Number(num) / 1000000 + "";
    suffix = "M";
  } else {
    newNum = num + "";
  }

  newNum =
    Math.floor(Number(newNum) * Math.pow(10, decimals)) /
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
