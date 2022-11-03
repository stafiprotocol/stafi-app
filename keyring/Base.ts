import * as bip39 from 'bip39';

export default class Base {
	protected _secLength = 64;

	protected _symbol = '';

	protected createMnemonic(strength?: number): string {
		return bip39.generateMnemonic(strength);
	}

	protected mnemonicToSeed(mnemonic: string, passphrase?: string | ''): Buffer {
		return bip39.mnemonicToSeedSync(mnemonic, passphrase);
	}
}