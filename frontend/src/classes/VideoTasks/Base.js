import MP4Encoder from '../MP4Encoder.js';

export default class Base {
	constructor({ab, filename, blob, mp4Encoder, VideoTask}) {
		Object.assign(this, {ab, filename, blob, mp4Encoder, VideoTask});

		if (!this.mp4Encoder) {
			this.mp4Encoder = MP4Encoder.getSingleton();
		}

		this.inputFiles = [];
	}

	async executeOver(taskName, params = {}) {
		params.ab = this._resultAB;
		const overProcessor = await this.VideoTask.execute(taskName, params);

		this._resultAB = overProcessor._resultAB;
		return overProcessor;
	}

	/**
	 * Prepare input files for MEMFS. First file is (ab/blob) from Base.constructor
	 * @param  {ArrayBuffer} append second file if any
	 * @return {[type]}        [description]
	 */
	async prepareInputs(append = null, append2 = null) {
		if (!this.ab && this.blob && this.blob.arrayBuffer) {
			this.ab = await this.blob.arrayBuffer();
		}
		if (!this.ab && this.blob && this.blob.file) {
			// this.blob - is an instance of UserFile probably ?
			this.ab = await this.blob.file.arrayBuffer();
		}

		if (this.ab) {
			if (this.filename) {
				this.inputFiles.push({name: this.filename, data: this.ab});
			} else {
				this.inputFiles.push({name: 'input.mp4', data: this.ab});
			}
		}

		if (!this.inputFiles.length) {
			throw new Error('No input files defined');
		}

		if (append) {
			if (append instanceof ArrayBuffer || Object.prototype.toString.call(append) === '[object ArrayBuffer]') {
				// append is ArrayBuffer
				this.inputFiles.push({name: 'input2.mp4', data: append});
			} else if (append._resultAB) {
				// append is VideoTask processor
				this.inputFiles.push({name: 'input2.mp4', data: append._resultAB});
			}
		}

		if (append2) {
			if (append2 instanceof ArrayBuffer || Object.prototype.toString.call(append2) === '[object ArrayBuffer]') {
				// append is ArrayBuffer
				this.inputFiles.push({name: 'input3.mp4', data: append2});
			} else if (append2._resultAB) {
				// append is VideoTask processor
				this.inputFiles.push({name: 'input3.mp4', data: append2._resultAB});
			}
		}
	}

	async executeOnWorker(files, args) {
		this._resultAB = await this.mp4Encoder.execute(files, args);

		return this._resultAB;
	}

	async asBlob() {
		const blob = new Blob([this._resultAB], { type: "video/mp4" });

		return blob;
	}

	async download() {
		const resultBlob = await this.asBlob();
		const response = new Response(resultBlob, {'Content-Type': 'video/mp4', 'Content-Disposition': 'attachment'});
		const blob = await response.blob();

		let blobUrl = window.URL.createObjectURL(blob);
		let link = document.createElement("a");
		link.href = blobUrl;
		link.download = 'test.mp4';

		document.body.appendChild(link);
		link.innerHTML = "download";
		link.style.display = 'none';
		link.click();

		link.remove();

		window.URL.revokeObjectURL(blobUrl);
	}
}