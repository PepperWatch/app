
// const { MP4, Writable, Readable } = require('mp4steg');
// const { MP4 } = require('mp4steg');
// import FileListFileSet from './FileListFileSet.js';

import UserFile from './UserFile.js';
import PreparedMints from '../classes/PreparedMints.js';
// import IPFS from './IPFS.js';
import Crypt from './Crypt.js';

export default class UserContainer {
	constructor({containerUserFile, indexedDBRecord = null} = {}) {
		Object.assign(this, {containerUserFile, indexedDBRecord});

		this._mp4 = null;
		this._password = '';

		this.privateUserFile = null; // the one to be embeded

		this.id = null; // unique id of this container

		this.encodedBlob = null; // encoded public + private

		// data to be prepared
		this._prepared = false;

		this._encodedIPFSHash = null;
		this._publicThumbIPFSHash = null;
		this._mintIPFSHash = null;

		this._encodedSize = 0;
		this._encodedSizeHuman = '0B';

		this._privateBlobURL = null;
		this._privateThumbBlob = null;
		this._privateThumbBlobURL = null;
		this._privateSize = 0;
		this._privateSizeHuman = '0B';
		this._privateDuration = 0;
		this._privateDurationHuman = '0:00';
		this._privateResolution = '';

		this._publicBlobURL = null;
		this._publicThumbBlob = null;
		this._publicThumbBlobURL = null;
		this._publicSize = 0;
		this._publicSizeHuman = '0B';
		this._publicDuration = 0;
		this._publicDurationHuman = '0:00';
		this._publicResolution = '';

		this._title = '';
		this._description = '';
		this._price = null;

		this._isMinted = false;

		this._crypt = new Crypt();

		if (this.indexedDBRecord) {
			this.setFromIndexedDBRecord();
		}
	}

	async getMintJSON(contractAddress) {

		const object = {
			"name": (''+this._title),
			"description": (''+this._description),
			"external_url": "https://pepperwatch.com/v/"+this.id,
			"image": (""+this.getPublicThumbIPFSHashURL()),
			"animation_url": (""+this.getIPFSHashURL()),
			// "collection":{
			// 	"name":"PepperWatch Master",
			// 	"family":"PepperWatch Master",
			// },
			"attributes": [

			],
			"properties": {
				"pepper_unique": this.id,
				"private_duration": this.getPrivateDurationHuman(),
				"private_resolution": this.getPrivateResolution(),
			},
		};

		if (contractAddress) {
			object.properties.contract_address = contractAddress;
		}

		return JSON.stringify(object, null, '\t');
	}

	async mintOn(blockchainProvider, collection = null) {
		const success = await blockchainProvider.mintContainer(this, collection);

		console.log('minted', success);

		if (success) {
			this._isMinted = true;
			this.indexedDBRecord.set('isMinted', this._isMinted);
			this.indexedDBRecord.set('address', ''+success);
			this.indexedDBRecord.save();

			return (''+success);
		}

		return false;
	}

	async uploadToIPFS(blockchainProvider) {
		if (!this.encodedBlob) {
			await this.makeEncoded();
		}

		// const ipfs = IPFS.getSingleton();

		this._encodedIPFSHash = await blockchainProvider.upload(this.encodedBlob, 'video');

		const thumbBlob = await this.getPublicThumbBlob();

		this._publicThumbIPFSHash = await blockchainProvider.upload(thumbBlob, 'image');

		const mintJSON = await this.getMintJSON(blockchainProvider.contractAddress);

		this._mintIPFSHash = await blockchainProvider.upload(mintJSON, 'json');


		if (this.indexedDBRecord) {
			this.indexedDBRecord.set('ipfsHash', this._encodedIPFSHash);
			this.indexedDBRecord.set('publicThumbIPFSHash', this._publicThumbIPFSHash);
			this.indexedDBRecord.set('mintIPFSHash', this._mintIPFSHash);

			this.indexedDBRecord.set('title', this._title);
			this.indexedDBRecord.set('description', this._description);

			this.indexedDBRecord.save();
		}
	}

	setFromIndexedDBRecord() {
		if (this.indexedDBRecord) {
			this._publicThumbBlob = this.indexedDBRecord.get('publicThumb', null);
			this._privateThumbBlob = this.indexedDBRecord.get('privateThumb', null);

			this._password = this.indexedDBRecord.get('password', null);
			console.error('this._password', this._password);
			this._password = this._crypt.hex2u8a(this._password);
			console.error('this._password', this._password);

			const publicBlob = this.indexedDBRecord.get('publicBlob', null);
			if (publicBlob) {
				const publicUserFile = new UserFile({
					file: publicBlob,
					filename: 'video.mp4',
				});
				this.containerUserFile = publicUserFile;
			}

			const privateBlob = this.indexedDBRecord.get('privateBlob', null);
			if (privateBlob) {
				const privateUserFile = new UserFile({
					file: privateBlob,
					filename: 'video.mp4',
				});
				this.privateUserFile = privateUserFile;
			}

			const encodedBlob = this.indexedDBRecord.get('encodedBlob', null);
			this.encodedBlob = encodedBlob;

			this.id = this.indexedDBRecord.get('uniqId', null);

			this._encodedIPFSHash = this.indexedDBRecord.get('ipfsHash', null);
			this._publicThumbIPFSHash = this.indexedDBRecord.get('publicThumbIPFSHash', null);
			this._mintIPFSHash = this.indexedDBRecord.get('mintIPFSHash', null);

			this._title = this.indexedDBRecord.get('title', '');
			this._description = this.indexedDBRecord.get('description', '');

			this._isMinted = this.indexedDBRecord.get('isMinted', false);
			this._price = this.indexedDBRecord.get('price', 0.01);
		}
	}

	static fromIndexedDB(record) {
		const userContainer = new UserContainer({
			indexedDBRecord: record,
		});

		return userContainer;
	}

	setTitle(title) {
		this._title = title;
	}

	setDescription(description) {
		this._description = description;
	}

	getTitle() {
		return this._title;
	}

	getDescription() {
		return this._description;
	}

	setPublicThumbBlob(thumbBlob) {
		this._publicThumbBlob = thumbBlob;
	}

	setPrivateThumbBlob(thumbBlob) {
		this._privateThumbBlob = thumbBlob;
	}

	getIPFSHash() {
		return this._encodedIPFSHash;
	}
	getMintIPFSHash() {
		return this._mintIPFSHash;
	}
	getPublicThumbIPFSHash() {
		return this._publicThumbIPFSHash;
	}

	getIPFSHashURL() {
		return 'https://arweave.net/'+this.getIPFSHash();
	}
	getMintIPFSHashURL() {
		return 'https://arweave.net/'+this.getMintIPFSHash();
	}
	getPublicThumbIPFSHashURL() {
		return 'https://arweave.net/'+this.getPublicThumbIPFSHash();
	}

	getEncodedSizeHuman() {
		return this._encodedSizeHuman;
	}
	getPrivateSizeHuman() {
		return this._privateSizeHuman;
	}
	getPublicSizeHuman() {
		return this._publicSizeHuman;
	}


	getPrivateDurationHuman() {
		return this._privateDurationHuman;
	}
	getPublicDurationHuman() {
		return this._publicDurationHuman;
	}
	getPrivateResolution() {
		return this._privateResolution;
	}
	getPublicResolution() {
		return this._publicResolution;
	}

	getIsMinted() {
		return this._isMinted;
	}
	getPrice() {
		return this._price;
	}

	getCreatedAt() {
		if (this.indexedDBRecord) {
			return this.indexedDBRecord.get('createdAt', null);
		} else {
			return null;
		}
	}

	async setPrice(price, persist = false) {
		this._price = price;
		this.indexedDBRecord.set('price', this._price);
		// this.indexedDBRecord.set('price', this._price);
		//
		if (persist) {
			this.indexedDBRecord.save();
		}
		// this.indexedDBRecord.save();
	}

	getKeyAsHex() {
		return Array.from(this._password).map(x => x.toString(16).padStart(2, '0')).join('');
	}
	async getPassword() {
		return this._password;
	}
	get password() {
		return this._password;
	}

	async getPublicBlob() {
		return this.containerUserFile.file;
	}

	async getPublicBlobURL() {
		if (this._publicBlobURL) {
			return this._publicBlobURL;
		}

		await this.prepare();
		this._publicBlobURL = URL.createObjectURL(this.containerUserFile.file);

		return this._publicBlobURL;
	}

	async getPrivateBlob() {
		return this.privateUserFile.file;
	}

	async getPrivateBlobURL() {
		if (this._privateBlobURL) {
			return this._privateBlobURL;
		}

		await this.prepare();
		this._privateBlobURL = URL.createObjectURL(this.privateUserFile.file);

		return this._privateBlobURL;
	}

	async getPrivateThumbBlobURL() {
		await this.prepare();
		return this._privateThumbBlobURL;
	}

	async getPrivateThumbBlob() {
		if (this.privateUserFile) {
			if (!this._privateThumbBlob) {
				this._privateThumbBlob = await this.privateUserFile.getThumbBlob();
			}
		}

		return this._privateThumbBlob;
	}

	async getPublicThumbBlobURL() {
		await this.prepare();
		return this._publicThumbBlobURL;
	}


	async getPublicThumbBlob() {
		if (this.containerUserFile) {
			if (!this._publicThumbBlob) {
				this._publicThumbBlob = await this.containerUserFile.getThumbBlob();
			}
		}

		return this._publicThumbBlob;
	}

	async addToPrepared() {
		const preparedMints = PreparedMints.getSingleton();
		return await preparedMints.add(this);
	}


	async generateRandomKey() {
		return window.crypto.getRandomValues(new Uint8Array(32));
	}

	async generateRandomPassword() {
		const length = 8;
		let result           = '';
		const characters       = 'ABCDEFGHJKMNOPRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++ ) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	async compose(password, privateUserFile) {
		if (!password) {
			password = await this.generateRandomKey();
		}

		this.privateUserFile = privateUserFile;
		this._password = password;

		await this.addToPrepared();
	}

	async reCalc() {
		this.meta = '';
		// this.size = this.containerSize + this.payloadSize;

		const privateBlob = await this.getPrivateBlob();
		const publicBlob = await this.getPublicBlob();

		this._privateSize = privateBlob.size;
		this._publicSize = publicBlob.size;

		if (this.encodedBlob) {
			this._encodedSize = this.encodedBlob.size;
		} else {
			this._encodedSize = this._publicSize + this._privateSize;
		}

		this._encodedSizeHuman = this.composeHumanSize(this._encodedSize);
		this._privateSizeHuman = this.composeHumanSize(this._privateSize);
		this._publicSizeHuman = this.composeHumanSize(this._publicSize);
	}

	async prepare() {
		if (this._prepared) {
			return true;
		}

		// get thumb and thumb url
		if (this.privateUserFile) {
			if (!this._privateThumbBlob) {
				this._privateThumbBlob = await this.privateUserFile.getThumbBlob();
			}
			this._privateThumbBlobURL = URL.createObjectURL(this._privateThumbBlob);
		}

		// get public thumb and thumb url
		if (this.containerUserFile) {
			if (!this._publicThumbBlob) {
				this._publicThumbBlob = await this.containerUserFile.getThumbBlob();
			}
			this._publicThumbBlobURL = URL.createObjectURL(this._publicThumbBlob);
		}

		if (this.indexedDBRecord) {
			this._publicDuration = this.indexedDBRecord.get('publicDuration', 0);
			this._privateDuration = this.indexedDBRecord.get('privateDuration', 0);

			this._publicResolution = ''+this.indexedDBRecord.get('publicWidth', 0)+'x'+this.indexedDBRecord.get('publicHeight', 0);
			this._privateResolution = ''+this.indexedDBRecord.get('privateWidth', 0)+'x'+this.indexedDBRecord.get('privateHeight', 0);
		} else {
			this._publicDuration = await this.containerUserFile.getMediaDuration();
			this._privateDuration = await this.privateUserFile.getMediaDuration();


		}

		this._publicDurationHuman = this.composeHumanDuration(this._publicDuration);
		this._privateDurationHuman = this.composeHumanDuration(this._privateDuration);

		await this.reCalc(); // reCalc sizes

		this._prepared = true;
	}

	composeHumanSize(size) {
		// nice one. https://stackoverflow.com/a/20732091/1119169  thanks Andrew!
		const sizeI = Math.floor( Math.log(size) / Math.log(1024) );
		// return ( size / Math.pow(1024, sizeI) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
		return ( size / Math.pow(1024, sizeI) ).toFixed(0) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
	}

	composeHumanDuration(duration) {
		return '' + Math.floor(duration / 60) + ':' + ('0' + Math.floor(duration % 60)).slice(-2);
	}

	async makeEncoded() {
		if (this._mp4) {
			return true;
		}

		if (!this.containerUserFile || !this.privateUserFile) {
			throw new Error('Nothing to encode');
		}

		const mp4 = await window.newMP4Steg();
		if (!this._password) {
			this._password = await this.generateRandomKey();
		}

		console.error('this._password', this._password);
		mp4.setKey(this._password);

		await mp4.loadFile({file: this.containerUserFile.file});

		console.error(mp4._atoms);

		let id = (''+Math.random()).split('0.').join('');

		await mp4.embedFile({file: this.privateUserFile.file, meta: {id: id, meta: this.privateUserFile.meta}});

		this._mp4 = mp4;

		const writable = await this._mp4.embed();

		this.encodedBlob = await writable.toBlob();
		if (this.indexedDBRecord) {
			this.indexedDBRecord.set('encodedBlob', this.encodedBlob);
			this.indexedDBRecord.save(); // no need for await?
		}

		// this._password = password;
	}

	async download() {
		if (!this.encodedBlob) {
			await this.makeEncoded();
		}

		const response = new Response(this.encodedBlob, {'Content-Type': 'video/mp4', 'Content-Disposition': 'attachment'});
		let blob = await response.blob();

		let blobUrl = window.URL.createObjectURL(blob);
		let link = document.createElement("a");
		link.href = blobUrl;

		link.download = 'encoded.mp4';

		document.body.appendChild(link);
		link.innerHTML = "download";
		link.style.display = 'none';
		link.click();

		link.remove();

		window.URL.revokeObjectURL(blobUrl);



		// if (this._mp4) {
		// const writable = await this._mp4.embed();
		// await writable.saveToFile('container.mp4');
		// } else {
		// 	if (this.containerUserFile && this.privateUserFile) {

		// 	}
		// }
	}

	async remove() {
		return await this.indexedDBRecord.remove();
	}

	cleanUp() {
	}
}
