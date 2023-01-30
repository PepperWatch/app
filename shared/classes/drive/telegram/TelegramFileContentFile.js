import CommonTelegramMethods from './CommonTelegramMethods.js';

export default class TelegramFileContentFile extends CommonTelegramMethods {
	constructor(params = {}) {
		super();

		this._telegramFile = params.telegramFile;
		this._mp4 = params.mp4 || null; // instance of MP4Steg container
		this._mp4data = params.mp4data || {}; // instance of data returned by mp4.getEmbedFiles()
		this._n = params.n || 0; // n-th order in mp4.getEmbedFiles() array

		this._writable = null;
		this._arrayBuffer = null;

		this._mimeType = 'video/mp4';
	}

	async getSWURL() {
		const type = await this.getType();
		if (type == 'video') {
			return '/askfor/'+this._telegramFile.id+'-'+this._n+'.mp4';
		} else if (type == 'photo') {
			return '/askfor/'+this._telegramFile.id+'-'+this._n+'.jpg';
		}
		return '/askfor/'+this._telegramFile.id+'-'+this._n+'.dat';
	}

	getFileName() {
		if (this._mp4data && this._mp4data.filename) {
			return this._mp4data.filename;
		}

		return null;
	}

	async getType() {
		await this.prepare();

		const fileName = this.getFileName();
		return this.fileNameToType(fileName); // method from CommonTelegramMethods
	}

	get mimeType() {
		return this._mimeType;
	}

	async prepare() {
		if (this.isThereSingleThread('prepare')) { // be sure it's executed once only
			return await this.waitForSingleThread('prepare');
		}
		this.createSingleThread('prepare');

		this._writable = await this._mp4.extractFile(this._n);

		await new Promise((res)=>setTimeout(res, 2000));

		const blob = await this._writable.toBlob();
		this._arrayBuffer = await blob.arrayBuffer();

		this.log('this._writable', this._writable);
		this.log('this._arrayBuffer', this._arrayBuffer);

		this.resolveSingleThread('prepare');
	}

	async getSlice(offset, length) {
		await this.prepare();
		this.log(offset, length);
		const uint8array = new Uint8Array(this._arrayBuffer, offset, length);
		return uint8array.slice(0, length);

		// return this._arrayBuffer.slice(offset, offset + length);
		// console.log(offset, length);

		// return Buffer.alloc(0);
	}

	async size() {
		await this.prepare();

		return this._arrayBuffer.byteLength;
	}

	async download() {
		await this.prepare();

        const fileSize = await this.size();
        const chunk = await this.getSlice(0, fileSize);
		const blob = new Blob([chunk], {type: this.mimeType });

		let blobUrl = window.URL.createObjectURL(blob);
		let link = document.createElement("a");
		link.href = blobUrl;

		link.download = this.getFileName();

		document.body.appendChild(link);
		link.innerHTML = "download";
		link.style.display = 'none';
		link.click();

		link.remove();

		window.URL.revokeObjectURL(blobUrl);
	}

}
