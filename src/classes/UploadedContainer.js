
// const { MP4, Writable, Readable } = require('mp4steg');
const { MP4 } = require('mp4steg');
// import FileListFileSet from './FileListFileSet.js';
import UserFile from './UserFile.js';
import Crypt from './Crypt.js';

export default class UploadedContainer {
	constructor({containerUserFile, file} = {}) {
		Object.assign(this, {containerUserFile, file});

		if (!this.containerUserFile && this.file) {
			this.containerUserFile = new UserFile({
				file: this.file,
			});
		}

		this._mp4 = null;
		this._key = '';
		this._decodedBlob = null;
		this._containerBlob = null;

		if (this.containerUserFile) {
			this._containerBlob = this.containerUserFile.file;
		}
	}

	setKey(key) {
		if (typeof key === 'string' || key instanceof String) {
			const c = new Crypt();
			key = c.hex2u8a(key);
		}

		this._key = key;
	}

	get containerBlob() {
		return this._containerBlob;
	}

	get decodedBlob() {
		return this._decodedBlob;
	}

	// get password() {
	// 	return this._password;
	// }

	async prepare() {

	}

	async decode(key) {
		this.setKey(key);
		this._decodedBlob = null;
		try {
			this._mp4 = new MP4();
			this._mp4.setKey(this._key);

			console.error('this._key', this._key);

			await this._mp4.loadFile({file: this.containerUserFile.file});

			const embedFiles = this._mp4.getEmbedFiles();
			if (embedFiles && embedFiles.length) {
				for (let i = 0; i < embedFiles.length; i++) {
					const writable = await this._mp4.extractFile(i);
					const blob = await writable.toBlob();

					this._decodedBlob = blob;
				}
			}
		} catch(e) {
			console.error(e);
		}

		console.error(this._decodedBlob);

		if (this._decodedBlob) {
			return true;
		}

		return false;
	}

	// static async extractFileList(fileListFile, password) {
	// 	console.error('D Password', password);
	// 	const mp4 = new MP4();

	// 	if (password) {
	// 		mp4.setPassword(password);
	// 	}
	// 	await mp4.loadFile({file: fileListFile.file});

	// 	const embedFiles = mp4.getEmbedFiles();
	// 	const fileListFileSet = new FileListFileSet();

	// 	if (embedFiles && embedFiles.length) {
	// 		for (let i = 0; i < embedFiles.length; i++) {
	// 			let embedFile = embedFiles[i];
	// 			// console.error(embedFile);

	// 			// const writable = await mp4.extractFile(i);
	// 			// const blob = await writable.toBlob();

	// 			let meta = '';
	// 			if (embedFile.meta && embedFile.meta.meta) {
	// 				meta = embedFile.meta.meta;
	// 			}

	// 			if (!embedFile.meta || !embedFile.meta.thumbnail) {

	// 				let fileListFile = new FileListFile({
	// 					filename: embedFile.filename,
	// 					size: embedFile.size,
	// 					fileSet: fileListFileSet,
	// 					meta: meta,
	// 					// file: blob,
	// 					mp4: mp4,
	// 					nInMp4: i,
	// 				});

	// 				fileListFileSet.push(fileListFile);
	// 			}
	// 		}
	// 	}

	// 	console.error(fileListFileSet);
	// 	console.error(embedFiles);

	// 	return fileListFileSet;
	// }



	composeHumanSize() {
		// nice one. https://stackoverflow.com/a/20732091/1119169  thanks Andrew!
		const sizeI = Math.floor( Math.log(this.size) / Math.log(1024) );
		// return ( size / Math.pow(1024, sizeI) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
		this.humanSize = ( this.size / Math.pow(1024, sizeI) ).toFixed(0) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
	}
}
