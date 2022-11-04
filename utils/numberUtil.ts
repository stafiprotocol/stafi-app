import { rSymbol } from 'keyring/defaults';
import { create, floorDependencies, divideDependencies } from 'mathjs';
const { floor, divide } = create({
	floorDependencies,
	divideDependencies,
});

const numberUtil = {
	handleFisAmountToFixed(amount: any): string {
		if (amount === '--') return '--';
		if (Number(amount) === 0) return '0';
		return (floor(amount * 1000000) / 1000000).toFixed(6) || '--';
	},
	tokenAmountToHuman(amount: any, symbol: rSymbol) {
		if (isNaN(Number(amount))) return '--';
		let factor: BigInt;
		switch (symbol) {
			case rSymbol.Dot:
        factor = BigInt('10000000000');
        break;
      case rSymbol.Atom:
        factor = BigInt('1000000');
        break;
      case rSymbol.Fis:
        factor = BigInt('1000000000000');
        break;
      case rSymbol.Ksm:
        factor = BigInt('1000000000000');
        break;
      case rSymbol.Sol:
        factor = BigInt('1000000000');
        break;
      case rSymbol.Eth:
        factor = BigInt('1000000000000000000');
        break;
      case rSymbol.Matic:
        factor = BigInt('1000000000000000000');
        break;
      case rSymbol.Bnb:
        factor = BigInt('100000000');
        break;
      case rSymbol.StafiHub:
        factor = BigInt('1000000');
        break;
      default:
        factor = BigInt('1000000000000');
        break;
		}
		
		return divide(Number(amount), Number(factor));
	}
}

export default numberUtil;