import FileCacher from './FileCacher.js';
const bigInt = require("big-integer");

export default class FileToUpload extends EventTarget {
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
				const MP4Steg = await window.newMP4Steg();
				console.error('MP4Steg', MP4Steg);
				return 'video';
			}
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
				console.error('downloading preview for file', this);

				this._gettingHighPreviewPromiseResolver = null;
				this._gettingHighPreviewPromise = new Promise((res)=>{
					this._gettingHighPreviewPromiseResolver = res;
				});

				let buffer = null;
				buffer = await this.client.downloadMedia(this._messageMedia, {thumb: 'm'});

				console.log('got buffer', buffer);

				this._highPreviewBlob = new Blob([buffer], { type: "image/jpeg" });
				console.log('putting to cache', this.previewCacheURL, this._highPreviewBlob);
				FileCacher.putBlob(this.previewCacheURL, this._highPreviewBlob); // no await?

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

		if (stripedBytes) {
			const decoded = this.provider.decodeStrippedPhoto(stripedBytes);
			let binary = '';
			for (let i = 0; i < decoded.byteLength; i++) {
				binary += String.fromCharCode(decoded[i]);
			}
			const b64 = btoa(binary);

			this._lowPreview = 'data:image/png;base64,'+b64;

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

		for (let i = downloadFrom; i < (downloadFrom + downloadSize); i+= minChunkSize) {
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

			const params = {
				offset: bigInt(downloadFrom),
				limit: bigInt(downloadSize),
				requestSize: bigInt(downloadSize),
				file: this._messageMedia,
				chunkSize: minChunkSize,
			};

			const downloader = await this.client.iterDownload(params);

			let chunkIndex = downloadFrom;
			for await (const downloaded of downloader){
				this._downloadedChunks[''+chunkIndex] = downloaded;
				console.error('Got chunk', chunkIndex);
				chunkIndex += minChunkSize;

				if (this.hasChunksFor(offset, length)) {
					break;
				}
			}

		}

		let data = Buffer.alloc(0);
		for (let i = offset; i < (offset + length); i+= minChunkSize) {
			const chunkIndex = Math.floor(i / minChunkSize) * minChunkSize;
			console.error('ch', chunkIndex);
			let offsetInChunk = 0;
			if (i == offset) {
				// first chunk
				offsetInChunk = offset % minChunkSize;
			console.error('offsetInChunk', offsetInChunk, this._downloadedChunks[''+chunkIndex].slice(offsetInChunk));
				data = Buffer.concat([data, this._downloadedChunks[''+chunkIndex].slice(offsetInChunk)]);
			console.error('data', data);
			} else {
				data = Buffer.concat([data, this._downloadedChunks[''+chunkIndex]]);
			console.error('data', data);
			}
		}


		return data.slice(0, length);
	}

	async size() {
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

		return null;
	}
}
