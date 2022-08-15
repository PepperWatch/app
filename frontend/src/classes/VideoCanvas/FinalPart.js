const { AwesomeQR } = require("awesome-qr");

export default class FinalPart {
	constructor() {
		this.sampleWidth = 720;
		this.sampleHeight = 720;
	}

	log(str) {
		console.log('FinalPart | ', str);
	}

	async generate({originalWidth = null, originalHeight = null, originalDuration = null, originalHash = null} = {}) {

		let watchURL = 'https://pepperwatch.com/';
		if (originalHash) {
			watchURL = 'https://pepperwatch.com/v/'+originalHash;
		}

		const qr = new AwesomeQR({
				text: watchURL,
				size: 500,
			// backgroundImage: background,
			});

		const dataURL = await qr.draw();
		const blob = this.b64toBlob(dataURL.split(',')[1], 'image/png');

		const blobUrl = URL.createObjectURL(blob);

		console.log(blobUrl);

		console.log(dataURL);

		await this.createCanvas();

		// fill canvas with solid color
		this._ctx.fillStyle = "black";
		this._ctx.fillRect(0, 0, this.sampleWidth, this.sampleHeight);

		// draw qr-code in the middle of the canvas
		// var image = arrPhoto[currentIndex];
		const image = new Image();
		await new Promise((res)=>{
			image.onload = ()=>{
				res();
			};
			image.src = blobUrl;
		});

		this._ctx.drawImage(image,
			this.sampleWidth / 2 - image.width / 2,
			this.sampleHeight / 2 - image.height / 2
		);

		// draw the text
		this._ctx.fillStyle = "white";
		this._ctx.font = '30px sans-serif';

		// line 1
		this._ctx.textAlign = 'center';
		this._ctx.textBaseline = 'bottom';
		const atY1 = this.sampleHeight / 2 - image.height / 2;
		this._ctx.fillText('Watch the full video at', this.sampleWidth / 2, atY1);

		// line 2
		this._ctx.textAlign = 'center';
		this._ctx.textBaseline = 'top';
		const atY2 = this.sampleHeight / 2 + image.height / 2;

		let dimsText = '';
		if (originalHeight && originalWidth) {
			dimsText = ''+originalWidth+'x'+originalHeight;
		}

		if (originalDuration) {
			dimsText += ', '+this.durationToText(originalDuration);
		}

		this._ctx.fillText(dimsText, this.sampleWidth / 2, atY2);

		const url = this._canvas.toDataURL("image/png");
		const finalBlob = this.b64toBlob(url.split(',')[1], 'image/png');

		const ab = await finalBlob.arrayBuffer();


		return ab;
	}

	durationToText(duration) {
		const seconds = Math.ceil(duration);
		if (seconds < 60) {
			return ''+seconds+' second'+(seconds != 1 ? 's' : '');
		} else {
			const minutes = Math.round(seconds / 60);

			if (minutes < 60) {
				return ''+minutes+' minute'+(minutes != 1 ? 's' : '');
			} else {
				const hours = Math.round(minutes / 60);
				return ''+hours+' hour'+(hours != 1 ? 's' : '');
			}
		}
	}

	b64toBlob(b64Data, contentType='', sliceSize=512) {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, {type: contentType});
		return blob;
	}

	async createCanvas() {
		let canvasDomId = 'TheFinalCanvas';
		let canvas = document.querySelector('#'+canvasDomId);

		if (canvas) {
			if (this._canvasInitializedOnWidth != this.sampleWidth || this._canvasInitializedOnHeight != this.sampleHeight) {
				// dimension changed, we need to re-create the canvas
				// @todo: maybe changing dims enough?
				this.log('adjusting the canvas...');
				canvas.remove();
				canvas = null;
			} else {
				this.log('re-using the canvas');
			}
		}

		if (!canvas) {
			this.log('creating the canvas...');

			canvas = document.createElement('canvas');

			canvas.id = canvasDomId;
			canvas.width = this.sampleWidth;
			canvas.height = this.sampleHeight;

			this._canvasInitializedOnWidth = this.sampleWidth;
			this._canvasInitializedOnHeight = this.sampleHeight;

			canvas.style.zIndex = 8;
			canvas.style.display = 'none';
			canvas.style.position = "absolute";
			canvas.style.border = "1px solid";
			canvas.style.top = "0px";
			document.getElementsByTagName("body")[0].appendChild(canvas);

			this.log('the canvas created.');
		}

		this._canvas = canvas;
		this._ctx = this._canvas.getContext( '2d' );
	}
}