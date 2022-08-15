// import Metamask from '../classes/Metamask.js';
import UploadedContainer from './UploadedContainer.js';

export default class Viewer {
	constructor() {
		this._serverData = {};

		this._videoHash = null;
		this._mintIpfsHash = null;
		this._contractAddress = null;

		this._isOkOnAPI = false;
	}

	async getData() {
        const videoURL = await this.getVideoURL();
        const videoTitle = await this.getVideoTitle();
        const videoDescription = await this.getVideoDescription();
        const videoHash = await this.getVideoHash();
        const expectedContractAddress = await this.getContractAddress();

		return {
			videoURL,
			videoTitle,
			videoDescription,
			videoHash,
			expectedContractAddress,
		};
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

	async getContractAddress() {
		return this._contractAddress;
	}

	async getVideoURL() {
		console.error(this._serverData, 'serverData');
		if (this._serverData && this._serverData.encodedIpfsHash) {
			return 'https://arweave.net/'+this._serverData.encodedIpfsHash;
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
			const request = new Request('https://arweave.net/'+hash);
			const response = await fetch(request);
			const json = await response.json();


			console.error('json', json);
			if (json) {
				if (json.properties && json.properties.pepper_unique) {
					this._videoHash = json.properties.pepper_unique;
				}
				if (json.properties && json.properties.contract_address) {
					this._contractAddress = json.properties.contract_address;
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

	async getDecodedVideoURL(key, fileURL) {
		if (this._decodedBlobURL) {
			return this._decodedBlobURL;
		}

		try {
			if (!fileURL) {
				fileURL = await this.getVideoURL();
			}

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
