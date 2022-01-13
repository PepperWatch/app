const terra = require('@terra-money/terra.js');
const MnemonicKey = terra.MnemonicKey;
const LCDClient = terra.LCDClient;

const MsgExecuteContract = terra.MsgExecuteContract;
const Crypter = require("./Crypter.js");

class Blockchainer {
	constructor(params = {}) {
		this._contract = params.contract || null;
		this._contractSettings = null;
		this._provider = null;
		this._wallet = null;

		if (!this.isContractOk()) {
			throw new Error('Invalid contract specified');
		}

		this.tryToSetUpProvider();
		this.tryToSetUpWallet(); // may throw error
	}

	getMK(mkName) {
		if (mkName == 'test') {
			return 'panic polar menu cargo stock space hobby decline absorb police curve corn lazy apple curtain glove toast slice reunion journey alien window school gain';
		}
		if (mkName == 'test2') {
			return 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius';
		}

		return null;
	}

	isContractOk() {
		const okContracts = [
			{address: 'terra1mwt8z6raw2270n6jmdu5ce2p8kkla7u4rch3d6', provider: 'terra', server: 'bombay-lcd.terra.dev', chainID: 'bombay-12', mkName: 'test'},
			{address: 'terra1gw4kp9sustq89y5m8wl9q7h8flljhazvnarxhp', provider: 'terra', server: 'bombay-lcd.terra.dev', chainID: 'bombay-12', mkName: 'test2'},
			{address: 'terra1nq2m2vldntvnaq45es7fnskcpze067qgm60zhj', provider: 'terra', server: 'bombay-lcd.terra.dev', chainID: 'bombay-12', mkName: 'test2'},
		];

		let foundOk = false;
		for (let okContract of okContracts) {
			if (okContract.address == this._contract) {
				this._contractSettings = okContract;
				foundOk = true;
			}
		}

		return foundOk;
	}

	tryToSetUpWallet() {
		const mkString = this.getMK(this._contractSettings.mkName);
		if (!mkString) {
			throw new Error('Can not initialize wallet');

		}

		const mk = new MnemonicKey({
			mnemonic: mkString
		});
		this._wallet = this._provider.wallet(mk);
	}

	tryToSetUpProvider() {
		this._provider = new LCDClient({
			URL: ('https://'+this._contractSettings.server),
			chainID: this._contractSettings.chainID,
		});
	}

	async storeMediaKeyForUser(mediaId, userAccount, encodedKey) {
		const instructions = {
			"fill_key": {
				media: mediaId,
				addr: userAccount,
				key: encodedKey,
			},
		};

		return await this.executeContract(instructions);
	}

	async getUserEncryptionPublicKey(mediaId, userAccount) {
		const query = {get_key: {media: mediaId, addr: userAccount}};
		const onBlockchain = await this.queryContract(query);

		if (onBlockchain.key && onBlockchain.is_public) {
			return onBlockchain.key;
		}

		return null;
	}

	async getMediaPublicKey(mediaId) {
		const query = {get_public_key: {media: mediaId}};
		const onBlockchain = await this.queryContract(query);

		if (onBlockchain && onBlockchain.token_key_version) {
			const decoded = await Crypter.decodeKeyFromBlockchain(onBlockchain.token_key, onBlockchain.token_key_version);

			return decoded;
		}

		return null;
	}

	async queryContract(query) {
		let resp = null;

		try {
			resp = await this._provider.wasm.contractQuery(
				this._contract,
				query
			);
		} catch(e) {
			// console.error(e);
			resp = null;
		}

		return resp;
	}

	async executeContract(instructions) {
		const msgExecuteContract = new MsgExecuteContract(this._wallet.key.accAddress, this._contract, instructions, {});

		const tx = await this._wallet.createAndSignTx({
			msgs: [msgExecuteContract],
			memo: "memo"
		});
		const result = await this._provider.tx.broadcast(tx);
		if (result && result.txhash) {
			return result.txhash;
		}

		return null;
	}
}


module.exports = Blockchainer;