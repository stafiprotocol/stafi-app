import { isDev } from "./env";

export function getMaticTokenAddress() {
	if (!isDev()) {
		return '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';
	} else {
		return '0x499d11e0b6eac7c0593d8fb292dcbbf815fb29ae';
	}
}