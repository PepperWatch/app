
import Web3 from "web3";

const nets = {
	1: {name: 'MAINNET', main: false},
	3: {name: 'ROPSTEN', main: false},
	42: {name: 'KOVAN', main: false},
	4: {name: 'RINKEBY', main: false},
	5: {name: 'GOERLI', main: false},
	137: {name: 'POLYGON', main: false},
};

export default class Metamask extends EventTarget {
	constructor() {
		super();

		this._isInstalled = false;
		this._isConnected = false;

		this._web3 = null;
		this._connectedAddress = null;
		this._connectedNetId = null;
		this._netName = null;

		this._encryptionPublicKey = null;
	}

	get connectedNetName() {
		return this._netName;
	}

	get connectedAddress() {
		return this._connectedAddress;
	}

	get web3() {
		return this._web3;
	}

	log(str) {
		console.log('Metamask | ', str);
	}

	async connect() {
		await this.init();

		await window.ethereum.enable();

		await this.checkTheData();
	}

	static getSingleton() {
		if (Metamask.__singleInstance) {
			return Metamask.__singleInstance;
		} else {
			Metamask.__singleInstance = new Metamask();
			return Metamask.__singleInstance;
		}
	}

	async init() {
		if (this._initPromise) {
			return await this._initPromise;
		}
		this._initPromiseResolver = null;
		this._initPromise = new Promise((res)=>{
			this._initPromiseResolver = res;
		});

		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			this._web3 = window.web3;
			this._isInstalled = true;

			try {
				await window.ethereum.enable();
				await this.checkTheData();
			} catch (error) {
				// denied by user
			}
		} else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
			this._web3 = window.web3;
			this._isInstalled = true;

			await this.checkTheData();
		} else {
			// MetaMast not installed
			this._isInstalled = false;
		}

		this._initPromiseResolver();
	}

	async checkTheData() {
		this._connectedAddress = await this.getConnectedAddress();
		this._connectedNetId = await this.getConnectedNetId();

		if (nets[this._connectedNetId]) {
			this._netName = nets[this._connectedNetId].name;
			this.log('connected to '+this._netName);
		}

		this.dispatchEvent(new Event('connected'));

		console.error(this);
	}

	async getConnectedAddress() {
		return await new Promise((res, rej)=>{
			this.web3.eth.getAccounts((err, accounts) => {
				if (accounts && accounts[0]) {
					return res(accounts[0]);
				}

				rej(err);
			});
		});
	}

	async getConnectedNetId() {
		return await this.web3.eth.net.getId();
	}

	async callMethod(params) {
		return await new Promise((res,rej)=>{
			window.ethereum.request(params)
				.then((result)=>{
					res(result);
				})
				.catch((e)=>{
					rej(e);
				});
		});
	}

	async getEncryptionPublicKey() {
		if (this._encryptionPublicKey) {
			return this._encryptionPublicKey;
		}

		const params = {
			method: 'eth_getEncryptionPublicKey',
			params: [this.connectedAddress],
		};

		const encryptionPublicKey = await this.callMethod(params);

		this._encryptionPublicKey = encryptionPublicKey;
		return this._encryptionPublicKey;
	}

	async decryptMessage(encryptedMessage) {
		const params = {
			method: 'eth_decrypt',
			params: [encryptedMessage, this.connectedAddress],
		};

		return await this.callMethod(params);
	}
}