import { hexToU8a, u8aToHex } from "@polkadot/util";
import { checkAddress, decodeAddress, encodeAddress, mnemonicToMiniSecret, mnemonicValidate } from "@polkadot/util-crypto";
import { KeypairType } from "@polkadot/util-crypto/types";
import Base from "./Base";

const ENTROPY_SIZE = 128;
const MNEMONIC_TO_SEED_PASSWORD = '';

export interface KeyringPair {
	mnemonic?: string | null;
	secretKey: string;
	publicKey: string;
	address: string;
}

export interface KeyringStruct {
	createAccount: () => KeyringPair | undefined;
	createMnemonic: () => string;
	createAccountFromMnemonic: (mnemonic: string, isValidate?: boolean) => KeyringPair | undefined;
	createAccountFromSecretKey: (secretKey: string) => KeyringPair | undefined;
	decodeAddress: (key: string) => Uint8Array;
	encodeAddress: (key: string | Uint8Array | Buffer) => string; 
	checkAddress: (address: string) => boolean;
	sign: (secretKey: string, message: string) => any;
}

export class SubstrateKeyring extends Base implements KeyringStruct {
	private _type: KeypairType;

	protected _ss58_format = 42;

	constructor(keypairType: KeypairType = 'sr25519') {
		super();
		this._symbol = 'sub';
		this._type = keypairType;
	}

	public createAccount(): KeyringPair | undefined {
		const mnemonic = this.createMnemonic();
		return this.createAccountFromMnemonic(mnemonic);
	}

	public createMnemonic(): string {
		return super.createMnemonic(ENTROPY_SIZE);
	}

	public createAccountFromMnemonic(mnemonic: string, isValidate?: boolean | undefined): KeyringPair | undefined {
		if (isValidate && !mnemonicValidate(mnemonic)) {
			return undefined;
		}
		const seed = mnemonicToMiniSecret(mnemonic, MNEMONIC_TO_SEED_PASSWORD);
		const keyringPair = this.createAccountFromSeed(seed);
		keyringPair.mnemonic = mnemonic;

		return keyringPair;
	}

	public createAccountFromSecretKey(secretKey: string): KeyringPair | undefined {
		if (!this.validateSecretKey(secretKey)) {
			return undefined;
		}

		const publicKey = hexToU8a(secretKey).slice(32);
		return {
			mnemonic: '',
			secretKey: secretKey,
			publicKey: u8aToHex(publicKey),
			address: this.encodeAddress(publicKey),
		};
	}

	public checkAddress(address: string): boolean {
		if (!address || address.length < 0) {
			return false;
		}

		try {
			const [isValid, _] = checkAddress(address, this._ss58_format);
			return isValid;
		} catch (err) {
			return false;
		}
	}

	public encodeAddress(key: string | Buffer | Uint8Array): string {
		return encodeAddress(key, this._ss58_format);
	}

	public decodeAddress(key: string): Uint8Array {
		return decodeAddress(key);
	}

	public sign(secretKey: string, message: string): any {
		return {};
	}

	private createAccountFromSeed(seed: Uint8Array): KeyringPair {
		return {
			secretKey: '',
			publicKey: '',
			address: '',
		};
	}

	private validateSecretKey(secretKey: string): boolean {
		let len = 0;
		try {
			len = hexToU8a(secretKey).length;
		} catch (err) {
			return false;
		}

		return len === this._secLength;
	}
}