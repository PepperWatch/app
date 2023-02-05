import Folder from './Folder.js';
import FileCacher from './FileCacher.js';
import TelegramServiceWorkerHandler from './TelegramServiceWorkerHandler.js';
import CommonTelegramMethods from './CommonTelegramMethods.js';

export default class Drive extends CommonTelegramMethods {
	constructor() {
		super();

		this._provider = null;
		this._folders = [];
		this._foldersIds = {};

		this._foldersFetched = false;

		this._loadedAllFolders = false;
		this._loadingMore = false;

		this._minLoadedDate = Infinity;

		this._telegramFiles = [];
		this._telegramFilesIds = {};
		this._telegramFileHandler = (e) => {
			const telegramFile = e.detail.file;

			if (!this._telegramFilesIds[''+telegramFile.id]) {
				this._telegramFilesIds[''+telegramFile.id] = telegramFile;
				this._telegramFiles.push(telegramFile);
			}
		};

		this._debug = true;
	}

	/**
	 * Called after telegramFile upload, to update generated telegram file id with the one returned by telegram servers
	 * @param  {[type]} oldId        [description]
	 * @param  {[type]} telegramFile [description]
	 * @return {[type]}              [description]
	 */
	updateOldFileId(oldId, telegramFile) {
		this._telegramFilesIds[''+telegramFile.id] = telegramFile;
	}

	async registerServiceWorker() {
		const swHandler = new TelegramServiceWorkerHandler({
			drive: this,
		});
		await swHandler.initialize();
	}

	getFileById(id) {
		if (this._telegramFilesIds[''+id]) {
			return this._telegramFilesIds[''+id];
		}

		return null;
	}

	getFolderById(id) {
		if (this._foldersIds[''+id]) {
			return this._foldersIds[''+id];
		}

		return null;
	}

	get folders() {
		return this._folders;
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

	setProvider(provider) {
		this._provider = provider;
		// if (provider && !this._foldersFetched) {
		// 	this.fetchMoreFolders();
		// }
	}

	async fetchMoreFolders(maxLoadCount = 100) {
		this._foldersFetched = true;

		if (this._loadingMore || this._loadedAllFolders) {
			return false;
		}

		this._loadingMore = true;

		const params = {
			limit: maxLoadCount,
		};
		if (this._minLoadedDate && this._minLoadedDate !== Infinity) {
			params.offsetDate = this._minLoadedDate;
		}

		const dialogs = await this.provider.getDialogs(params);

		if (!dialogs.length) {
			this._loadedAllFolders = true;
			this.dispatchEvent(new CustomEvent('end'));
		}

		let loadedInThisBatch = 0;
		for (const dialog of dialogs){
			if (loadedInThisBatch >= maxLoadCount) {
				break;
			}

			if (dialog.message.date < this._minLoadedDate) {
				this._minLoadedDate = dialog.message.date;
			}

			if (!this._foldersIds[''+dialog.id]) {
				const folder = new Folder({
					dialog: dialog,
					provider: this.provider,
					drive: this,
				});
				this._foldersIds[''+dialog.id] = folder;
				this._folders.push(folder);

				folder.addEventListener('file', this._telegramFileHandler);

				this.dispatchEvent(new CustomEvent('folder', { detail: {folder: folder} }));
				loadedInThisBatch++;
			}
		}

		this.log('Folders loaded', loadedInThisBatch, this._foldersIds);

		this._loadingMore = false;

		return true;
	}

	/**
	 * Restoring previews from IndexedDB. Doing this in bulk is much faster than one by one
	 * @return {[type]} [description]
	 */
	async restoreFilePreviewsFromCache() {
		const urls = [];
		const matchedFolders = [];
		this._folders.forEach((folder)=>{
			if (!folder.hasHighPreview()) {
				urls.push(folder.previewCacheURL);
				matchedFolders.push(folder);
			}
		});

		const matched = await FileCacher.matchAll(urls);

		for (let i = 0; i < matched.length; i++) {
			if (matched[i] && matchedFolders[i]) {
				// found the cache
				matchedFolders[i].setResponseAsHighPreview(matched[i][1]);
			}
		}
	}
}