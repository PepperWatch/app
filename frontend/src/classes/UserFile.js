
// const { MP4, Writable, Readable } = require('mp4steg');
// const { MP4 } = require('mp4steg');

import UserContainer from './UserContainer.js';

export default class UserFile {
	constructor({filename='', size=0, fileSet=null, file=null, url=null, thumbBlob=null, mp4=null, nInMp4=null, meta=''} = {}) {
		Object.assign(this, {filename, size, fileSet, file, url, thumbBlob, mp4, nInMp4, meta});

		this.humanSize = '';

		if (this.file) {
			if (!this.filename) {
				this.filename = this.file.name;
			}
			if (!this.size) {
				this.size = this.file.size;
			}
		}

		if (this.url) {
			if (!this.filename) {
				this.filename = (''+this.url).split(/[\\/]/).pop();
			}
		}

		if (!this.id) {
			this.id = ''+Math.random();
		}

		if (!this.filename) {
			throw new Error('Can not get filename for UserFile');
		}

		const re = /(?:\.([^.]+))?$/;
		this.ext = (''+re.exec(this.filename)[1]).toLowerCase();

		this.composeHumanSize();

		this.mediaWidth = null;
		this.mediaHeight = null;
		this.mediaDuration = null;

		this.blobUrl = null;
		this.thumbURL = null;

		this.isSelected = false;

		this._hash = null;
	}

	log(str) {
		console.log('UserFile | '+str);
	}

	async getMediaWidth() {
		if (!this.mediaWidth) {
			await this.prepare();
		}
		return this.mediaWidth;
	}

	async getMediaHeight() {
		if (!this.mediaHeight) {
			await this.prepare();
		}
		return this.mediaHeight;
	}

	async getMediaDuration() {
		if (!this.mediaDuration) {
			await this.prepare();
		}
		return this.mediaDuration;
	}

	async getThumbBlob() {
		if (this.thumbBlob) {
			return this.thumbBlob;
		}

		await this.prepare();

		return this.thumbBlob;
	}

	getBlobURL() {
		if (this.blobUrl) {
			return this.blobUrl;
		} else {
			this.blobUrl = URL.createObjectURL(this.file);
			return this.blobUrl;
		}
	}

	toContainer() {
		const container = new UserContainer({
			containerUserFile: this,
		});

		return container;
	}

	async hash() {
		if (this._hash !== null) {
			return this._hash;
		}

		const fr = new FileReader();
		fr.readAsArrayBuffer(this.file);

		const hash = await new Promise((res)=>{
			fr.onloadend = function () {
				let hashPromise = crypto.subtle.digest("SHA-256", fr.result);// it outputs a promise
				hashPromise.then((hashBuffer)=>{
						const hashArray = Array.from(new Uint8Array(hashBuffer));
						const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

						res(hashHex);
					});
			};
		});

		this._hash = hash;

		return hash;
	}

	async prepare() {
		if (!this.thumbBlob && (this.file || this.url)) {
			await this.getThumbURL();

			return;
		}
		// if (!this.thumbBlob && this.mp4) {
		// 	await this.getThumbFromMp4();
		// }

	}

	// async getThumbFromMp4() {
	// 	const embedFiles = this.mp4.getEmbedFiles();
	// 	const thisEmbedFile = embedFiles[this.nInMp4];

	// 	if (!thisEmbedFile.meta) {
	// 		return;
	// 	}

	// 	const uniqId = thisEmbedFile.meta.id;

	// 	let i = 0;
	// 	for (let embedFile of embedFiles) {
	// 		if (embedFile.meta && embedFile.meta.thumbnail && embedFile.meta.id == uniqId) {
	// 			// const thumbEmbedFile = embedFile;
	// 			const writable = await this.mp4.extractFile(i);
	// 			const blob = await writable.toBlob();

	// 			this.thumbBlob = blob;
	// 			this.thumbURL = URL.createObjectURL(blob);
	// 			console.error('getThumbFromMp4', uniqId);

	// 			return;
	// 		}
	// 		i++;
	// 	}
	// }

	composeHumanSize() {
		// nice one. https://stackoverflow.com/a/20732091/1119169  thanks Andrew!
		const sizeI = Math.floor( Math.log(this.size) / Math.log(1024) );
		// return ( size / Math.pow(1024, sizeI) ).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
		this.humanSize = ( this.size / Math.pow(1024, sizeI) ).toFixed(0) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
	}

	// select() {
	// 	this.fileSet.select(this);
	// }

	// remove() {
	// 	this.fileSet.remove(this);
	// 	this.cleanUp();
	// }

	async download() {
		let data = this.file;
		if (!data && this.mp4) {
			const writable = await this.mp4.extractFile(this.nInMp4);
			data = await writable.toBlob();
		}

		const response = new Response(data, {'Content-Type': 'video/mp4', 'Content-Disposition': 'attachment'});
		const blob = await response.blob();

		let blobUrl = window.URL.createObjectURL(blob);
		let link = document.createElement("a");
		link.href = blobUrl;
		link.download = this.filename;

		document.body.appendChild(link);
		link.innerHTML = "download";
		link.style.display = 'none';
		link.click();

		link.remove();

		window.URL.revokeObjectURL(blobUrl);
	}

	async fromURL() {
		this.log('creating from url... '+this.url);

		const res = await fetch(this.url);
		// const res = await fetch(this.url, {
		// 		headers: {
		// 			"Content-Type": "application/octet-stream",
		// 		},
		// 		credentials: 'include'
		// 	});
		const blob = await res.blob();

		this.size = blob.size;

		this.composeHumanSize();

		this.log('created from url, size = '+this.humanSize);

		this.file = blob;
	}

	async getThumbURL() {
		if (!this.file && this.url) {
			await this.fromURL();
		}
		if (this.thumbURL) {
			return this.thumbURL;
		}

		this.log('generating preview image...');

		if (!this.file) {
			this.log('no data to use');
			return null;
		}

		const photoExts = ['png', 'jpg', 'jpeg'];
		const videoExts = ['mp4', 'mpeg', 'avi', 'mov', 'webm'];

		if (photoExts.indexOf(this.ext) !== -1) {
			try {
				this.thumbURL = await this.generateImagePreview();
			} catch(e) {
				console.error(e);
			}
			// if (this.file) {
			// 	this.thumbURL = URL.createObjectURL(this.file);
			// }

			// /// generate meta string:

			// const img = new Image;
			// img.onload = ()=>{
			// 	this.mediaWidth = img.width;
			// 	this.mediaHeight = img.height;

			// 	this.meta = ''+img.width+'x'+img.height;
			// };
			// img.src = this.thumbURL;

			// return this.thumbURL;
		} else if (videoExts.indexOf(this.ext) !== -1) {
			let previewURL = null;
			try {
				previewURL = await this.generateVideoPreview();
				this.thumbURL = ''+previewURL;
			} catch(e) {
				this.log('ERROR : '+e);
				console.log(this.file);

				previewURL = null;
			}

			if (this.thumbURL) {
				this.meta = '' + Math.floor(this.mediaDuration / 60) + ':' + ('0' + (this.mediaDuration % 60)).slice(-2);
			}
		}
	}


	async generateImagePreview() {
		const img = new Image;
		let blobUrl = URL.createObjectURL(this.file);

		return await new Promise((res,rej)=>{
			img.onload = ()=>{
				this.mediaWidth = img.width;
				this.mediaHeight = img.height;

				this.meta = ''+img.width+'x'+img.height;

				let canvas = document.createElement('canvas');
				let canvasWidth = (this.mediaWidth > this.mediaHeight) ? 200*(this.mediaWidth / this.mediaHeight) : 200;
				let canvasHeight = (this.mediaWidth > this.mediaHeight) ? 200 : 200*(this.mediaHeight / this.mediaWidth);

				// let canvas = document.createElement('canvas');
				canvas.width = canvasWidth;
				canvas.height = canvasHeight;

				let ctx = canvas.getContext("2d");
				ctx.imageSmoothingEnabled = true;
				ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

				let blankCanvas =  document.createElement('canvas');
				blankCanvas.width = canvasWidth;
				blankCanvas.height = canvasHeight;

				if (canvas.toDataURL() == blankCanvas.toDataURL()) {
					rej();
				}

				canvas.toBlob((canvasBlob)=>{
						this.thumbBlob = canvasBlob;
						const thumbURL = URL.createObjectURL(canvasBlob);
						res(thumbURL);
					});
			};
			img.onerror = ()=>{
				rej();
			};
			img.src = blobUrl;
		});

	}

	async generateVideoPreview() {
		this.log('generating video preview...');

		let video = document.createElement('video');
		let blobUrl = URL.createObjectURL(this.file);

		this.log(blobUrl);

		return await new Promise((res,rej)=>{
			video.addEventListener('error', function(event) {
				console.error(event);

				rej();
			}, true);

			video.onloadeddata = () => {
				this.log('generating video preview, video loaded');

				let width = video.videoWidth;
				let height = video.videoHeight;

				this.mediaWidth = width;
				this.mediaHeight = height;
				this.mediaDuration = video.duration;

				let canvasWidth = (this.mediaWidth > this.mediaHeight) ? 200*(this.mediaWidth / this.mediaHeight) : 200;
				let canvasHeight = (this.mediaWidth > this.mediaHeight) ? 200 : 200*(this.mediaHeight / this.mediaWidth);

				let canvas = document.createElement('canvas');
				canvas.width = canvasWidth;
				canvas.height = canvasHeight;

				let ctx = canvas.getContext("2d");
				ctx.imageSmoothingEnabled = true;
				ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);

				let blankCanvas =  document.createElement('canvas');
				blankCanvas.width = canvasWidth;
				blankCanvas.height = canvasHeight;

				if (canvas.toDataURL() == blankCanvas.toDataURL()) {
					rej();
				}

				canvas.toBlob((canvasBlob)=>{
						this.thumbBlob = canvasBlob;

						const thumbURL = URL.createObjectURL(canvasBlob);

						this.log('generated video preview.');
						res(thumbURL);
					});
			};

			video.preload = 'metadata';
			video.src = blobUrl;
			// Load video in Safari / IE11
			video.muted = true;
			video.playsInline = true;
			video.play();
		});

	}

	cleanUp() {
		if (this.thumbURL) {
			URL.revokeObjectURL(this.thumbURL);
		}
	}
}