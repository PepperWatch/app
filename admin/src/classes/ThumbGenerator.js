

export default class ThumbGenerator {
	constructor() {
		this._blobs = {};
		this._blobURLs = {};
	}

	async getThumbBlob(params = {}) {
		let url = params.url || null;
		const cacheKey = params.cacheKey || params.url || null;
		const maxDim = params.maxDim || 0;

		if (cacheKey && this._blobURLs[cacheKey]) {
			return this._blobURLs[cacheKey];
		}

		let needToRevokeURL = false;
		if (params.file) {
			url = URL.createObjectURL(params.file);
			needToRevokeURL = true;
		}

		if (!url) {
			throw new Error('url parameter is required');
		}
		if (!maxDim) {
			throw new Error('maxDim parameter is required');
		}

		const image = new Image();

		await new Promise((res,rej)=>{
			image.onload = ()=>{
				res();
			};
			image.onerror = ()=>{
				rej();
			};
			image.src = url;
		});

		let width = maxDim;
		let height = maxDim;

		if (image.width > image.height) {
			height = maxDim * (image.height / image.width);
		} else {
			width = maxDim * (image.width / image.height);
		}

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d");

		ctx.drawImage(image, 0, 0, width, height);

		// return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

		const blob = await new Promise((res)=>{
			canvas.toBlob((canvasBlob)=>{
				res(canvasBlob);
			}, 'image/png');
		});

		if (needToRevokeURL) {
			URL.revokeObjectURL(url);
		}

		this._blobs[cacheKey] = blob;
		return blob;

		// const blobURL = window.URL.createObjectURL(blob);

		// this._blobURLs[cacheKey] = blobURL;

		// return blobURL;
	}
}