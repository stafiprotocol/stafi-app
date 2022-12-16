import { TokenSymbol } from "interfaces/common";
import { rSymbol } from "keyring/defaults";
import { create, floorDependencies, divideDependencies } from "mathjs";
import Web3Utils from "web3-utils";

const { floor, divide } = create({
  floorDependencies,
  divideDependencies,
});

const numberUtil = {
  handleFisAmountToFixed(amount: any): string {
    if (amount === "--") return "--";
    if (Number(amount) === 0) return "0";
    return (floor(amount * 1000000) / 1000000).toFixed(6) || "--";
  },
  fisAmountToHuman(amount: any) {
    return amount / 1000000000000;
  },
  tokenAmountToHuman(amount: any, symbol: rSymbol | TokenSymbol) {
    if (isNaN(Number(amount))) return "--";
    let factor: BigInt;
    switch (symbol) {
      case rSymbol.Dot:
        factor = BigInt("10000000000");
        break;
      case rSymbol.Atom:
        factor = BigInt("1000000");
        break;
      case rSymbol.Fis:
        factor = BigInt("1000000000000");
        break;
      case rSymbol.Ksm:
        factor = BigInt("1000000000000");
        break;
      case rSymbol.Sol:
        factor = BigInt("1000000000");
        break;
      case rSymbol.Eth:
        factor = BigInt("1000000000000000000");
        break;
      case rSymbol.Matic:
        factor = BigInt("1000000000000000000");
        break;
      case rSymbol.Bnb:
        factor = BigInt("100000000");
        break;
      case rSymbol.StafiHub:
        factor = BigInt("1000000");
        break;
      default:
        factor = BigInt("1000000000000");
        break;
    }

    return divide(Number(amount), Number(factor));
  },
  rTokenRateToHuman(amount: any) {
    return amount / 1000000000000;
  },
  amount_format(amount: any, decimals: number, thousands_sep: string = ",") {
    if (amount === "--") return "--";
    return this.number_format(amount, decimals || 2, ".", thousands_sep);
  },
  number_format(
    num: any,
    decimals: number,
    dec_point: string,
    thousands_sep: string
  ) {
    num = (num + "").replace(/[^0-9+-Ee.]/g, "");
    let n = !isFinite(+num) ? 0 : +num,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
      dec = typeof dec_point === "undefined" ? "." : dec_point,
      s: any = "";
    const toFixedFix = (n: number, prec: number) => {
      var k = Math.pow(10, prec);
      return "" + Math.ceil(n * k) / k;
    };

    s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, "$1" + sep + "$2");
    }

    if ((s[1] || "").length < prec && num.indexOf(".") > -1) {
      s[1] = s[1] || "";
      s[1] += new Array(prec - s[1].length + 1).join("0");
    }
    return s.join(dec);
  },
  tokenAmountToChain(amount: string, symbol: rSymbol) {
    switch (symbol) {
      case rSymbol.Matic:
        return Web3Utils.toWei(amount.toString()).toString();
      default:
        return Math.round(Number(amount) * 1000000000000).toString();
    }
  },
  handleEthAmountRound(amount: any) {
    return Math.floor(amount * 1000000) / 1000000;
  },
  fisFeeToHuman(fee: any) {
    return fee / 1000000000;
  },
  handleAmountCeilToFixed(amount: any, powNumber: number) {
    if (isNaN(Number(amount))) return "--";
    const factor = Math.pow(10, powNumber);
    return (Math.ceil(Number(amount) * factor) / factor).toFixed(powNumber);
  },
  handleAmountFloorToFixed(amount: any, powNumber: number) {
    if (isNaN(Number(amount))) return "--";
    const factor = Math.pow(10, powNumber);
    return (Math.floor(Number(amount) * factor) / factor).toFixed(powNumber);
  },
};

export default numberUtil;
