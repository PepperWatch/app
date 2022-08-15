import FileStorage from './FileStorage.js';
import UserContainer from './UserContainer.js';

export default class PreparedMints {
	constructor() {
		this._fileStorage = new FileStorage();

		this._storedRecords = [];
	}

	get records() {
		return this._storedRecords;
	}

	static getSingleton() {
		if (PreparedMints.__singleInstance) {
			return PreparedMints.__singleInstance;
		} else {
			PreparedMints.__singleInstance = new PreparedMints();
			return PreparedMints.__singleInstance;
		}
	}

	async add(userContainer) {
		const containerBlob = await this._fileStorage.fileToBlob( userContainer.containerUserFile.file );
		const containerHash = await userContainer.containerUserFile.hash();

		const originalBlob = await this._fileStorage.fileToBlob( userContainer.privateUserFile.file );
		const originalHash = await userContainer.privateUserFile.hash();

		const uniqId = originalHash + '_' + containerHash;
		const url = await this._fileStorage.randomURL('.mp4', uniqId);

		await userContainer.privateUserFile.prepare();

		const privateThumb = await userContainer.getPrivateThumbBlob();
		const publicThumb = await userContainer.getPublicThumbBlob();

		const password = await userContainer.getKeyAsHex();

		const publicDuration = await userContainer.containerUserFile.getMediaDuration();
		const publicWidth = await userContainer.containerUserFile.getMediaWidth();
		const publicHeight = await userContainer.containerUserFile.getMediaHeight();

		const privateDuration = await userContainer.privateUserFile.getMediaDuration();
		const privateWidth = await userContainer.privateUserFile.getMediaWidth();
		const privateHeight = await userContainer.privateUserFile.getMediaHeight();

		// const containerThumb = await userContainer.containerUserFile.getThumbBlob();

		const fields = {
			uniqId: uniqId,
			privateBlob: originalBlob,
			publicBlob: containerBlob,

			privateThumb: privateThumb,
			publicThumb: publicThumb,

			publicDuration: publicDuration,
			publicWidth: publicWidth,
			publicHeight: publicHeight,

			privateDuration: privateDuration,
			privateWidth: privateWidth,
			privateHeight: privateHeight,

			createdAt: new Date(),
			password: password,
		};

		console.log('added', fields);
		console.log(url);

		await this._fileStorage.put(url, fields, true);
	}

	async restore() {
		let records = [];
		try {
			records = await this._fileStorage.getAll();
		} catch(e) {
			records = [];
		}

		console.error(records);

		for (let record of records) {
			try {
				const userContainer = UserContainer.fromIndexedDB(record);
				this._storedRecords.push(userContainer);
			} catch(e) {
				console.error(e);
			}
		}

		console.log(this._storedRecords);
	}

}