import { Metaplex, toMetaplexFileFromBrowser } from "@metaplex-foundation/js";
import { walletAdapterIdentity } from "@metaplex-foundation/js";
import { bundlrStorage } from "@metaplex-foundation/js";

// import {
//   PhantomWalletAdapter,
// } from '@solana/wallet-adapter-wallets';

export default class MetaplexClass extends EventTarget {
	constructor() {
		super();
	}

	log(str) {
		console.log('Metaplex | '+str);
	}

	static export() {
		return {
			Metaplex,
			toMetaplexFileFromBrowser,
			walletAdapterIdentity,
			bundlrStorage,
		};
	}

}