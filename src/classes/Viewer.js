// import Metamask from '../classes/Metamask.js';
import UploadedContainer from './UploadedContainer.js';

export default class Viewer {
	constructor({$store} = {}) {
		Object.assign(this, {$store});

		this._serverData = {};
		// this._metamask = Metamask.getSingleton();
		// this._hash = null;

		// this._pepper_unique = null;
		//

		this._videoHash = null;
		this._mintIpfsHash = null;

		this._isOkOnAPI = false;
	}

	get isOkOnAPI() {
		return this._isOkOnAPI;
	}

	async getVideoHash() {
		return this._videoHash;
	}

	async getPepperUnique() {
		return this._pepper_unique;
	}

	async getVideoURL() {
		console.error(this._serverData, 'serverData');
		if (this._serverData && this._serverData.encodedIpfsHash) {
			return 'https://ipfs.infura.io/ipfs/'+this._serverData.encodedIpfsHash;
		}

		return null;
	}

	async getVideoTitle() {
		if (this._serverData && this._serverData.name) {
			return this._serverData.name;
		}

		return 'Watch';
	}

	async getVideoDescription() {
		if (this._serverData && this._serverData.description) {
			return this._serverData.description;
		}

		return "";
	}

	get serverData() {
		return this._serverData;
	}

	async loadInfoByHash(hash) {
		this._videoHash = hash;
		this._mintIpfsHash = hash;

		if (hash.indexOf('_') === -1) {

			// maybe this is ipfs hash?
			const request = new Request('https://ipfs.infura.io/ipfs/'+hash);
			const response = await fetch(request);
			const json = await response.json();


			console.error('json', json);
			if (json) {
				if (json.properties && json.properties.pepper_unique) {
					this._videoHash = json.properties.pepper_unique;
				}
				if (json.animation_url) {
					this._serverData.encodedIpfsHash = json.animation_url.split('/').slice(-1)[0];
				}
				if (json.name) {
					this._serverData.name = json.name;
				}
				if (json.description) {
					this._serverData.description = json.description;
				}

				this._isOkOnAPI = true;
			}

			return true;
		}

		return false;

		// console.error(this._serverData, 'this._serverData');

		// this._hash = hash;

		// return await this.loadInfoFromApi();
	}

	// async loadInfoFromApi() {
	// 	try {
	// 		const resp = await this.$store.dispatch('api/post', {path: '/byhash', data: {videoHash: this._videoHash, mintIpfsHash: this._mintIpfsHash}});
	// 		if (resp && resp.encodedIpfsHash) {
	// 			// console.error(resp, 'resp');
	// 			// this._serverData = resp;  /// we'd better trust minted json

	// 			this._isOkOnAPI = true;
	// 			return resp;
	// 		}
	// 	} catch(e) {
	// 		console.error('can not find by hash on our api');

	// 	}

	// }

	async getDecodedVideoURL(key) {
		if (this._decodedBlobURL) {
			return this._decodedBlobURL;
		}

		try {
			const fileURL = await this.getVideoURL();

			const res = await fetch(fileURL);
			const blob = await res.blob();
			blob.name = 'video.mp4';

			const uploadedContainer = new UploadedContainer({file: blob});
			await uploadedContainer.decode(key);

			if (uploadedContainer.decodedBlob) {

				const response = new Response(uploadedContainer.decodedBlob, {headers: {'Content-Type': 'video/mp4'}});
				let blob = await response.blob();

				let blobUrl = window.URL.createObjectURL(blob);

				this._decodedBlobURL = blobUrl;

				return blobUrl;
			}
		} catch(e) {
			console.error(e);

		}

		return null;
	}

}
