import { AnyJson } from "@polkadot/types-codec/types";
import { rSymbol, Symbol } from "keyring/defaults";
import StafiServer from "servers/stafi";
import keyring from 'servers/keyring';
import { hexToU8a } from "@polkadot/util";

const stafiServer = new StafiServer();

export default class CommonSlice {
	async getPools(type: rSymbol, symbol: Symbol, cb?: Function) {
		const stafiApi = stafiServer.createStafiApi();
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
		const stafiApi = stafiServer.createStafiApi();
		const result = await stafiApi.query.rTokenSeries.poolBalanceLimit(type);
		return result.toJSON();
	}
}