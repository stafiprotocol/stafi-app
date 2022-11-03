import { isDev } from "./env";

export function getStafiChain() {
	if (!isDev()) {
		return 'wss://mainnet-rpc.stafi.io';
	} else {
		return 'wss://stafi-seiya.stafi.io';
	}
}