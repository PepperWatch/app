// const FFMPEG = require('./FFMPEG.js');
// const ffmpeg = new FFMPEG();

// import MP4Encoder from './MP4Encoder.js';
// import UserFile from './UserFile.js';
// import VideoTask from './VideoTasks/VideoTask.js';

export default class MediaDownsample {
	constructor({blob}) {
		Object.assign(this, {blob});

		if (!this.blob) {
			throw new Error('blob is requried for downsampling');
		}

		this.originalWidth = null;
		this.originalHeight = null;
		this.originalDuration = null;

		this.sampleWidth = null;
		this.sampleHeight = null;
		this.maxSampleDimension = 900;

		this.blurValue = 0.01;
		this.blurFadeValue = 20;
		this.blurFadeDuration = 500;
		this.adjustedBlurFadeDuration = null; // blur fade duration adjusted for each video creation with respect to it's length

		this.blobURL = null;

		this._recordedChunks = [];
		this._recordedBlob = null;

		this._finalBlob = null;

		this._screenshots = {};
	}

	async free() {
		if (this._source) {
			this._source.src = '';
			this._source.load();
		}

		if (this._hiddenPlayer) {
			this._hiddenPlayer.src = '';
			// this._hiddenPlayer.srcObject = '';
			this._hiddenPlayer.load();
		}

		if (this.blobURL) {
			URL.revokeObjectURL(this.blobURL);
		}
	}

	log(str) {
		console.log('Downsample | ', str);
	}

	async getScreenShotBlob(timeInSeconds) {
		timeInSeconds = Math.round(timeInSeconds / 0.01) * 0.01; // snap to 0.01 seconds

		await this.prepare();

		await this.seekToTime(timeInSeconds);
		await new Promise((res)=> setTimeout(res, 100)); // @todo: wait for 'seeked'

		return await new Promise((res,rej)=>{
			try {
				this._canvas.toBlob(function(blob) {
					res(blob);
				}, 'image/png');
			} catch(e) {
				rej();
			}
		});
	}

	async getScreenShotURL(timeInSeconds) {
		timeInSeconds = Math.round(timeInSeconds / 0.1) * 0.1; // snap to 0.1 seconds
		if (this._screenshots[''+timeInSeconds]) {
			return this._screenshots[''+timeInSeconds];
		}
		console.log('rendering '+timeInSeconds);

		await this.prepare();

		await this.seekToTime(timeInSeconds);
		await new Promise((res)=> setTimeout(res, 100)); // @todo: wait for 'seeked'

		const url = this._canvas.toDataURL("image/png");
		this._screenshots[''+timeInSeconds] = url;

		return url;
	}

	// async trimVideoWithBlur(fromSeconds, toSeconds) {

	// }

	async setBlurSettings(blurValue, blurFadeValue, blurFadeDuration) {
		this.blurValue = blurValue;
		this.blurFadeValue = blurFadeValue;
		this.blurFadeDuration = blurFadeDuration;

		this._screenshots = {};
	}

	async setMaxDimension(value) {
		this.maxSampleDimension = value;
		await this.createCanvas();
		this.recalcPositions();
	}

	async prepare() {
		if (this._preparePromise) {
			return await this._preparePromise;
		}

		this._preparePromiseResolver = null;
		this._preparePromise = new Promise((res)=>{
			this._preparePromiseResolver = res;
		});

		await this.prepareTheSourceVideo();
		await this.createCanvas();
		await this.prepareBlobForCanvas();

		this._preparePromiseResolver();
	}

	async generateDownsampledVideoAndGetBlob(fromTime, toTime) {
		const encoded = await this.generateDownsamledVideo(fromTime, toTime);

		this._finalBlob = new Blob([encoded], { type: "video/mp4" });

		return this._finalBlob;
	}

	async generateDownsampledVideo(fromTime, toTime) {
		await this.prepare();

		await this.recordCanvas();

		this._recordedChunks = [];
		this._recordedBlob = null;

		this._finalBlob = null;

		// this._source.pause();
		this._source.play();
		this._source.currentTime = fromTime;
		this._expectedLength = (toTime - fromTime)*1000;

		if (this._expectedLength < this.blurFadeDuration * 2) {
			this.adjustedBlurFadeDuration = this._expectedLength / 2;
		} else {
			this.adjustedBlurFadeDuration = this.blurFadeDuration;
		}


		// this.nextStage('Cutting Video', Math.ceil(this._expectedLength / 1000 * 25));

		await new Promise((res)=>{
			const timeEventHandler = ()=>{
				if (this._source.currentTime >= toTime) {
					// we are done
					this._source.pause();

					this._source.removeEventListener( 'timeupdate', timeEventHandler);


					this.stopRecording()
						.then(()=>{
							res();
						});
				}
			};
			this._source.addEventListener( 'timeupdate', timeEventHandler);
			this._source.play();
		});


		// this.nextStage('Downsampling Video', Math.ceil(this._expectedLength / 1000 * 25));

		// await this.initFFMPEG();

		// this._source.play();

		return this._recordedBlob;

		// return await this.convertToMP4();
	}

	// async getScreenshot() {
	// 	await this.prepare();
	// 	return this._canvas.toDataURL("image/png");
	// }

	async seekToTime(time) {
		await this.prepare();

		this._source.play();
		// this.log('seeking to '+time);
		this._source.currentTime = time;
	}

	// async convertToMP4() {
	// 	this.log('converting to mp4...');

	// 	const arrayBuffer = await this._recordedBlob.arrayBuffer();
	// 	const encoded = await this._mp4Encoder.encode({name: 'test.webm', data: arrayBuffer});
	// 	// var buffer = encoded.MEMFS[0].data;
	// 	// this._finalBlob = new Blob([encoded], { type: "video/mp4" });

	// 	// return this._finalBlob;
	// 	//
	// 	return encoded;
	// 	//
	// 	// console.log("--- Blob ", trimmedVideoBlob);
	// 	// console.log("Triggering download...");
	// 	// this.downloadBlob(trimmedVideoBlob);
	// }

	async createCanvas() {
		let canvasDomId = 'TheCanvas';
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

	recalcPositions() {
		if (this.originalWidth > this.originalHeight) {
			// video is wider
			this.sampleWidth = Math.ceil(this.maxSampleDimension);
			this.sampleHeight = Math.ceil(this.maxSampleDimension * (this.originalHeight / this.originalWidth));
		} else {
			// video is taller
			this.sampleHeight = Math.ceil(this.maxSampleDimension);
			this.sampleWidth = Math.ceil(this.maxSampleDimension * (this.originalWidth / this.originalHeight));
		}


		if (this.sampleHeight % 2 == 1) this.sampleHeight = this.sampleHeight + 1; // getting rid of " width not divisible by 2 " error
		if (this.sampleWidth % 2 == 1) this.sampleWidth = this.sampleWidth + 1; // getting rid of " width not divisible by 2 " error

		this.log('output dimensions set to '+this.sampleWidth+'x'+this.sampleHeight);
	}

	async prepareTheSourceVideo() {
		this.log('Preparing the source video...');

		this.blobURL = window.URL.createObjectURL(this.blob);
		const source = document.createElement( 'video' );

		source.loop = true;
		source.crossOrigin = "anonymous";
		source.muted = true;
		source.src = this.blobURL;

		await new Promise((res)=>{
			source.addEventListener('loadedmetadata', () => {
				this.originalWidth = source.videoWidth;
				this.originalHeight = source.videoHeight;
				this.originalDuration = source.duration;

				this.log('Source video prepared, '+this.originalWidth+'x'+this.originalHeight);

				this.recalcPositions();
				res();
			}, { once: true } );

			this._source = source;
			source.play();
		});


		// return source;
	}


	async prepareBlobForCanvas() {
		// const source = await this.prepareTheSourceVideo();
		const player = document.createElement( 'video' );
		player.muted = true;

		const source = this._source;

		const stream = (source.captureStream && source.captureStream()) || source.mozCaptureStream();

		// let drawAtX = 0;
		// let drawAtY = 0;
		// let drawWidth = this.sampleWidth;
		// let drawHeight = this.sampleHeight;

		const loop = ()=>{
			if (this._ctx) {
				if (this.blurValue) {
					let blurValue = this.blurValue;
					const curTime = (new Date()).getTime();

					if (this._recordStartedAt) {
						// console.log(this.blurFadeDuration, this.blurFadeValue);

						// console.log(k);

						if ( (curTime < this._recordStartedAt + this.adjustedBlurFadeDuration) ) {
							// fade In
							const k = ((curTime - this._recordStartedAt) / this.adjustedBlurFadeDuration);
							const timeFraction = 1 - k;
							const progress = Math.pow(timeFraction, 2);

							const diff = this.blurFadeValue - this.blurValue;

							// // console.log(k);
							blurValue = blurValue + diff * progress;

							// console.log(k, timeFraction, progress, this.adjustedBlurFadeDuration);
						}

						if ( (curTime > this._recordStartedAt + this._expectedLength - this.adjustedBlurFadeDuration) ) {
							let k = ((this._recordStartedAt + this._expectedLength - curTime) / this.adjustedBlurFadeDuration);
							if (k < 0) k = 0;
							const timeFraction = 1 - k;

							const progress = Math.pow(timeFraction, 2);

							const diff = this.blurFadeValue - this.blurValue;

							// // console.log(k);
							blurValue = blurValue + diff * progress;


							// console.log(k);
						}

					}

					blurValue = blurValue.toFixed(2);

					this._ctx.filter = 'blur('+blurValue+'px)';
				}

				this._ctx.drawImage( player, 0, 0, this.sampleWidth, this.sampleHeight );

				// this._ctx.font = '48px serif';
				// this._ctx.fillStyle = "#ff0000";  //<======= here
				// this._ctx.fillText('test draw', 50, 50);

			}

			// if( !source.paused ) {
				requestAnimationFrame(loop);
			// }
		};


		await new Promise((res)=>{

			player.addEventListener( 'loadedmetadata', () => {
				requestAnimationFrame( loop );

				res();
			}, { once: true } );

			player.srcObject = stream;
			player.play();

		});

		this._hiddenPlayer = player;
	}

	async recordCanvas() {
		let time = 0;
		const stream = this._canvas.captureStream(25);

		this._mediaRecorder = new MediaRecorder(stream, {
			mimeType: "video/webm;codecs=vp8"
		});

		this._mediaRecorder.start(time);
		this._recordStartedAt = (new Date()).getTime();

		this._mediaRecorder.ondataavailable = (e)=>{
			this._recordedChunks.push(e.data);
			// for demo, removed stop() call to capture more than one frame
		};

		// this._mediaRecorder.onstop = ()=>{
		// 	var blob = new Blob(this._recordedChunks, {
		// 		"type": "video/webm",
		// 	});

		// 	this._recordedBlob = blob;
		// 	this.log('recorded blob');

		// 	// this.convertToMP4();

		// 	// this.downloadBlob(blob);
		// 	// var url = URL.createObjectURL(blob);
		// }
	}

	async stopRecording() {
		await new Promise((res)=>{
			this._mediaRecorder.onstop = ()=>{
				const blob = new Blob(this._recordedChunks, {
					"type": "video/webm",
				});

				this._recordedBlob = blob;
				this.log('recorded blob');

				this._recordStartedAt = null;
				this._source.pause();

				res();
			}
			this._mediaRecorder.stop();
		});

		// @todo: remove listeners?
		this._mediaRecorder = null;
	}
}