import VideoTask from './VideoTasks/VideoTask.js';
import VideoCanvas from './VideoCanvas/VideoCanvas.js';
import MP4Encoder from './MP4Encoder.js';
import FinalPart from './VideoCanvas/FinalPart.js';

export default class VideoProcessor {
	constructor({file}) {
		Object.assign(this, {file});

		if (!this.file) {
			throw new Error('file is requried for downsampling');
		}

		this.blurValue = 0.01;
		this.blurFadeValue = 20;
		this.blurFadeDuration = 500;

		this._videoCanvas = null;

		this._introLengthInFrames = 75;
		this._outtroLengthInFrames = 25;
	}

	async free() {
		if (this._videoCanvas) {
			await this._videoCanvas.free();
		}
	}

	get sampleWidth() { return this._videoCanvas.sampleWidth; }
	get sampleHeight() { return this._videoCanvas.sampleHeight; }
	get originalWidth() { return this._videoCanvas.originalWidth; }
	get originalHeight() { return this._videoCanvas.originalHeight; }
	get originalDuration() { return this._videoCanvas.originalDuration; }

	log(str) {
		console.log('VideoProcessor | ', str);
	}

	async getOriginalHash() {
		return await this.userFile.hash();
	}

	async getScreenShotBlob(timeInSeconds) {
		await this.prepare();
		return await this._videoCanvas.getScreenShotBlob(timeInSeconds);
	}

	async getScreenShotURL(timeInSeconds) {
		await this.prepare();
		return await this._videoCanvas.getScreenShotURL(timeInSeconds);
	}

	async raw() {
		await this.prepare();

		return this.blob;
	}

	async getEmptyAudioBlob() {
		const res = await fetch('/silent.mp3');
		const blob = await res.blob();

		return blob;
	}

	async makePreview(params) {
		const appendOuttro = params.appendOuttro || false;

		if (params.blurValue) {
			this.blurValue = params.blurValue;
		}

		this.expectedStages(5);

		this.nextStage('Preparing');
		await this.prepare();
		// const expectedLength = toSeconds - fromSeconds;
		// const expectedFrames = Math.ceil(expectedLength * 25);

		// this.nextStage('Cutting the video', expectedFrames);
		let trimmed = await this.downsampleVideo(params);

		if (!appendOuttro) {
			return await trimmed.asBlob();
		}

		const outtro = await this.getFinalPart();
		await trimmed.executeOver('merge', {withVideo: outtro});

		return await trimmed.asBlob();

		// const introFile = new UserFile({url: '/intro.mp4'});

		// this.nextStage('Loading the intro');
		// await introFile.prepare();

		// this.nextStage('Scaling the intro', this._introLengthInFrames);
		// let intro = await VideoTask.execute('scale', {blob: introFile, toWidth: this.sampleWidth, toHeight: this.sampleHeight});

		// this.nextStage('Final rendering', this._introLengthInFrames + expectedFrames);
		// await intro.executeOver('merge', {withVideo: trimmed, withVideo2: outtro});

		// this.nextStage('Getting results');
		// return await intro.asBlob();
		// await intro.download();
	}

	async downsampleImage(params = {}) {
		const maxVideoDimensions = 480;

		const duration = params.duration;
		const blurValue = params.blurValue || 0;
		const imageFile = this.file;

		const url = window.URL.createObjectURL(imageFile); // @todo: resolve URL after

		const img = await new Promise((resolve, reject) => {
			let img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject();
			img.src = url;
		});

		let imageWidth = img.width;
		let imageHeight = img.height;


		const k = imageWidth / imageHeight;
		if (imageWidth > imageHeight) {
			if (imageWidth > maxVideoDimensions) {
				imageWidth = maxVideoDimensions;
				imageHeight = maxVideoDimensions / k;
			}
		} else {
			if (imageHeight > maxVideoDimensions) {
				imageHeight = maxVideoDimensions;
				imageWidth = maxVideoDimensions * k;
			}
		}

		imageWidth = Math.floor(imageWidth / 2) * 2;
		imageHeight = Math.floor(imageHeight / 2) * 2;

		let canvas = null;
		this.log('creating the canvas to convert image to png...');

		canvas = document.createElement('canvas');

		canvas.id = 'canvas_'+Math.random();
		canvas.width = imageWidth;
		canvas.height = imageHeight;

		canvas.style.zIndex = 8;
		canvas.style.display = 'none';
		canvas.style.position = "absolute";
		canvas.style.border = "1px solid";
		canvas.style.top = "0px";
		document.getElementsByTagName("body")[0].appendChild(canvas);

		this.log('the canvas created.');

		const ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0, imageWidth, imageHeight);

		// Convert canvas to Blob, then Blob to ArrayBuffer.
		const imageAb = await new Promise((res)=>{
			canvas.toBlob((blob) => {
				const reader = new FileReader();
				reader.addEventListener('loadend', () => {
					const arrayBuffer = reader.result;
					res(arrayBuffer);
					// 		bufferByteLen.textContent = arrayBuffer.byteLength + ' bytes.';
					// 		// Dispay Blob content in an Image.
					// 		const blob = new Blob([arrayBuffer], {type: mimeType});
					// imageOut.src = URL.createObjectURL(blob);
				});
				reader.readAsArrayBuffer(blob);
			}, 'image/png');
		});

		const task = await VideoTask.execute('imageVideo', {ab: imageAb, filename: 'image.png', duration: duration, toWidth: imageWidth, toHeight: imageHeight});

		const emptyAudio = await this.getEmptyAudioBlob();
		await task.executeOver('emptyAudio', {emptyAudio: emptyAudio});

		if (blurValue >= 1) {
			await task.executeOver('blur', {radius: blurValue});
		}


		return await task.asBlob();
	}

	async downsampleVideo(params = {}) {
		const fromSeconds = params.fromSeconds;
		let toSeconds = params.toSeconds;
		const blurValue = params.blurValue;

		if (toSeconds - fromSeconds > 2) {
			toSeconds = fromSeconds + 2; // force max length to 2 seconds to keep it not too slow
		}

		await this.prepare();

		const expectedLength = toSeconds - fromSeconds;
		const expectedFrames = Math.ceil(expectedLength * 25);

		const beforeExpectedStages = this.expectedStages();
		this.expectedStages(beforeExpectedStages + 3);
		// try to downsample with worker
		let trimmed = null;
		try {
			if (!trimmed) {
				throw new Error('test');
			}
			// if (!trimmed) throw new Error(''); // testing the canvas rendering

			this.nextStage('Cutting the video', expectedFrames);
			trimmed = await VideoTask.execute('trim', {blob: this.file, fromSeconds, toSeconds});
			this.nextStage('Scaling the video', expectedFrames);
			await trimmed.executeOver('scale', {toWidth: this.sampleWidth, toHeight: this.sampleHeight});
			this.nextStage('Bluring the video', expectedFrames);

			if (this.blurValue >= 1) {
				await trimmed.executeOver('blur', {radius: this.blurValue});
			}
		} catch(e) {
			console.error(e);


			// try to downsample with canvas
			console.error('method 2');

			this.expectedStages(beforeExpectedStages + 3);

			this.nextStage('Cutting the video', expectedFrames);

			this._videoCanvas.setBlurSettings(blurValue);
			const blob = await this._videoCanvas.generateDownsampledVideo(fromSeconds, toSeconds);

			this.nextStage('Converting the video', expectedFrames);
			trimmed = await VideoTask.execute('mp4', {blob: blob});

			const emptyAudio = await this.getEmptyAudioBlob();

			this.nextStage('Adjusting the video', this._outtroLengthInFrames);
			await trimmed.executeOver('emptyAudio', {emptyAudio: emptyAudio});
		}

		return trimmed;
	}

	async getFinalPart() {
		await this.prepare();

		const beforeExpectedStages = this.expectedStages();
		this.expectedStages(beforeExpectedStages + 3);

		this.nextStage('Generating the outtro', this._outtroLengthInFrames);

		const hash = await this.getOriginalHash();

		const fp = new FinalPart();
		const imageAb = await fp.generate({
			originalHash: hash,
			originalWidth: this.originalWidth,
			originalHeight: this.originalHeight,
			originalDuration: this.originalDuration,
		});

		const finalDimensions = Math.min(this.sampleWidth, this.sampleHeight);
		const task = await VideoTask.execute('imageVideo', {ab: imageAb, filename: 'image.png', duration: 1, toWidth: finalDimensions, toHeight: finalDimensions});


		this.nextStage('Adjusting the outtro', this._outtroLengthInFrames);
		await task.executeOver('scale', {toWidth: this.sampleWidth, toHeight: this.sampleHeight});

		const emptyAudio = await this.getEmptyAudioBlob();

		this.nextStage('Adjusting the outtro', this._outtroLengthInFrames);
		await task.executeOver('emptyAudio', {emptyAudio: emptyAudio});

		return task;
	}

	async prepare() {
		if (this._preparePromise) {
			return await this._preparePromise;
		}

		this._preparePromiseResolver = null;
		this._preparePromise = new Promise((res)=>{
			this._preparePromiseResolver = res;
		});

		this._videoCanvas = new VideoCanvas({file: this.file, blurValue: this.blurValue});
		await this._videoCanvas.prepare(); // this._originalWidth, this._originalHeight, this.sampleWidth, this.sampleHeight should be set after this

		this._preparePromiseResolver();
	}

	async setBlurSettings(blurValue, blurFadeValue, blurFadeDuration) {
		this.blurValue = blurValue;
		this.blurFadeValue = blurFadeValue;
		this.blurFadeDuration = blurFadeDuration;

		if (this._videoCanvas) {
			this._videoCanvas.setBlurSettings(blurValue, blurFadeValue, blurFadeDuration);
		}
	}

	async setMaxDimension(value) {
		this.maxSampleDimension = value;

		if (this._videoCanvas) {
			this._videoCanvas.setMaxDimension(value);
		}
	}

	getCurrentStage() {
		return this._readyStage;
	}

	getWorkerLastProcessedFrame() {
		const mp4Encoder = MP4Encoder.getSingleton();
		if (mp4Encoder) {
			return mp4Encoder.getLastProcessedFrame();
		}

		return null;
	}

	expectedStages(count) {
		if (count) {
			this._expectedStages = count;
		}
		return this._expectedStages;
	}

	nextStage(name, expectedFrames) {
		if (!this._currentStage) {
			this._currentStage = 0;
		}

		this._currentStage++;
		this._readyStage = name;

		if (expectedFrames) {
			this._expectedFrames = expectedFrames;
		} else {
			this._expectedFrames = null;
		}

		const mp4Encoder = MP4Encoder.getSingleton();
		if (mp4Encoder) {
			mp4Encoder._lastProcessedFrame = null;
		}
	}

	async getReadyPercent() {
		let stagePercent = 0;
		let inStagePercent = 0;

		let ofStagePercent = (100 / this._expectedStages);

		stagePercent = ofStagePercent * (this._currentStage - 1);
		if (stagePercent < 0) stagePercent = 0;

		if (this._expectedFrames) {
			const lastFrame = this.getWorkerLastProcessedFrame();

			if (lastFrame) {
				// console.error(lastFrame, 'of', this._expectedFrames);

				inStagePercent = (ofStagePercent / this._expectedFrames) * (lastFrame - 1);
				if (inStagePercent < 0) inStagePercent = 0;
				if (inStagePercent > ofStagePercent) inStagePercent = ofStagePercent;
			}
		}

		return stagePercent + inStagePercent;
	}

}