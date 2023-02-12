export default class LocalFileInformation {
	constructor(file) {
		this._file = file;
		this._filename = file.name;

		const re = /(?:\.([^.]+))?$/;
		this._extension = (''+re.exec(this._filename)[1]).toLowerCase();

		const photoExts = ['png', 'jpg', 'jpeg'];
		const videoExts = ['mp4', 'mpeg', 'avi', 'mov', 'webm'];

		this._type = null;
		if (photoExts.indexOf(this._extension) !== -1) {
			this._type =  'photo';
		} else if (videoExts.indexOf(this._extension) !== -1) {
			this._type =  'video';
		}

		this.mediaWidth = 0;
		this.mediaHeight = 0;
		this.mediaDuration = 0;
		this.meta = '';

		this.previewThumbBlob = null;
		this._lowPreview = null;

		this._fileAb = null;
	}

	async getAsArrayBuffer() {
		if (this._fileAb) {
			return this._fileAb;
		}

		this._fileAb = await this._file.arrayBuffer();

		return this._fileAb;
	}

	get file() {
		return this._file;
	}

	get fileName() {
		return this._filename;
	}

	get lowPreview() {
		return this._lowPreview;
	}

	async getType() {
		return this._type;
	}

	async getSize() {
		return this._file.size;
	}

	async getWidth() {
		await this.prepare();
		return this.mediaWidth;
	}

	async getHeight() {
		await this.prepare();
		return this.mediaHeight;
	}

	async getPreviewBlob() {
		await this.prepare();
		return this.previewThumbBlob;
	}

	async prepare() {
		if (this.__preparePromise) {
			return await this.__preparePromise;
		}


		this.__preparePromiseResolver = null;
		this.__preparePromise = new Promise((res)=>{
			this.__preparePromiseResolver = res;
		});

		try {
			if (this._type == 'video') {
				await this.generateVideoPreview();
			} else if (this._type == 'photo') {
				await this.generateImagePreview();
			}
		} catch(e) {
			console.error(e);
		}

		this.__preparePromiseResolver();

		// const thumbURL = URL.createObjectURL(canvasBlob);
	}

	async generateImagePreview() {
		const img = new Image;
		let blobUrl = URL.createObjectURL(this._file);

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

				const canvasDataURL = canvas.toDataURL();
				if (canvasDataURL == blankCanvas.toDataURL()) {
					return rej();
				}

				this._lowPreview = canvasDataURL;

				canvas.toBlob((canvasBlob)=>{
						this.previewThumbBlob = canvasBlob;
						// const thumbURL = URL.createObjectURL(canvasBlob);
						res(this.previewThumbBlob);
					});
			};
			img.onerror = ()=>{
				rej();
			};
			img.src = blobUrl;
		});
	}

	async generateVideoPreview() {
		let video = document.createElement('video');
		let blobUrl = URL.createObjectURL(this._file);

		return await new Promise((res,rej)=>{
			video.addEventListener('error', function(event) {
				console.error(event);

				rej();
			}, true);

			video.onloadeddata = () => {
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

				const canvasDataURL = canvas.toDataURL();
				if (canvasDataURL == blankCanvas.toDataURL()) {
					return rej();
				}

				this._lowPreview = canvasDataURL;

				canvas.toBlob((canvasBlob)=>{
						this.previewThumbBlob = canvasBlob;


						res(this.previewThumbBlob);
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
}