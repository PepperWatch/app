import CommonTelegramMethods from './CommonTelegramMethods.js';

export default class TelegramServiceWorkerHandler extends CommonTelegramMethods {
	constructor(params = {}) {
		super();

		this._drive = params.drive || null;
		this._sw = null;
		this._debug = true;
	}

	getScope() {
		let scope = window.location.pathname;
		let scopePaths = scope.split('/');
		if (scopePaths[scopePaths.length - 1].indexOf('.')) { // probably the filename
			scopePaths[scopePaths.length - 1] = '';
		}
		scope = scopePaths.join('/');

		return scope;
	}

	async postMessage(messageBack) {
		let sw = this._sw;
		if (!sw && navigator.serviceWorker && navigator.serviceWorker.controller) {
			sw = navigator.serviceWorker.controller;
		}
		if (!sw) {
			let registrations = await navigator.serviceWorker.getRegistrations();
			if (registrations[0]) {
				sw = registrations[0].active;
			} else {
				console.warn(registrations);
			}
		}
		if (sw) {
			sw.postMessage(messageBack);
		}
	}

	async processMessage(message) {
		const maxReturnRangeSize = 1024 * 1024;

		this.log('message from SW', message);

		if (message.command === 'askfor') {
			let fileId = message.id;
			let contentId = null;
			const promiseId = message.promiseId;
			const pos = message.pos;
			const till = message.till;

			const messageBack = {
				command: 'put',
				promiseId: promiseId,
				id: fileId,
				totalSize: 0,
				binary: null,
				fileName: null,
				mimeType: null,
			};

			if (fileId.indexOf('-')) {
				// asking for encoded file
				contentId = parseInt(''+fileId.split('-')[1], 10);
				fileId = fileId.split('-')[0];
			}

			if (this._drive && this._drive.getFileById(fileId)) {
				const telegramFile = this._drive.getFileById(fileId);

				let fileHandlerToGetDataFrom = telegramFile;
				if (contentId !== null && telegramFile.contentFiles[contentId]) {
					fileHandlerToGetDataFrom = telegramFile.contentFiles[contentId];
				}

				this.log('get data from', fileHandlerToGetDataFrom);

				const fileType = await fileHandlerToGetDataFrom.getType();
				if (fileType === 'video') {
					messageBack.fileName = 'video.mp4';
				} else if (fileType === 'photo') {
					messageBack.fileName = 'photom.jpg';
				}

				const mimeType = fileHandlerToGetDataFrom.mimeType;
				if (mimeType) {
					messageBack.mimeType = mimeType;
				}

				let ab = null;
				if (fileHandlerToGetDataFrom) {
					const fileSize = await fileHandlerToGetDataFrom.size();
					if (pos || till) {
						const offset = pos;
						let length = till ? (till - pos) : (fileSize - pos);
						if (length > maxReturnRangeSize) {
							length = maxReturnRangeSize;
						}

						ab = await fileHandlerToGetDataFrom.getSlice(offset, length);
					} else {
						ab = await fileHandlerToGetDataFrom.getSlice(0, fileSize);
					}
					messageBack.binary = ab;
					messageBack.totalSize = fileSize;
				}

				this.log('message to SW', messageBack);
				this.postMessage(messageBack);
			}
		}
	}

	async initialize() {
		/// below we are cleaning sw promises. This is required (for FF)
		let sw = null;

		if (navigator.serviceWorker) {
			if (navigator.serviceWorker.controller) {
				sw = navigator.serviceWorker.controller;
			}
			if (!sw) {
				let registrations = await navigator.serviceWorker.getRegistrations();
				if (registrations[0]) {
					sw = registrations[0].active;
				} else {
					console.warn(registrations);
				}
			}
		} else {
			alert('https required');
		}

		if (sw) {
			sw.postMessage({ command: 'clean' });
		}

		if (sw) {
			this._sw = sw;

			navigator.serviceWorker.addEventListener('message', event => {
				if (event && event.data) {
					if (event.data.command) {
						this.processMessage(event.data);
					}
				}
			}, false);
		} else {
			const scope = this.getScope();

			this.log('SW scope', scope);

			if('serviceWorker' in navigator) {
				navigator.serviceWorker.register('./service-worker.js', { scope: scope })
					.then((registration)=>{
						this._sw = registration.active;

						this.log('SW registered', registration);

						navigator.serviceWorker.addEventListener('message', event => {
							if (event && event.data) {
								if (event.data.command) {
									this.processMessage(event.data);
								}
							}
						}, false);
					}, /*catch*/ function(error) {
						this.log('SW registration failed', error);
					});
			}
		}
	}
}