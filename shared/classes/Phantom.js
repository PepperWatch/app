
// import { Connection, clusterApiUrl, SystemProgram, Transaction } from '@solana/web3.js';
import { Connection, clusterApiUrl, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
// import { Metaplex, toMetaplexFileFromBrowser } from "@metaplex-foundation/js";
// import { walletAdapterIdentity } from "@metaplex-foundation/js";

// import { bundlrStorage } from "@metaplex-foundation/js";
// import { initWallet, useWallet } from 'solana-wallets-vue';

import {
  PhantomWalletAdapter,
  BraveWalletAdapter,
  // SlopeWalletAdapter,
  // SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

const sigUtil = require('@metamask/eth-sig-util');
import Crypt from './Crypt.js';

export default class Phantom extends EventTarget {
	constructor(chainType = 'devnet') {
		super();

		this._isInstalled = false;
		this._isConnected = false;

		this._chainType = chainType;

		if (['devnet', 'mainnet-beta'].indexOf(chainType) === -1) {
			throw new Error('This chainType: '+chainType+' is not supported');
		}

		this._connectedAddress = null;
		this._connectedNetId = null;
		this._netName = null;

		this._walletAdapter = null;
		this._connection = null;
		this._metaplex = null;
		this._bundlr = null;

		this._m = {
			Metaplex: null,
			toMetaplexFileFromBrowser: null,
			walletAdapterIdentity: null,
			bundlrStorage: null,
		};
	}

	async getDefaultCollectionAddress() {
		if (this.connectedNetName == 'devnet') {
			return '3gRuHSUem719yWPzec3q1BjMDMabGJHvcXhCypXTLtPV';
		} else {
			return 'Bpj4XqH5FvMMw15ghUxcx5EQ5Zwd7opAffhaXWHJ9dqx'; // mainnet-dev
		}
	}

	static guessAdapterClass() {
		if (window.braveSolana) {
			return BraveWalletAdapter;
		} else {
			return PhantomWalletAdapter;
		}
	}

	static getSingleton(chainType = 'devnet') {
		if (!Phantom.__singleInstances) {
			Phantom.__singleInstances = {};
		}
		if (Phantom.__singleInstances[chainType]) {
			return Phantom.__singleInstances[chainType];
		} else {
			Phantom.__singleInstances[chainType] = new Phantom(chainType);
			return Phantom.__singleInstances[chainType];
		}
	}

	static icon() {
		const Adapter = Phantom.guessAdapterClass();
		const phantom = new Adapter();

		return phantom.icon;
	}

	async importMetaplex(exportData) {
		this.log('Importing Metaplex classes...');

		this._m = exportData;
		await this.initMetaplex();
	}

	async initMetaplex() {
		if (this._metaplex && this._bundlr) {
			return;
		}
		if (!this._m.Metaplex) {
			return;
		}

		this.log('Initializing metaplex...');

		const metaplex = new this._m.Metaplex(this._connection);

		metaplex.use(this._m.walletAdapterIdentity(this._walletAdapter));

		const bundlrOptions = {
			timeout: 3*60000,
		};

		if (this._chainType == 'devnet') {
			bundlrOptions.address = 'https://devnet.bundlr.network';
			bundlrOptions.providerUrl = 'https://api.devnet.solana.com';
		}

		metaplex.use(this._m.bundlrStorage(bundlrOptions));

		const bs = metaplex.storage().driver();
		const bsNative = await bs.bundlr();

		this._metaplex = metaplex;
		this._bundlr = bsNative;

		this.log('Metaplex initialized.');

		if (this.__metaplexWaitResolver) {
			this.__metaplexWaitResolver();
		}

		// await this.getMyNFTs();
	}

	log(str) {
		console.log('Phantom | '+(new Date()).toLocaleTimeString()+' | '+str);
	}

	get chainType() {
		return this._chainType;
	}

	get connectedNetName() {
		return this._netName;
	}

	get connectedAddress() {
		return this._connectedAddress;
	}

	get contractAddress() {
		return this._contractAddress;
	}

	get isMetaplexReady() {
		if (this._m && this._m.Metaplex && this._metaplex && this._bundlr) {
			return true;
		} else {
			return false;
		}
	}

	async waitForMetaplex() {
		if (this.isMetaplexReady) {
			return this._metaplex;
		}

		if (this.__metaplexWaitResolver) {
			await this.__metaplexWait;
			return this._metaplex;
		}

		this.__metaplexWaitResolver = null;
		this.__metaplexWait = new Promise((res)=>{
			this.__metaplexWaitResolver = res;
		});

		await this.__metaplexWait;
		this.__metaplexWaitResolver = null;

		return this._metaplex;
	}

	getMinimumPrice() {
		return 0.001;
	}

	async loadMetadata(input) {
		await this.waitForMetaplex();

		const info = await this._metaplex
			.nfts()
			.load({metadata: input})
			.run();

		return info;

	}

	async getMyNFTs() {
		await this.waitForMetaplex();

		const myNfts = await this._metaplex
			.nfts()
			.findAllByOwner({owner: this._walletAdapter.publicKey})
			.run();

		const ret = [];
		const collectionAddress = await this.getDefaultCollectionAddress();

		myNfts.forEach((item)=>{
			if ((''+item.collection?.address) == collectionAddress) {
				ret.push(item);
			}
		});

		return ret;
		// console.error('myNfts', myNfts);
	}

	async getMyCreatedNFTs() {
		await this.waitForMetaplex();

		const myNfts = await this._metaplex
			.nfts()
			.findAllByCreator({creator: this._walletAdapter.publicKey})
			.run();

		return myNfts;
		// console.error('myNfts', myNfts);
	}

	async signString(string) {
		await this.waitForMetaplex();

		let uint8Array = new TextEncoder("utf-8").encode(string);
		const signature = await this._walletAdapter.signMessage(uint8Array);

		const c = new Crypt();
		return c.u8a2hex(signature);
	}


	// async createCollection(name) {
	// 	const collectionJson = {
	// 		name: name,
	// 	};

	// 	let resp = await this._metaplex
	// 		.nfts()
	// 		.uploadMetadata(collectionJson)
	// 		.run();
	// 	const collectionUri = resp.uri;

	// 	console.error(resp);
	// 	console.error(collectionUri);

	// 	resp = await this._metaplex
	// 		.nfts()
	// 		.create({
	// 			uri: collectionUri,
	// 			name: name,
	// 			isCollection: true,
	// 			// sellerFeeBasisPoints: 500, // Represents 5.00%.
	// 		})
	// 		.run();
	// 	const collectionNft = resp.nft;

	// 	console.error(collectionNft);
	// 	console.error(''+collectionNft.address);

	// 	const nftJson = {
	// 		name: (name + 'inner'),
	// 	};
	// 	resp = await this._metaplex
	// 		.nfts()
	// 		.uploadMetadata(nftJson)
	// 		.run();
	// 	const nftUri = resp.uri;

	// 	resp = await this._metaplex
	// 		.nfts()
	// 		.create({
	// 			collection: new PublicKey(''+collectionNft.address),
	// 			uri: nftUri,
	// 			name: (name + 'inner'),
	// 			sellerFeeBasisPoints: 500, // Represents 5.00%.
	// 		})
	// 		.run();
	// 	const nft = resp.nft;

	// 	console.error(nft);
	// 	console.error(''+nft.address);
	// }

	async migrateToSizedCollection(collectionAddress) {
		await this.waitForMetaplex();

		const migrateOptions = {
			mintAddress: new PublicKey(collectionAddress),
			size: 99999999,
		};
		const resp = await this._metaplex
			.nfts()
			.migrateToSizedCollection(migrateOptions)
			.run();

		if (resp && resp.response && resp.response.signature) {
			return resp.response.signature;
		}


		return false;
	}

	// async moveNFTToCollection(mintedAddress, collectionAddress) {
	// 	await this.waitForMetaplex();

	// 	const options = {
	// 		nftOrSft: {
	// 			address: new PublicKey(mintedAddress),
	// 		},
	// 		collection: new PublicKey(collectionAddress),
	// 		// isSizedCollection: false,
	// 	};
	// 	console.error(options);

	// 	const resp = await this._metaplex
	// 		.nfts()
	// 		.update(options)
	// 		.run();

	// 	console.error(resp);
	// }

	// connected as creator
	async verifyCollectionCreator(mintedAddress) {
		await this.waitForMetaplex();

		const verifyOptions = {
			mintAddress: new PublicKey(mintedAddress),
		};
		try {
			const resp = await this._metaplex
				.nfts()
				.verifyCreator(verifyOptions)
				.run();

			if (resp && resp.response && resp.response.signature) {
				return resp.response.signature;
			}

		} catch(e) {
			if ((''+e).indexOf('is already verified') !== -1) {
				return true;
			}

			console.error(e);
		}

		return false;
	}

	async verifyCollection(mintedAddress, collectionAddress) {
		await this.waitForMetaplex();

		// await this.moveNFTToCollection(mintedAddress, collectionAddress);

		// const migrateOptions = {
		// 	mintAddress: new PublicKey(collectionAddress),
		// 	size: 99999999,
		// };
		// const mresp = await this._metaplex
		// 	.nfts()
		// 	.migrateToSizedCollection(migrateOptions)
		// 	.run();

		// console.error(mresp);
		// // igrateToSizedCollectionNft;
		// return;

		console.log(mintedAddress, collectionAddress);
		const verifyOptions = {
			mintAddress: new PublicKey(mintedAddress),
			collectionMintAddress: new PublicKey(collectionAddress),
			// isSizedCollection: false,
		};

		console.error(verifyOptions);

		try {
			const resp = await this._metaplex
				.nfts()
				.verifyCollection(verifyOptions)
				.run();

			if (resp && resp.response && resp.response.signature) {
				return resp.response.signature;
			}

		} catch(e) {
			if ((''+e).indexOf('is already verified') !== -1) {
				return true;
			}

			console.error(e);
		}

		return false;
	}

	async mintContainer(userContainer, collection = null) {
		const token_uri = ""+userContainer.getMintIPFSHashURL();
		const name = userContainer.getTitle();

		const creators = [];
		const walletAdapter = this._walletAdapter;
		creators.push({
			address: walletAdapter.publicKey,
			authority: walletAdapter,
			share: 100,
		});
		creators.push({
			address: new PublicKey("G1f6Zcykqkf7AWtgDmgh1SXoWcqov4TrAdzh49JY6bSp"),
			share: 0,
		});


		const mintOptions = {
			uri: token_uri,
			symbol: 'PPWATCH',
			isMutable: false,
			name: name,
			creators: creators,
			sellerFeeBasisPoints: 500, // Represents 5.00%.
		};

		if (collection) {
			mintOptions.collection = new PublicKey(collection);
		}

		this.log('minting container...');

		const { nft } = await this._metaplex
			.nfts()
			.create(mintOptions)
			.run();

		this.log('container minted');

		console.error('nft', nft);

		if (nft && nft.address) {
			return nft.address;
		}

		return false;
	}

	async upload(browserFile, type = false) {
		let file = browserFile;

		let fileName = 'video.mp4';
		let mimeType = 'video/mp4';

		if (type == 'image') {
			fileName = 'image.jpg';
			mimeType = 'image/jpeg';
		} else if (type == 'json' || type == 'text') {
			fileName = 'data.text';
			if (type == 'json') {
				fileName = 'data.json';
			}
			mimeType = 'text/plain';
		}

		if (file instanceof Blob) {

			file = new File([file], fileName, {
				type: mimeType,
			});
		} else if ((typeof file === 'string' || file instanceof String)) {
			file = new File([file], fileName, {
				type: mimeType,
			});
		}
		return await this.uploadFile(file);
	}

	async uploadFile(browserFile) {
		await this.init();

		this.log('uploading file...');

		// console.log('bundlr.address', this._bundlr.address);
		const balance = await this._bundlr.getLoadedBalance();

		this.log('Bundlr balance: '+balance);

		const file = await this._m.toMetaplexFileFromBrowser(browserFile);
		// console.error(file);
		const fileSize = file.buffer.length;
		// this.log('File size: '+fileSize);

		const priceToUpload = await this._bundlr.getPrice(fileSize);

		this.log('Price to upload: '+priceToUpload);

		const storageClient = this._metaplex.storage();
		let resp = await storageClient.upload(file);

		this.log('Uploaded as: '+resp);

		resp = resp.split('https://arweave.net/').join('');

		return resp;
	}

	async disconnect() {
		if (this._walletAdapter) {
			await this._walletAdapter.disconnect();
			this._connectedAddress = null;
			this._walletAdapter = null;
			this._connection = null;
			this._metaplex = null;
			this._bundlr = null;

			this._initPromise = null;
		}
	}

	async sendComplexTransaction(instructions) {
		const transaction = new Transaction();
		instructions.forEach((instruction)=>{
			const transfer = SystemProgram.transfer({
				fromPubkey: this._walletAdapter.publicKey,
				toPubkey: new PublicKey(instruction.address),
				lamports: instruction.value,
			});

			transaction.add(transfer);
		});


		let { blockhash } = await this._connection.getRecentBlockhash();

		console.error('blockhash', blockhash);

		transaction.recentBlockhash = blockhash;
		transaction.feePayer = this._walletAdapter.publicKey;


		const signedTransaction = await this._walletAdapter.signTransaction(transaction);

		console.error('signedTransaction', signedTransaction);

		let signature = null;
		const maxRetries = 10;
		let curTry = 0;
		let success = false;

		do {
			console.log('trying to send transaction...');
			try {
				signature = await this._connection.sendRawTransaction(signedTransaction.serialize(), {maxRetries: 5, preflightCommitment: 'confirmed'});
				if (!signature) {
					await new Promise((res)=>setTimeout(res, 1000));
				} else {
					success = true;
					console.log('transaction sent', signature);
				}
			} catch(e) {
				console.error(e);

				success = false;
				await new Promise((res)=>setTimeout(res, 1000));
			}

		} while(!success && (curTry++ < maxRetries));

		// const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {maxRetries: 5, preflightCommitment: 'confirmed'});
		// const { signature } = await provider.signAndSendTransaction(transaction);
		//
		let status = null;
		do {
			status = await this._connection.getSignatureStatus(signature);
			console.log(status);
			await new Promise((res)=>setTimeout(res, 1000));
		} while ((!status || !status.value));
		// const status = await connection.getSignatureStatus(signature);

		console.error('status', status);

		return signature;
	}

	async getEncryptionPublicKey() {
		if (this._encryptionPublicKey) {
			return this._encryptionPublicKey;
		}

		await this.init();

		// // try to get from localstorage
		const localStorageKey = 'public_key_'+this.connectedAddress;
		const localStoragePrivateKey = 'private_key_'+this.connectedAddress;

		if (window.localStorage.getItem(localStorageKey) && window.localStorage.getItem(localStoragePrivateKey)) {
			this._encryptionPublicKey = window.localStorage.getItem(localStorageKey);
			this._encryptionPrivateKey = window.localStorage.getItem(localStoragePrivateKey);

			const c = new Crypt();
			this._encryptionPrivateKey = c.hex2u8a(this._encryptionPrivateKey);

			return this._encryptionPublicKey;
		}

		this.log('getting encryption public key...');

		// should work as something as eth_getEncryptionPublicKey in Metamask
		// some derrived from privateKey public key
		// there's no such functionality in Phantom Wallet
		// so we are trying to mimic it

		const address = this.connectedAddress;
		let uint8Array = new TextEncoder("utf-8").encode('Generate Video Decode Key For: '+address);

		const signature = await this._walletAdapter.signMessage(uint8Array);

		this.log('message signed');
		console.log(signature);

		const uint8ofLength32 = new Uint8Array(32);
		// const binaryString = window.atob(signature);
		for (let i = 0; i < 32; i++) {
			uint8ofLength32[i] = signature[i];
		}

		this._encryptionPrivateKey = uint8ofLength32;
		this._encryptionPublicKey = sigUtil.getEncryptionPublicKey(uint8ofLength32);

		this.log('derived public key is: '+this._encryptionPublicKey );

		const c = new Crypt();
		const privateKeyAsString = c.u8a2hex(this._encryptionPrivateKey);

		window.localStorage.setItem(localStorageKey, this._encryptionPublicKey);
		window.localStorage.setItem(localStoragePrivateKey, privateKeyAsString);

		this.log('derived public key is: '+this._encryptionPublicKey );

		return this._encryptionPublicKey;
	}

	async decryptMessage(encryptedMessage) {
		await this.getEncryptionPublicKey();
		// should work as something aseth_decrypt in Metamask
		//
		//
		// const stripped = stripHexPrefix(msgParams.data);
		// const buff = Buffer.from(stripped, 'hex');
		// msgParams.data = JSON.parse(buff.toString('utf8'));

		this.log('decrypting the message...');

		encryptedMessage = encryptedMessage.split('0x').join('');
		const hexToUTF8 = function(s)
		{
			return decodeURIComponent(
				s.replace(/\s+/g, '') // remove spaces
				.replace(/[0-9a-f]{2}/g, '%$&')); // add '%' before each 2 characters
		}

		const encryptedData = JSON.parse(hexToUTF8(encryptedMessage));

		const decrypted = sigUtil.decrypt({
			encryptedData: encryptedData,
			privateKey: this._encryptionPrivateKey,
		});

		this.log('decrypted');

		return decrypted;
	}

	async init() {
		if (this._initPromise) {
			return await this._initPromise;
		}
		this._initPromiseResolver = null;
		this._initPromise = new Promise((res)=>{
			this._initPromiseResolver = res;
		});

		this.log('Initializing...');

		// const walletAdapter = new PhantomWalletAdapter();

		const Adapter = Phantom.guessAdapterClass();
		const walletAdapter = new Adapter();
		// walletAdapter.on('error', (e)=>{
		// 	console.error(e);
		// });
		// walletAdapter.on('connect', (e)=>{
		// 	console.error(e);
		// });
		// walletAdapter.on('readyStateChange', (readyStateChange)=>{
		// 	console.error('readyStateChange', readyStateChange);
		// });

		// console.error('walletAdapter', walletAdapter.connected, walletAdapter.connecting);

		let hasError = false;
		walletAdapter.on('error', ()=>{
			hasError = true;
		});

		try {
			await walletAdapter.connect();
			await walletAdapter.connect(); // bug due to phantom adapter workaround ( may be fixed in next versions? Check @todo )
		} catch(e) {
			hasError = true;
		}

		if (hasError) {
			this._initPromise = null;
			throw new Error('Can not initialize');
		}

		if (walletAdapter.publicKey) {
			this.log('Connected');

			this._connectedAddress = walletAdapter.publicKey.toString();
			const network = clusterApiUrl(this._chainType);
			const connection = new Connection(network);

			this._connection = connection;
			this._walletAdapter = walletAdapter;

			this.log('Properties set');
		}

		await this.initMetaplex();


// 		console.error('walletAdapter', resp, walletAdapter.publicKey);

// 		// const isPhantomInstalled = window.phantom?.solana?.isPhantom;
// 		// const provider = this.getProvider(); // see "Detecting the Provider"
// 		try {
// 			// const resp = await provider.connect();
// 			// console.log(resp.publicKey.toString());
// 			// 26qv4GCcx98RihuK3c4T6ozB3J7L6VwCuFVc7Ta2A3Uo
// 			//
// 			this._contractAddress = walletAdapter.publicKey.toString();
// 			this.dispatchEvent(new Event('connected'));
// 			const network = clusterApiUrl('devnet');
// 			// initWallet();

// 			// const walletOptions = {
// 			// 	wallets: [
// 			// 		new PhantomWalletAdapter(),
// 			// 		new SlopeWalletAdapter(),
// 			// 	],
// 			// 	autoConnect: true,
// 			// }
// 			// initWallet(walletOptions);

// const connection = new Connection(network);

// 			let transaction = new Transaction().add(
// 			SystemProgram.transfer({
// 			fromPubkey: walletAdapter.publicKey,
// 			toPubkey: walletAdapter.publicKey,
// 			lamports: 100,
// 			})
// 			);


// 			// console.error('provider', provider);
// // const wallet = useWallet();
// // metaplex.use(walletAdapterIdentity(wallet));

// 			// await new Promise((res)=>setTimeout(res, 5000));

// 			// const wallet = useWallet();
// 			// await new Promise((res)=>setTimeout(res, 5000));
// 			// console.error('wallet', wallet);



// 			const metaplex = new Metaplex(connection);
// 			metaplex.use(walletAdapterIdentity(walletAdapter));
// 			metaplex.use(bundlrStorage({
// 			address: 'https://devnet.bundlr.network',
// 			providerUrl: 'https://api.devnet.solana.com',
// 			// timeout: 60000,
// 			}));
// 			const bs = metaplex.storage().driver();
// 			const bsNative = await bs.bundlr();

// 			console.log('bundlr.address', bsNative.address);
// 			const balance = await bsNative.getLoadedBalance()
// 			console.log('bundlr.balance', balance);

// 			// const bAddress = await bsNative.getBundlerAddress();
// 			// console.log('bundlr.bAddress', bAddress);
// 			let price = await bsNative.fund(10000);

// 			let response = await bsNative.fund(10000);
// 			console.log('bundlr.bAddress', response);

// 			const myNfts = await metaplex
// 				.nfts()
// 				.findAllByOwner(walletAdapter.publicKey)
// 				.run();

// 			console.error('myNfts', myNfts);


// 			const imageMFile = await toMetaplexFile('The content of my file1', 'my-file.txt');
// 			console.error('imageMFile', imageMFile);
// 			// bs.fund([imageMFile]);
// 			// (await bs.bundlr()).fund(LAMPORTS_PER_SOL * 10); // Fund using lamports directly.

// 			const { uri, metadata } = await metaplex
// 				.nfts()
// 				.uploadMetadata({
// 				name: "My Test NFT",
// 				image: imageMFile,
// 				properties: {
// 				files: [
// 				{
// 				type: "video/mp4",
// 				uri: imageMFile,
// 				},
// 				]
// 				}
// 				})
// 				.run();

// 			console.log(uri);
// 			console.log(metadata);

// 			alert(2);

// 			let { blockhash } = await connection.getRecentBlockhash();

// 			console.error('blockhash', blockhash);

// 			transaction.recentBlockhash = blockhash;
// 			transaction.feePayer = walletAdapter.publicKey;


// 			const signedTransaction = await walletAdapter.signTransaction(transaction);

// 			console.error('signedTransaction', signedTransaction);

// 			let signature = null;
// 			const maxRetries = 10;
// 			let curTry = 0;
// 			let success = false;

// 			do {
// 				console.log('trying to send transaction...');
// 				try {
// 					signature = await connection.sendRawTransaction(signedTransaction.serialize(), {maxRetries: 5, preflightCommitment: 'confirmed'});
// 					if (!signature) {
// 						await new Promise((res)=>setTimeout(res, 1000));
// 					} else {
// 						success = true;
// 						console.log('transaction sent', signature);
// 					}
// 				} catch(e) {
// 					success = false;
// 					await new Promise((res)=>setTimeout(res, 1000));
// 				}

// 			} while(!success && (curTry++ < maxRetries));

// 			// const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {maxRetries: 5, preflightCommitment: 'confirmed'});
// 			// const { signature } = await provider.signAndSendTransaction(transaction);
// 			//
// 			let status = null;
// 			do {
// 				status = await connection.getSignatureStatus(signature);
// 				console.log(status);
// 				await new Promise((res)=>setTimeout(res, 1000));
// 			} while ((!status || !status.value));
// 			// const status = await connection.getSignatureStatus(signature);

// 			console.error('status', status);


// 		} catch (err) {
// 			console.error(err);
// 			// { code: 4001, message: 'User rejected the request.' }
// 		}

		this._initPromiseResolver();
	}

}