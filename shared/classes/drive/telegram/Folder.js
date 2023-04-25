import TelegramFile from './TelegramFile.js';
import FileCacher from './FileCacher.js';
import CommonTelegramMethods from './CommonTelegramMethods.js';

export default class Folder extends CommonTelegramMethods {
	constructor(params = {}) {
		super();

		this._provider = params.provider;
		this._drive = params.drive;
		this._dialog = params.dialog;

		this._files = [];
		this._filesIds = {};

		this._iterator = null;

		this._minLoadedId = Infinity;
		this._loadedAllFiles = false;


		this._lowPreview = null;
		this._highPreviewBlob = null;
		this._highPreviewBlobURL = null;

		this._debug = true;
	}

	/**
	 * Called after telegramFile upload, to update generated telegram file id with the one returned by telegram servers
	 * @param  {[type]} oldId        [description]
	 * @param  {[type]} telegramFile [description]
	 * @return {[type]}              [description]
	 */
	updateOldFileId(oldId, telegramFile) {
		this._filesIds[''+telegramFile.id] = telegramFile;
		if (this._drive.updateOldFileId) {
			this._drive.updateOldFileId(oldId, telegramFile);
		}
	}

	addTelegramFile(telegramFile) {
		this._filesIds[''+telegramFile.id] = telegramFile;
		this._files.unshift(telegramFile);

		// this.dispatchEvent(new CustomEvent('file', { detail: {file: file} }));

		return telegramFile;
	}

	get files() {
		return this._files;
	}

	get id() {
		return (''+this._dialog.entity.id);
	}

	get provider() {
		return this._provider;
	}

	// get client() {
	// 	if (this.provider && this.provider.client) {
	// 		return this.provider.client;
	// 	}

	// 	return null;
	// }

	get name() {
		return (''+this._dialog.title);
	}

	get previewCacheURL() {
		return ''+this.id+'_preview.jpg';
	}

	hasHighPreview() {
		if (this._highPreviewBlobURL) {
			return this._highPreviewBlobURL;
		}
		return false;
	}

	getAvatarColor() {
		return ((''+this.id).substr(-1) % 8);
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

		if (!this._lowPreview) {
			this.getLowPreview();

			if (!this._lowPreview) {
				return null;
			}
		}

		if (!this._highPreviewBlob) {
			if (this._gettingHighPreviewPromise) {
				await this._gettingHighPreviewPromise;
			} else {
				// console.error('downloading preview for', this.name, this);

				this._gettingHighPreviewPromiseResolver = null;
				this._gettingHighPreviewPromise = new Promise((res)=>{
					this._gettingHighPreviewPromiseResolver = res;
				});

				let buffer = null;
				buffer = await this.provider.downloadProfilePhoto({
					entity: this._dialog.entity,
					fileParams: {
						thumb: 'm',
					},
				});

				if (buffer && buffer.length) {
					this._highPreviewBlob = new Blob([buffer], { type: "image/jpeg" });
					FileCacher.putBlob(this.previewCacheURL, this._highPreviewBlob); // no await?
				} else {
					this._highPreviewBlobURL = this._lowPreview;
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
		if (this._dialog.entity && this._dialog.entity.photo && this._dialog.entity.photo.sizes) {
			this._dialog.entity.photo.sizes.forEach((size)=>{
				if (size.className == "PhotoStrippedSize") {
					stripedBytes = size.bytes;
				}
			});
		}

		if (!stripedBytes && this._dialog.entity && this._dialog.entity.photo && this._dialog.entity.photo.strippedThumb) {
			stripedBytes = this._dialog.entity.photo.strippedThumb;
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
		} else {
			// draw empty image
			const colors = ['ed9482', 'a8db92', 'efd289', '8fbfe9', '9992e4', 'ffa9c3', '8eccdb', 'f7b37c'];
			const colorIndex = this.getAvatarColor();
			if (Folder.__emptyAvatars && Folder.__emptyAvatars[''+colorIndex]) {
				this._lowPreview = Folder.__emptyAvatars[''+colorIndex];
				return Folder.__emptyAvatars[''+colorIndex];
			}

			// draw
			const canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			const ctx = canvas.getContext("2d");
			ctx.fillStyle = "#"+colors[colorIndex];

			ctx.fillRect(0, 0, 1, 1);

			const dataUrl = canvas.toDataURL();
			if (!Folder.__emptyAvatars) {
				Folder.__emptyAvatars = {};
			}
			Folder.__emptyAvatars[''+colorIndex] = dataUrl;

			this._lowPreview = dataUrl;

			return dataUrl;
		}
	}

	isReadable() {
		return true;
	}

	isWritable() {
		if (this._dialog.isGroup || this._dialog.entity.className == 'User') {
			let canUpload = true;
			if (this._dialog.entity && this._dialog.entity.defaultBannedRights && this._dialog.entity.defaultBannedRights.sendMedia) {
				canUpload = false;
			}
			if (this._dialog.entity && this._dialog.entity.bot) {
				canUpload = false;
			}
			if (this._dialog.entity && this._dialog.entity.deleted) {
				canUpload = false;
			}
			if (this._dialog.entity.className == 'ChatForbidden') {
				canUpload = false;
			}

			return canUpload;
		} else if (this._dialog.entity.className == 'Channel' && this._dialog.entity && this._dialog.entity.adminRights && this._dialog.entity.adminRights.postMessages) {
			// channel, where you can post messages
			return true;
		}



		return false;
	}

	async fetchMoreFiles(maxLoadCount = 50) {
		if (this._loadingMore || this._loadedAllFiles) {
			return false;
		}

		this._loadingMore = true;

		const params = {
			limit: maxLoadCount,
			filter: 'InputMessagesFilterPhotoVideo',
		};
		if (this._minLoadedId && this._minLoadedId !== Infinity) {
			params.maxId = this._minLoadedId;
		}

		// console.error(params);

		const messages = await this.provider.getMessages({
			entity: this._dialog.entity,
			params: params,
		});

		// console.error(messages.length);

		if (!messages.length) {
			this._loadedAllFiles = true;
			this.dispatchEvent(new CustomEvent('end'));
		}

		let loadedInThisBatch = 0;
		for (const message of messages){
			if (loadedInThisBatch >= maxLoadCount) {
				break;
			}

			if (message.id < this._minLoadedId) {
				this._minLoadedId = message.id;
			}

			if (message.media && (message.media.document || message.media.photo)) {
				const file = new TelegramFile({
					provider: this.provider,
					drive: this._drive,
					folder: this,
					messageMedia: message.media,
					message: message,
				});

				if (file && file.id && !this._filesIds[''+file.id] && file.ratio) {
					this._filesIds[''+file.id] = file;
					this._files.push(file);

					this.dispatchEvent(new CustomEvent('file', { detail: {file: file} }));
					loadedInThisBatch++;
				}
			}
		}

		this.log('Files loaded', loadedInThisBatch, this._filesIds);

		this._loadingMore = false;

		return true;
	}

	/**
	 * Restoring previews from IndexedDB. Doing this in bulk is much faster than one by one
	 * @return {[type]} [description]
	 */
	async restoreFilePreviewsFromCache() {
		const urls = [];
		const matchedFiles = [];
		this._files.forEach((file)=>{
			if (!file.hasHighPreview()) {
				urls.push(file.previewCacheURL);
				matchedFiles.push(file);
			}
		});

		const matched = await FileCacher.matchAll(urls);

		for (let i = 0; i < matched.length; i++) {
			if (matched[i] && matchedFiles[i]) {
				// found the cache
				matchedFiles[i].setResponseAsHighPreview(matched[i][1]);
			}
		}
		// console.log('matched in cache', matched);
	}


}