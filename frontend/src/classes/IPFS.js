// import { create } from 'ipfs-http-client'

export default class IPFS {
	constructor() {
		this._ipfs = null;//create({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values
	}

	log(str) {
		console.log('IPFS | ', str);
	}

	static getSingleton() {
		if (IPFS.__singleInstance) {
			return IPFS.__singleInstance;
		} else {
			IPFS.__singleInstance = new IPFS();
			return IPFS.__singleInstance;
		}
	}

	async upload(data) {
		if (data instanceof Blob) {
			data = await data.arrayBuffer();
		}

		const file = await this._ipfs.add(data);

		return (''+file.cid);
		// console.error(''+file.cid);
	}
}