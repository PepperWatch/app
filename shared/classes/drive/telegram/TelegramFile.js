import FileCacher from './FileCacher.js';
import LocalFileInformation from './LocalFileInformation.js';
import TelegramFileContentFile from './TelegramFileContentFile.js';
import CommonTelegramMethods from './CommonTelegramMethods.js';

const bigInt = require("big-integer");

export default class TelegramFile extends CommonTelegramMethods {
	constructor(params = {}) {
		super();

		this._provider = params.provider;
		this._drive = params.drive;
		this._folder = params.folder;

		this._messageMedia = params.messageMedia;
		this._message = params.message;

		this._id = params.id || null;

		this._lowPreview = null;
		this._highPreviewBlob = null;
		this._highPreviewBlobURL = null;

		this._downloadedChunks = {};

		this._isToBeUploaded = !!params.file; // file is window.File instance, not this class instance
		this._toBeUploadedFileInfo = params.file ? (new LocalFileInformation(params.file)) : null;

		this._contentFiles = [];

		this._debug = true;
	}

	async getSWURL() {
		const type = await this.getType();
		if (type == 'video') {
			return '/askfor/'+this.id+'.mp4';
		} else if (type == 'photo') {
			return '/askfor/'+this.id+'.jpg';
		}
		return '/askfor/'+this.id+'.dat';
	}

	get contentFiles() {
		return this._contentFiles;
	}

	async tryToDecodeWith(keyOrPassword) {
		this._contentFiles = [];

		const mp4 = await window.newMP4Steg();
		mp4.setPassword(keyOrPassword);

		const thisSize = await this.size();
		const fileForReadable = {
			size: thisSize,
			getSlice: async(offset, length) => {
				return await this.getSlice(offset, length);
			},
		};

		await mp4.loadFile({file: fileForReadable});
		this.log(mp4._atoms);
		this.log(mp4.getEmbedFiles());

		const embedFiles = mp4.getEmbedFiles();
		for (let i = 0; i < embedFiles.length; i++) {
			const contentFile = new TelegramFileContentFile({
				telegramFile: this,
				mp4: mp4,
				n: i,
				mp4data: embedFiles[i],
			});

			this._contentFiles.push(contentFile);

			const slice = await contentFile.getSlice(0, 10);
			this.log('slice', slice);
			const slice2 = await contentFile.getSlice(2, 10);
			this.log('slice', slice2);
		}

		this.log(this._contentFiles);

		return this._contentFiles;
	// 	await mp4Steg.loadFile({file: containerBlob});
	// 	console.error('mp4Steg', mp4Steg);

	// 	const randomKey = window.crypto.getRandomValues(new Uint8Array(32));

	// 	mp4Steg.setKey(randomKey);

	// 	await mp4Steg.loadFile({file: containerBlob});
	}

	toBeUploadedOriginalURL() {
		if (this._toBeUploadedFileInfo) {
			return window.URL.createObjectURL(this._toBeUploadedFileInfo.file);
		}

		return null;
	}

	originalFile() {
		if (this._toBeUploadedFileInfo) {
			return this._toBeUploadedFileInfo.file;
		}

		return null;
	}

	async prepareLocal() {
		// get width and height
		if (this._toBeUploadedFileInfo) {
			await this._toBeUploadedFileInfo.prepare();
		}
	}

	async fromURL(url) {
		const res = await fetch(url);
		const blob = await res.blob();

		const filename = (''+url).split(/[\\/]/).pop();

		const file = new window.File([blob], filename, {
			lastModified: Date.now(),
			type: blob.type,
		});

		const ret = new TelegramFile({
			file: file,
			provider: this.provider,
			drive: this._drive,
			folder: this._folder,
			id: (''+Math.random()),
		});

		return ret;
	}

	copy() {
		const file = new TelegramFile({
			provider: this.provider,
			drive: this._drive,
			folder: this._folder,
			messageMedia: this._messageMedia,
			message: this._message,
			id: `${this.id}_copy_${Math.random()}`,
		});

		return file;
	}

	get id() {
		if (this._id) {
			return this._id;
		}

		if (this._messageMedia) {
			if (this._messageMedia.document) {
				return this._messageMedia.document.id;
			} else if (this._messageMedia.photo) {
				return this._messageMedia.photo.id;
			}
		}

		return null;
	}

	get isToBeUploaded() {
		return this._isToBeUploaded;
	}

	get provider() {
		return this._provider;
	}

	get client() {
		if (this.provider && this.provider.client) {
			return this.provider.client;
		}

		return null;
	}

	async getType() {
		if (this._messageMedia) {
			if (this._messageMedia.photo) {
				return 'photo';
			}
			if (this._messageMedia.document && this.width) {
				// can be a video or a container
				return 'video';
			}
		}

		if (this._toBeUploadedFileInfo) {
			return await this._toBeUploadedFileInfo.getType();
		}

		return null;
	}

	get previewCacheURL() {
		return ''+this.id+'_preview.jpg';
	}

	get mimeType() {
		if (this._messageMedia) {
			if (this._messageMedia.className == "MessageMediaPhoto") {
				return 'image/jpeg';
			} else if (this._messageMedia.document) {
				return this._messageMedia.document.mimeType;
			}
		}

		return null;
	}

	get fileName() {
		if (this._messageMedia) {
			if (this._messageMedia.className == "MessageMediaPhoto") {
				return ''+this.id+'.jpg';
			} else if (this._messageMedia.document && this._messageMedia.document.attributes) {
				for (let attribute of this._messageMedia.document.attributes) {
					if (attribute.className == "DocumentAttributeFilename") {
						return attribute.fileName;
					}
				}

				const mimeType = this.mimeType;
				if (mimeType == 'video/mp4') {
					return 'video.mp4';
				}
			}
		}

		return 'dat.dat';
	}

	get width() {
		if (this._messageMedia) {
			if (this._messageMedia.className == "MessageMediaPhoto") {
				let w = 0;
				this._messageMedia.photo.sizes.forEach((mSize)=>{
					if (mSize.w && mSize.w > w) {
						w = mSize.w;
					}
				});
				return w;
			} else if (this._messageMedia.document && this._messageMedia.document.attributes) {
				for (let attribute of this._messageMedia.document.attributes) {
					if (attribute.className == "DocumentAttributeVideo") {
						return attribute.w;
					}
				}
			}
		}

		if (this._toBeUploadedFileInfo) {
			return this._toBeUploadedFileInfo.mediaWidth;
		}

		return null;
	}

	get height() {
		if (this._messageMedia) {
			if (this._messageMedia.className == "MessageMediaPhoto") {
				let h = 0;
				this._messageMedia.photo.sizes.forEach((mSize)=>{
					if (mSize.h && mSize.h > h) {
						h = mSize.h;
					}
				});
				return h;
			} else if (this._messageMedia.document && this._messageMedia.document.attributes) {
				for (let attribute of this._messageMedia.document.attributes) {
					if (attribute.className == "DocumentAttributeVideo") {
						return attribute.h;
					}
				}
			}
		}

		if (this._toBeUploadedFileInfo) {
			return this._toBeUploadedFileInfo.mediaHeight;
		}

		return null;
	}

	get ratio() {
		const w = this.width;
		const h = this.height;
		if (w && h) {
			return w/h;
		}
		return null;
	}

	hasHighPreview() {
		if (this._highPreviewBlobURL) {
			return this._highPreviewBlobURL;
		}
		return false;
	}

	async setResponseAsHighPreview(response) {
		const blob = await response.blob();
		this._highPreviewBlob = blob;
		await this.getHighPreview();
	}

	async getHighPreview() {
		if (this._highPreviewBlobURL) {
			return this._highPreviewBlobURL;
		}

		if (!this._highPreviewBlob) {
			if (this._gettingHighPreviewPromise) {
				await this._gettingHighPreviewPromise;
			} else {

				this._gettingHighPreviewPromiseResolver = null;
				this._gettingHighPreviewPromise = new Promise((res)=>{
					this._gettingHighPreviewPromiseResolver = res;
				});

				if (this._messageMedia) {
					// media from telegram

					let thumbSize = 'm';

					if (this._messageMedia.document) {
						let foundM = false;
						this._messageMedia.document.thumbs.forEach((size)=>{
							if (size.type == thumbSize) {
								foundM = true;
							}
						});
						if (!foundM) {
							thumbSize = 's';
						}
					}

					let buffer = null;
					buffer = await this.provider.downloadMedia({
						entity: this._messageMedia,
						downloadParams: {
							thumb: thumbSize,
						}
					});

					this._highPreviewBlob = new Blob([buffer], { type: "image/jpeg" });
					FileCacher.putBlob(this.previewCacheURL, this._highPreviewBlob); // no await?
				} else if (this._toBeUploadedFileInfo) {
					// local media

					this._highPreviewBlob = await this._toBeUploadedFileInfo.getPreviewBlob();
				}


				this._gettingHighPreviewPromiseResolver();
			}
		}

		if (this._highPreviewBlob && !this._highPreviewBlobURL) {
			this._highPreviewBlobURL = URL.createObjectURL(this._highPreviewBlob);
			this.dispatchEvent(new CustomEvent('preview', { detail: {preview: this._highPreviewBlobURL} }));
		}

		return this._highPreviewBlobURL;
	}

	getLowPreview() {
		if (this._lowPreview) {
			return this._lowPreview;
		}

		let stripedBytes = null;

		if (this._messageMedia) {
			if (this._messageMedia.photo && this._messageMedia.photo.sizes) {
				this._messageMedia.photo.sizes.forEach((size)=>{
					if (size.className == "PhotoStrippedSize") {
						stripedBytes = size.bytes;
					}
				});
			}
			if (this._messageMedia.document && this._messageMedia.document.thumbs) {
				this._messageMedia.document.thumbs.forEach((size)=>{
					if (size.className == "PhotoStrippedSize") {
						stripedBytes = size.bytes;
					}
				});
			}
		}

		if (stripedBytes) {
			const decoded = this.provider.decodeStrippedPhoto(stripedBytes);
			let binary = '';
			for (let i = 0; i < decoded.byteLength; i++) {
				binary += String.fromCharCode(decoded[i]);
			}
			const b64 = btoa(binary);

			this._lowPreview = 'data:image/png;base64,'+b64;

			return this._lowPreview;
		} else if (this._toBeUploadedFileInfo && this._toBeUploadedFileInfo.lowPreview) {
			this._lowPreview = this._toBeUploadedFileInfo.lowPreview;

			return this._lowPreview;
		}

		return null;

		// console.log(this._messageMedia);
	}

	isSeekable() {
		if (this._messageMedia.className == 'MessageMediaDocument') {
			return true;
		}

		return false;
	}

	// async uploadEncoded(containerBlob) {
	// 	if (!this._isToBeUploaded) {
	// 		return false;
	// 	}

	// 	const mp4Steg = await window.newMP4Steg();
	// 	console.error('mp4Steg', mp4Steg);

	// 	const randomKey = window.crypto.getRandomValues(new Uint8Array(32));

	// 	mp4Steg.setKey(randomKey);

	// 	await mp4Steg.loadFile({file: containerBlob});

	// 	console.error(mp4Steg._atoms);

	// 	const id = (''+Math.random()).split('0.').join('');

	// 	const meta = {

	// 	};

	// 	await mp4Steg.embedFile({file: this._toBeUploadedFileInfo.file, meta: {id: id, meta:meta}});

	// 	const writable = await mp4Steg.embed();
	// 	const blob = await writable.toBlob();
	// 	// console.error(writable);

	// 	const fileToSwitch = new window.File([blob], ''+id+'.mp4', {
	// 		lastModified: Date.now(),
	// 		type: 'video/mp4',
	// 	});

	// 	return await this.upload(fileToSwitch);
	// }

	async upload(options) {
		console.error('options', options);

		const thumbToSwitch = options.thumbToSwitch || options.thumb || null;
		const fileToSwitch = options.fileToSwitch || options.file || null;
		const width = options.width || null;
		const height = options.height || null;
		const duration = options.duration || null;

		if (!this._isToBeUploaded) {
			return false;
		}

		if (this._toBeUploadedFileInfo) {
			const fileId = Math.random();

			this.dispatchEvent(new CustomEvent('progress', { detail: {progress: 0} }));
			const progressListener = (event) => {
				if (event.detail && event.detail.fileId && event.detail.fileId == fileId) {
					this.dispatchEvent(new CustomEvent('progress', { detail: {progress: event.detail.progress} }));
				}
			};

			this.provider.addEventListener('progress', progressListener);


			let uploadedThumbFileId = null;
			const thisType = await this.getType();

			if (thisType == 'video') {
				// we have to upload thumb for it
				if (thumbToSwitch) {
					this._highPreviewBlob = thumbToSwitch;
				}
				if (this._highPreviewBlob) {
					const thumbAb = await this._highPreviewBlob.arrayBuffer();
					const success = await this.provider.endFile({
						fileId: 'thumb_'+fileId,
						bytes: thumbAb,
						fileName: 'image.png',
					});

					if (success) {
						uploadedThumbFileId = 'thumb_'+fileId;
					}
				}
			} else if (thisType == 'photo') {
				if (thumbToSwitch) {
					this._highPreviewBlob = thumbToSwitch;
				}
			}

			let ab = null;
			if (fileToSwitch) {
				ab = await fileToSwitch.arrayBuffer();
			} else {
				ab = await this._toBeUploadedFileInfo.getAsArrayBuffer();
			}

			let fileName = null;
			if (fileToSwitch) {
				fileName = fileToSwitch.name;
			} else {
				fileName = this._toBeUploadedFileInfo.fileName;
			}

			// const totalSize = await this._toBeUploadedFileInfo.getSize();
			// const ab = await this._toBeUploadedFileInfo.getAsArrayBuffer();

			// await this.provider.writeFile({
			// 	fileId: fileId,
			// 	bytes: ab,
			// 	// totalSize: totalSize,
			// });


			const message = await this.provider.endFile({
				fileId: fileId,
				bytes: ab,
				fileName: fileName,
				destination: this._folder.id,
				thumb: uploadedThumbFileId,
				send: true,
				width: width,
				height: height,
				duration: duration,
			});

			this.dispatchEvent(new CustomEvent('progress', { detail: {progress: 100} }));
			console.error('message', message);
			if (message && message.media) {
				const oldId = this.id;

				this._message = message;
				this._messageMedia = message.media;

				this._id = null;
				this._isToBeUploaded = false;

				if (this._folder && this._folder.updateOldFileId) {
					this._folder.updateOldFileId(oldId, this);
				}
			}

			this.provider.removeEventListener('progress', progressListener);
			console.error('this', this);
		}
	}

	async download() {
        const fileSize = await this.size();
        const chunk = await this.getSlice(0, fileSize);

		const blob = new Blob([chunk], {type: this.mimeType });

		let blobUrl = window.URL.createObjectURL(blob);
		let link = document.createElement("a");
		link.href = blobUrl;

		link.download = this.fileName;

		document.body.appendChild(link);
		link.innerHTML = "download";
		link.style.display = 'none';
		link.click();

		link.remove();

		window.URL.revokeObjectURL(blobUrl);
	}

	hasChunksFor(offset, length) {
		const minChunkSize = 512 * 1024;

		const downloadFrom = Math.floor(offset / minChunkSize) * minChunkSize;
		const downloadSize = Math.ceil((length) / minChunkSize) * minChunkSize;

		for (let i = downloadFrom; i <= (downloadFrom + downloadSize); i+= minChunkSize) {
			if (!this._downloadedChunks[''+i]) {
				return false;
			}
		}

		return true;
	}

	async getSlice(offset, length) {
		const minChunkSize = 512 * 1024;

		const downloadFrom = Math.floor(offset / minChunkSize) * minChunkSize;
		const downloadSize = Math.ceil((length) / minChunkSize) * minChunkSize;

		if (!this.hasChunksFor(offset, length)) {

			// const params = {
			// 	offset: bigInt(downloadFrom),
			// 	limit: bigInt(downloadSize),
			// 	requestSize: bigInt(downloadSize),
			// 	file: this._messageMedia,
			// 	chunkSize: minChunkSize,
			// };

			const promises = [];

			for (let i = downloadFrom; i <= downloadFrom + downloadSize; i += minChunkSize) {

				if (!this.hasChunksFor(i, minChunkSize)) {
					const promise = new Promise((res)=>{
						this.provider.downloadFile({
							entity: this._messageMedia,
							offset: bigInt(i),
							limit: bigInt(minChunkSize),
							message: this._message.id,
							folder: this._folder.id,
						})
						.then((chunk)=>{
							this._downloadedChunks[''+i] = Buffer(chunk);
							res();
						});
					});

					promises.push(promise);
				}

			}

			await Promise.all(promises);

			// let chunkIndex = downloadFrom;
			// for (let i = 0; i < bytes.length; i += minChunkSize) {
			// 	const chunk = bytes.slice(i, i + minChunkSize);

			// 	this._downloadedChunks[''+chunkIndex] = Buffer(chunk);
			// 	console.error('Got chunk', chunkIndex);
			// 	chunkIndex += minChunkSize;
			// }

			// const downloader = await this.client.iterDownload(params);

			// let chunkIndex = downloadFrom;
			// for await (const downloaded of downloader){
			// 	this._downloadedChunks[''+chunkIndex] = downloaded;
			// 	console.error('Got chunk', chunkIndex);
			// 	chunkIndex += minChunkSize;

			// 	if (this.hasChunksFor(offset, length)) {
			// 		break;
			// 	}
			// }

		}

		let data = Buffer.alloc(0);
		let nothingMore = false;
		// for (let i = offset; i < (offset + length); i+= minChunkSize) {
		for (let i = offset; data.length < length && !nothingMore; i+= minChunkSize) {
			const chunkIndex = Math.floor(i / minChunkSize) * minChunkSize;
			// console.error('ch', chunkIndex);
			let offsetInChunk = 0;

			if (this._downloadedChunks[''+chunkIndex]) {
				if (i == offset) {
					// first chunk
					offsetInChunk = offset % minChunkSize;
				// console.error('offsetInChunk', offsetInChunk, this._downloadedChunks[''+chunkIndex].slice(offsetInChunk));
					data = Buffer.concat([data, this._downloadedChunks[''+chunkIndex].slice(offsetInChunk)]);
				// console.error('data', data);
				} else {
					data = Buffer.concat([data, this._downloadedChunks[''+chunkIndex]]);
				// console.error('data', data);
				}
			} else {
				nothingMore = true;
			}
		}

		return data.slice(0, length);
	}

	async size() {
		if (this._messageMedia) {
			if (this._messageMedia.className == 'MessageMediaDocument') {
				return Number(this._messageMedia.document.size);
			} else if (this._messageMedia.className == 'MessageMediaPhoto') {
				let size = 0;
				this._messageMedia.photo.sizes.forEach((mSize)=>{
					if (mSize.size && mSize.size > size) {
						size = mSize.size;
					} else if (mSize.sizes && mSize.sizes.length) {
						// "PhotoSizeProgressive"
						mSize.sizes.forEach((mmSize)=>{
							if (mmSize > size) {
								size = mmSize;
							}
						});
					}
				});

				return size;
			}
		}

		if (this._toBeUploadedFileInfo) {
			return await this._toBeUploadedFileInfo.getSize();
		}

		return null;
	}
}
