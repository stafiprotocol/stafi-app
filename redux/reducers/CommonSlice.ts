import { AnyJson } from "@polkadot/types-codec/types";
import { rSymbol, Symbol } from "keyring/defaults";
import StafiServer from "servers/stafi";
import keyring from 'servers/keyring';
import { hexToU8a } from "@polkadot/util";

const stafiServer = new StafiServer();

export default class CommonSlice {
	async getPools(type: rSymbol, symbol: Symbol, cb?: Function) {
		const stafiApi = await stafiServer.createStafiApi();
		const poolsData = await stafiApi.query.rTokenLedger.bondedPools(type);
		let pools = poolsData.toJSON();

		// todo: check type of pools
		if (pools && (pools as AnyJson[]).length > 0) {
			pools = pools as AnyJson[];
			pools.forEach((poolPubKey: any) => {
				stafiApi.query.rTokenLedger
					.bondPipelines(type, poolPubKey)
					.then((bondedData: any) => {
						let active = 0;
						let bonded = bondedData.toJSON();
						if (bonded) {
							active = bonded.active;
						}
						const keyringInstance = keyring.init(symbol);

						let poolAddress;
						if (symbol === Symbol.Matic) {
							poolAddress = poolPubKey;
						} else if (symbol === Symbol.Bnb) {
							poolAddress = poolPubKey;
						} else if (symbol === Symbol.Atom) {
							poolAddress = keyringInstance.encodeAddress(hexToU8a(poolPubKey));
						} else {
							poolAddress = keyringInstance.encodeAddress(poolPubKey);
						}

						cb &&
							cb({
								address: poolAddress,
								poolPubKey,
								active,
							});
					})
					.catch(err => {
						console.log('getPools error:', err);
						cb && cb(null);
					});
			});
		} else {
			cb && cb(null);
		}
	}

	async poolBalanceLimit(type: rSymbol) {
		const stafiApi = await stafiServer.createStafiApi();
		const result = await stafiApi.query.rTokenSeries.poolBalanceLimit(type);
		return result.toJSON();
	}

	async queryRBalance(fisAddress: string, rSymbol: rSymbol, cb?: Function) {
		const stafiApi = await stafiServer.createStafiApi();
		const accountData = await stafiApi.query.rBalances.account(rSymbol, fisAddress);
		const data = accountData.toJSON();
		console.log(data);
		cb && cb(data);
		return data;
	}

	getPool(tokenAmount: any, validPools: any[], poolLimit: any, errMsg?: string) {
		const data = validPools.find((item: any) => {
			if (Number(poolLimit) === 0 || Number(item.active) + Number(tokenAmount) <= Number(poolLimit)) {
				return true;
			}
		});

		if (data) {
			return data;
		} else {
			console.error(errMsg || 'No Matching pool');
			return null;
		}
	}
}