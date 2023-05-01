
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

	get connectedNetId() {
		return this._connectedNetId;
	}

	get web3() {
		return this._web3;
	}

	log(str) {
		console.log('Metamask | ', str);
	}

	async connect() {
		try {
			await this.init();
		} catch (e) {
			console.error(e);
		}

		return this._isConnected;
	}

	static getSingleton() {
		if (Metamask.__singleInstance) {
			return Metamask.__singleInstance;
		} else {
			Metamask.__singleInstance = new Metamask();
			return Metamask.__singleInstance;
		}
	}

	/**
	 * Check if account is already connected. So there will be no Metamask window on connect
	 * and we can auto-connect user
	 * @return {Boolean} [description]
	 */
	async isAlreadyConnected() {
		if (!window.ethereum) {
			return false;
		}

		const accounts = await window.ethereum.request({method: 'eth_accounts'});
		if (accounts && accounts.length > 0) {
			return true;
		} else {
			return false;
		}
	}

	accountsChanged() {
		this.checkTheData();
	}

	networkChanged() {
		this.checkTheData();
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

			window.ethereum.on('accountsChanged', () => {
				this.accountsChanged();
			});
			window.ethereum.on('networkChanged', (networkId) => {
				this.networkChanged(networkId);
			})

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

			this.dispatchEvent(new Event('notinstalled'));

			this._initPromise = null; // can start init again
		}

		this._initPromiseResolver();
	}

	async checkTheData() {
		try {
			this._connectedAddress = await this.getConnectedAddress();
			this._connectedNetId = await this.getConnectedNetId();

			if (this._connectedNetId && this._connectedAddress) {
				this._isConnected = true;
			} else {
				this._isConnected = false;
			}
		} catch(e) {
			this._connectedAddress = null;
			this._connectedNetId = null;
		}

		if (this._connectedNetId && this._connectedAddress) {
			this._netName = 'UNKNOWN';
			if (nets[this._connectedNetId]) {
				this._netName = nets[this._connectedNetId].name;
				this.log('connected to '+this._netName);
			}
			this._isConnected = true;
		} else {
			this._netName = null;
			this._isConnected = false;
		}

		if (this._isConnected) {
			this.dispatchEvent(new Event('connected'));
		} else {
			this.dispatchEvent(new Event('disconnected'));
		}
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

	async signMessage(string) {
		// https://docs.metamask.io/wallet/how-to/sign-data/#use-personal_sign
		const msg = `0x${Buffer.from(string, 'utf8').toString('hex')}`;
		const from = this.connectedAddress;

		const params = {
			method: 'personal_sign',
			params: [msg, from],
		};

		const sign = await this.callMethod(params);

		return sign;
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