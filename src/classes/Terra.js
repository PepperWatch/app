import {
  getChainOptions,
  WalletController,
} from '@terra-money/wallet-provider';

import {
  Fee,
  MsgExecuteContract,
  MsgInstantiateContract,
  LCDClient,
} from '@terra-money/terra.js';


const sigUtil = require('@metamask/eth-sig-util');
import Crypt from './Crypt.js';

export default class Terra extends EventTarget {
	constructor() {
		super();

		this._isInstalled = false;
		this._isConnected = false;

		this._LCDClient = null;
		this._connectedAddress = null;
		this._connectedNetId = null;
		this._netName = null;

		this._walletController = null;

		this._encryptionPublicKey = null;

		this._contractAddress = 'terra1mwt8z6raw2270n6jmdu5ce2p8kkla7u4rch3d6';
		// this._contractAddress = 'terra159wc47nf8szw06warnm4wa3vfqk68j3g7rkwzu';
		// const contractAddress = 'terra12pj5psnwuu0nfpftjdyqgparurcl32tkzdyck0';
	}

	log(str) {
		console.log('Terra | '+str);
	}

	static getSingleton() {
		if (Terra.__singleInstance) {
			return Terra.__singleInstance;
		} else {
			Terra.__singleInstance = new Terra();
			return Terra.__singleInstance;
		}
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

	async getAllTokens(mintedByConnected = false) {
		let query = {"all_tokens":{"limit": 1000}};
		if (mintedByConnected) {
			query = {"tokens":{"limit": 1000, "owner": this._connectedAddress}};
		}

		const onBlockhain = await this.queryContract({
			query: query,   // start_after
			sync: true,
		});

		return onBlockhain;
	}

	async withdraw() {
		const tx = await this.executeContract({
			instructions: {"withdraw":{}},
			sync: true,
		});

		if (tx) {
			return true;
		}

	}

	async commitPriceChange(mediaId, price) {
		const priceInLuna = ''+(1000000 * price); // price in uluna

		const tx = await this.executeContract({
			instructions: {"set_price":{"price":priceInLuna,"media":mediaId}},
			sync: true,
		});

		console.log(tx);

		return tx;
	}

	async doPurchase(mediaId, uluna) {
		// const contractAddress = 'terra1tndcaqxkpc5ce9qee5ggqf430mr2z3pefe5wj6';
		const contractAddress = this._contractAddress;

		const publicKey = await this.getEncryptionPublicKey();

		const txhash = await this.executeContract({
			contractAddress: contractAddress,
			instructions: {"ask_for_key":{"key":publicKey,"media":mediaId}},
			sync: true,
			uluna: uluna,
		});

		this.log('purchase transaction: '+txhash);

		return txhash;
	}

	async getPrivateKey(mediaId) {
		const contractAddress = this._contractAddress;

		this.log('getting encoded media password from blockchain...');

		const onBlockhain = await this.queryContract({
			contractAddress: contractAddress,
			query: {"get_key":{"media":mediaId, "addr":this._connectedAddress}},
			sync: true,
		});

		if (onBlockhain && onBlockhain.is_public === false) {
			const onBlockhainKey = onBlockhain.key;

			this.log('encoded media password on blockchain: '+onBlockhainKey);

			return onBlockhainKey;
		} else {

			this.log('there is nothing');
		}

		return null;
	}

	async getMinimumPrice() {
		if (this._getPricePromise) {
			return await this._getPricePromise;
		}

		this._getPricePromiseResolver = null;
		this._getPricePromise = new Promise((res)=>{
			this._getPricePromiseResolver = res;
		});

		try {
			const onBlockhain = await this.queryContract({
				query: {"get_minimum_price":{}},
				sync: true,
			});

			const val = parseFloat(onBlockhain.uluna, 10);
			this._getPricePromiseResolver(val);
			return val;
		} catch(e) {
			this._getPricePromiseResolver(0);
			return 0;
		}
	}

	async disconnect() {
		this._walletController.disconnect();
		this._initPromise = null;
	}

	async connect() {
		await this.init();
		// await this.checkTheData();
	}

	async waitForExtension(walletController) {
		await new Promise((res, rej)=>{
			walletController.availableConnections().subscribe((availableConnections) => {
				for (let availableConnection of availableConnections) {
					if (availableConnection.type == 'EXTENSION') {
						res();
					}
				}
			});

			setTimeout(()=>{
				rej();
			}, 5000);
		});
	}

	async queryContract(params = {}) {
		const contractAddress = params.contractAddress || this._contractAddress || null;
		const query = params.query || {};

		this.log('querying contract '+contractAddress);
		console.log(query);

		let lcd = this._LCDClient;

		if (!lcd) {
			const chainOptions = await getChainOptions();

			let optionToUse = chainOptions.walletConnectChainIds[0];
			if (params.netId) {
				for (let option of chainOptions.walletConnectChainIds) {
					if (option.name == params.netId) {
						optionToUse = option;
					}
				}
			}

			console.error('optionToUse', optionToUse);

			lcd = new LCDClient({
				URL: optionToUse.lcd,
				chainID: optionToUse.chainID,
				gasPrices: { uluna: 0.015 },
				gasAdjustment: 1.4,
			});
		}

		const resp = await lcd.wasm.contractQuery(
			contractAddress,
			query // query msg
		);

		this.log('got response');

		return resp;
	}

	async waitForTransaction(txhash, timeout = null) {
		this.log('waiting for confirmation of tx: '+txhash);

		const checkInterval = 1000;

		let transactionFound = false;
		let startedAt = new Date();
		let timeouted = false;
		let tx = null;

		do {
			try {
				tx = await this.getTransaction(txhash);
			} catch(e) {
				tx = null;
			}

			if (tx) {
				this.log('transaction confirmed: '+txhash);
				transactionFound = true;
			} else {
				this.log('not yet');
			}

			if (timeout) {
				const now = new Date();
				if (now.getTime() - startedAt.getTime() > timeout) {
					timeouted = true;
				}
			}

			if (!tx) {
				await new Promise((res)=>{ setTimeout(res, checkInterval); });
			}
		} while(!transactionFound && !timeouted);

		return tx;
	}

	async getTransaction(txhash) {
		const resp = await this._LCDClient.tx.txInfo(txhash);

		// console.error('txInfo', resp);

		return resp;
	}

	async mintContainer(userContainer) {
		const contractAddress = this._contractAddress;
		const token_uri = "ipfs://"+userContainer.getMintIPFSHash();
		const token_id = userContainer.getMintIPFSHash();

		const name = userContainer.getTitle();
		const description = userContainer.getDescription();

		const animation_url = "ipfs://"+userContainer.getIPFSHash();
		const image_url = "ipfs://"+userContainer.getPublicThumbIPFSHash();
		const external_url = "https://pepperwatch.com/v/"+userContainer.getMintIPFSHash();

		const c = new Crypt();
		const password = await userContainer.getKeyAsHex();

		const token_key = await c.videoKeyToPublicKey(password);

		const msg = {
			mint: {
				token_id: token_id,
				token_uri: token_uri,
				owner: this._connectedAddress,
				extension: {
					name: name,
					description: description,
					animation_url: animation_url,
					external_url: external_url,
					image: image_url,
				},
				token_key: token_key.token_key,
				token_key_version: token_key.token_key_version,
			}
		};

		const price = userContainer.getPrice();
		if (price) {
			msg.mint.extension.watch_price = ''+(1000000 * price); // price in uluna
		}

		console.error(msg);

		const resp = await this.executeContract({
			contractAddress: contractAddress,
			instructions: msg,
			sync: true,
		});


		// @todo: catch error message ( resp.code != 0 ) resp.raw_log - error

		console.log(resp);

		if (resp && resp.code == 0) {


			return true;
		}

		return false;

		// if (resp.raw_log) {
		// 	// error
		// }

		// console.error(resp);
	}

	async mint(mediaId) {
		const contractAddress = this._contractAddress;
		const msg = {
			mint: {
				token_id: mediaId,
				token_uri: ('ipfs://'+mediaId),
				owner: this._connectedAddress,
				extension: {},
			}
		};

		const resp = await this.executeContract({
			contractAddress: contractAddress,
			instructions: msg,
			sync: true,
		});

		console.error(resp);
	}

	async instantiateNFT() {
		const msg = {
			name: 'Test',
			symbol: 'TST',
			minter: this._connectedAddress,
		};
		// On bombay cw721-base contract already deployed and that codeId is 10312
		// cw721 contract https://github.com/CosmWasm/cw-nfts/tree/main/packages/cw721
		const cw721CodeId = 12353;

		return await this.instantiate(cw721CodeId, msg);
	}

	async instantiate(codeId, instantiateMsg, initCoins = {}) {
		const fee = new Fee(500000, '75000uusd')

		const fromAddress = this._connectedAddress;
		const msgInstantiateContract = new MsgInstantiateContract(fromAddress, fromAddress, codeId, instantiateMsg, initCoins);

		const resp = await this._walletController.post({
			fee: fee,
			msgs: [
				msgInstantiateContract,
			]
		});

		let txhash = null;

		if (resp && resp.result && resp.result.txhash) {
			txhash = resp.result.txhash;
		}

		const tx = await this.waitForTransaction(txhash);
		let contractAddress = null;

		tx.logs.map(log => {
			log.events.map(event => {
				event.type === 'instantiate_contract' && event.attributes.map(attr => {
					if (attr.key === 'contract_address') {
						contractAddress = attr.value;
					}
				});
			});
		});

		console.error(contractAddress);

		if (contractAddress) {
			return contractAddress;
		}
	}


	async executeContract(params = {}) {
		const contractAddress = params.contractAddress || this._contractAddress || null;
		const fromAddress = this._connectedAddress;
		const instructions = params.instructions || {};

		const coins = {};
		if (params.uluna) {
			coins.uluna = params.uluna;
		}

		// const msgExecuteContract = new MsgExecuteContract(fromAddress, contractAddress, instructions, { uluna: 100000 });
		const msgExecuteContract = new MsgExecuteContract(fromAddress, contractAddress, instructions, coins);
		// const fee = new Fee(1000000, '200000uusd');

		const memo = params.memo || undefined;

		this.log('executing contract...');

		const resp = await this._walletController.post({
			// fee: fee,
			msgs: [
				msgExecuteContract,
			],
			memo: memo,
		});

		this.log('executed');

		let txhash = null;

		if (resp && resp.result && resp.result.txhash) {
			txhash = resp.result.txhash;
			// console.error('resp.result.txhash', resp.result.txhash);
			// return resp.result.txhash;
		}

		if (params.sync && txhash) {
			return await this.waitForTransaction(txhash, params.timeout);
		}

		return txhash;
	}

	async init() {
		if (this._initPromise) {
			return await this._initPromise;
		}
		this._initPromiseResolver = null;
		this._initPromise = new Promise((res)=>{
			this._initPromiseResolver = res;
		});

		const chainOptions = await getChainOptions();
		console.error('chainOptions', chainOptions);

		const controller = new WalletController(chainOptions);

		try {
			await this.waitForExtension(controller);
		} catch(e) {
			this.dispatchEvent(new Event('error'));
			throw e;
		}

		// alert('extension ready');

		this._connectPromiseResolver = null;
		this._connectPromise = new Promise((res)=>{
			this._connectPromiseResolver = res;
		});

		controller.states().subscribe((state) => {
				console.error(state);
			if (state.status == "WALLET_CONNECTED") {
				console.error(state);

				if (state.wallets && state.wallets[0] && state.wallets[0].terraAddress) {
					this._connectedAddress = state.wallets[0].terraAddress;
				}
				if (state.network && state.network.chainID) {
					this._connectedNetId = state.network.chainID;
				}
				if (state.network && state.network.name) {
					this._netName = state.network.name;
				}

				console.log('LCD', state.network.lcd);
				this._LCDClient = new LCDClient({
					URL: state.network.lcd,
					chainID: state.network.chainID,
					gasPrices: { uluna: 0.015 },
					gasAdjustment: 1.4,
				});

				this._isConnected = true;

				if (this._connectPromiseResolver) {
					this._connectPromiseResolver();
				}
			} else {
				this._isConnected = false;
			}

		});


		// await controller.enableExtension();

		// controller.availableConnectTypes().subscribe(value => console.error(value, 'availableConnectTypes'));
		// controller.availableConnections().subscribe(value => console.error(value, 'availableConnections'));
		// controller.availableInstallTypes().subscribe(value => console.error(value, 'availableInstallTypes'));
		// controller.states().subscribe(value => console.error(value, 'state'));

		// console.log(await controller.availableConnections());
		// console.log(await controller.availableConnectTypes());
		// console.log(await controller.availableInstallTypes());
		// console.log(await controller.states());

		controller.connect("EXTENSION", 'station');

		await this._connectPromise;

		this._walletController = controller;

		this.dispatchEvent(new Event('connected'));

		// await this.waitForConnected(controller);

		// alert('connected');


		// this.dispatchEvent(new Event('connected'));


		// const TEST_BYTES = Buffer.from('hello world');
		// const connectedWallet = useConnectedWallet();

		if (!this._walletController) {
			const TEST_FROM_ADDRESS = 'terra1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v';
			// const TEST_TO_ADDRESS = 'terra12hnhh5vtyg5juqnzm43970nh4fw42pt27nw9g9';

			const CONTRACT = 'terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5';

			const resp = await controller.sign({
				fee: new Fee(1000000, '200000uusd'),
				msgs: [
					new MsgExecuteContract(TEST_FROM_ADDRESS, CONTRACT, {"increment":{}}, {  }),
				],
				memo: "test transaction!"
			});

			// const resp = await controller.sign({
			// 	fee: new Fee(1000000, '200000uusd'),
			// 	msgs: [
			// 		new MsgExecuteContract(TEST_FROM_ADDRESS, CONTRACT, {"increment":{}}, { uusd: 10000000, uluna: 1000000 }),
			// 	]
			// });

			console.error(resp);
		}

		// const tx = resp.result;

		// const tx2 = JSON.stringify({ tx: tx, mode: 'sync' });

		// console.error(tx2);

		// const final = await controller.post(tx2);

		// console.error(final);
// const result = await terra.wasm.contractQuery(
//   contract_address[0],
//   { query: { queryMsgArguments } } // query msg
// );
		// controller.signBytes(new Uint8Array([34,43,44]));

		// console.error('terra', status, network, wallets);

		this._initPromiseResolver();
	}

	hasEncryptionPublicKey() {
		if (this._encryptionPublicKey) {
			return true;
		}
		const localStorageKey = 'public_key_'+this._connectedAddress;
		const localStoragePrivateKey = 'private_key_'+this._connectedAddress;

		if (window.localStorage.getItem(localStorageKey) && window.localStorage.getItem(localStoragePrivateKey)) {
			this._encryptionPublicKey = window.localStorage.getItem(localStorageKey);
			this._encryptionPrivateKey = window.localStorage.getItem(localStoragePrivateKey);

			const c = new Crypt();
			this._encryptionPrivateKey = c.hex2u8a(this._encryptionPrivateKey);

			return true;
		}
	}

	async getEncryptionPublicKey() {
		if (this._encryptionPublicKey) {
			return this._encryptionPublicKey;
		}


		// try to get from localstorage
		if (this.hasEncryptionPublicKey()) {
			return this._encryptionPublicKey;
		}

		this.log('getting encryption public key...');

		// should work as something as eth_getEncryptionPublicKey in Metamask
		// some derrived from privateKey public key
		// there's no such functionality in Station Wallet
		// so we are trying to mimic it

		const contractAddress = this._contractAddress;
		const fromAddress = this._connectedAddress;
		const instructions = {"ask_for_key":{"key":fromAddress,"media":fromAddress}};
		const msgExecuteContract = new MsgExecuteContract(fromAddress, contractAddress, instructions, {  });
		const fee = new Fee(1000000, '200000uusd');

		this.log('signing transaction...');

		const resp = await this._walletController.sign({
			fee: fee,
			msgs: [
				msgExecuteContract,
			],
		});

		this.log('transaction signed');

		console.log(resp);

		const data = resp.result.auth_info.signer_infos[0].public_key.key;

		this.log('key is: '+data);

		const uint8ofLength32 = new Uint8Array(32);
		const binaryString = window.atob(data);
		for (let i = 0; i < 32; i++) {
			uint8ofLength32[i] = binaryString.charCodeAt(i);
		}

		// signed transaction T2Hn0Kcb3iHZCyRrYYIyP/7H95HbPTvw8l0eVhQI91hGscCAVS1fFkSt385I6UXhdZ/NcABhYs9R5xSp3YQwfA==
		// AjszqFJDRAYbEjZMuiD+ChqzbUSGq/RRu3zr0R6iJB5b
		// AjszqFJDRAYbEjZMuiD+ChqzbUSGq/RRu3zr0R6iJB5b

		this._encryptionPrivateKey = uint8ofLength32;
		this._encryptionPublicKey = sigUtil.getEncryptionPublicKey(uint8ofLength32);

		this.log('derived public key is: '+this._encryptionPublicKey );

		const c = new Crypt();
		const privateKeyAsString = c.u8a2hex(this._encryptionPrivateKey);

		const localStorageKey = 'public_key_'+this._connectedAddress;
		const localStoragePrivateKey = 'private_key_'+this._connectedAddress;

		window.localStorage.setItem(localStorageKey, this._encryptionPublicKey);
		window.localStorage.setItem(localStoragePrivateKey, privateKeyAsString);

		this.log('derived public key is: '+this._encryptionPublicKey );

		return this._encryptionPublicKey;
	}

	async decryptMessage(encryptedMessage) {
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
}