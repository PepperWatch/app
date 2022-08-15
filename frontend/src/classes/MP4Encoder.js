

export default class MP4Encoder {
	constructor() {
		this._webWorkerBlobUrl = null;
		this._worker = null;

		this._workerReady = false;

		this._workerReadyPromiseResolver = null;
		this._workerReadyPromiseRejecter = null;
		this._workerReadyPromise = new Promise((res, rej)=>{
			this._workerReadyPromiseResolver = res;
			this._workerReadyPromiseRejecter = rej;
		});

		this._lastProcessedFrame = 0;
		this._lastErrors = [];
	}

	static getSingleton() {
		if (MP4Encoder.__singleInstance) {
			return MP4Encoder.__singleInstance;
		} else {
			MP4Encoder.__singleInstance = new MP4Encoder();
			return MP4Encoder.__singleInstance;
		}
	}

	log(str) {
		console.log('MP4 Encoder | ', str);
	}

	getLastProcessedFrame() {
		return this._lastProcessedFrame;
	}

	async execute(files, args) {
		// if files is single arrayBuffer - convert it to array of files:
		//
		if (files instanceof ArrayBuffer || Object.prototype.toString.call(files) === '[object ArrayBuffer]') {
			files = [{name: 'input.mp4', data: files}];
		}

		await this.initWebWorker();

		const idealheap = 128 * 1024 * 1024 * 1024;

		this.log('starting task...');

		console.log(args);

		this._worker.postMessage({
			type: "run",
			arguments: args,
			TOTAL_MEMORY: idealheap,
			MEMFS: files
		});

		this._videoReadyPromiseResolver = null;
		this._videoReadyPromiseRejecter = null;
		this._videoReadyPromise = new Promise((res, rej)=>{
			this._videoReadyPromiseResolver = res;
			this._videoReadyPromiseRejecter = rej;
		});

		return await this._videoReadyPromise;
	}

	// async blur(file, radius) {
	// 	let args = ['-y']
	// 		.concat(['-i', file.name])
	// 		.concat(['-filter_complex', "[0:v]avgblur=sizeX="+radius+":sizeY="+radius+"[blurred]"])
	// 		.concat(['-map', '[blurred]'])
	// 		.concat(['output.mp4']);
	// 	const files = [file];

	// 	this.log('querying file to blur...');

	// 	return await this.execute(files, args);
	// }



	// async trim(file, fromTime, toTime) {
	// 	// await this.initWebWorker();
	// 	const files = [{name: 'input.mp4', data: file}];

	// 	console.log(fromTime, toTime);

	// 	let args = ['-y']
	// 		.concat(['-s4s', '00:00:00.000'])
	// 		.concat(['-t4', '00:00:02.000'])
	// 		.concat(['-i', files[0].name])
	// 		.concat(['-acodec', 'copy'])
	// 		.concat(['-vcodec', 'copy'])
	// 		.concat(['output.mp4']);

	// 	// const idealheap = 128 * 1024 * 1024 * 1024;
	// 	// const files = [file];

	// 	this.log('querying file to trim...');

	// 	return await this.execute(files, args);

	// 	// this._worker.postMessage({
	// 	// 	type: "run",
	// 	// 	arguments: args,
	// 	// 	TOTAL_MEMORY: idealheap,
	// 	// 	MEMFS: files
	// 	// });

	// 	// this._videoReadyPromiseResolver = null;
	// 	// this._videoReadyPromise = new Promise((res)=>{
	// 	// 	this._videoReadyPromiseResolver = res;
	// 	// });

	// 	// return await this._videoReadyPromise;
	// }

	// /**
	//  * Encode file to mp4
	//  * @param  { name: 'test.webm', data: arrayBuffer } file [description]
	//  * @return {arrayBuffer}      [description]
	//  */
	// async encode(file) {
	// 	await this.initWebWorker();

	// 	// https://stackoverflow.com/questions/12368151/adding-silent-audio-in-ffmpeg
	// 	// https://github.com/Kagami/ffmpeg.js/issues/58

	// 	let args = ['-y']
 //            // .concat(['-preset', 'ultrafast'])
	// 		// .concat((encoderArgs || []))
	// 		// .concat((startTime !== undefined) ? ['-ss', startTime] : [])
	// 		.concat(['-i', file.name])
	// 		// .concat((endTime !== undefined) ? ['-t', endTime] : [])
	// 		.concat(['-r', '24'])
 //            // .concat(['-vf', 'scale=1280:720'])
	// 		// .concat(['-c:a', 'aac'])
	// 		.concat(['output.mp4']);

	// 	// console.log(args);

	// 	const idealheap = 128 * 1024 * 1024 * 1024;
	// 	const files = [file];

	// 	this.log('querying file to encode...');

	// 	this._worker.postMessage({
	// 		type: "run",
	// 		arguments: args,
	// 		TOTAL_MEMORY: idealheap,
	// 		MEMFS: files
	// 	});

	// 	this._videoReadyPromiseResolver = null;
	// 	this._videoReadyPromise = new Promise((res)=>{
	// 		this._videoReadyPromiseResolver = res;
	// 	});

	// 	return await this._videoReadyPromise;
	// }

	// async scale(file, toWidth, toHeight) {
	// 	await this.initWebWorker();

	// 	console.log(toWidth, toHeight);

	// 	let args = ['-y']
	// 		.concat(['-i', file.name])
 //            .concat(['-vf', "scale='min("+toWidth+",iw)':min'("+toHeight+",ih)':force_original_aspect_ratio=decrease,pad="+toWidth+":"+toHeight+":-1:-1:color=black"])
	// 		.concat(['output.mp4']);

	// 	const idealheap = 128 * 1024 * 1024 * 1024;
	// 	const files = [file];

	// 	this.log('querying file to scale...');

	// 	this._worker.postMessage({
	// 		type: "run",
	// 		arguments: args,
	// 		TOTAL_MEMORY: idealheap,
	// 		MEMFS: files
	// 	});


	// 	this._videoReadyPromiseResolver = null;
	// 	this._videoReadyPromise = new Promise((res)=>{
	// 		this._videoReadyPromiseResolver = res;
	// 	});

	// 	return await this._videoReadyPromise;
	// }

	// async toMpegTS(file) {
	// 	await this.initWebWorker();

	// 	let args = ['-y']
	// 		.concat(['-i', file.name])
 //            .concat(['-c', 'copy'])
 //            .concat(['-bsf:v', 'h264_mp4toannexb'])
 //            .concat(['-f', 'mpegts'])
	// 		.concat(['output.ts']);

	// 	const idealheap = 128 * 1024 * 1024 * 1024;
	// 	const files = [file];

	// 	this.log('querying file for ts...');

	// 	this._worker.postMessage({
	// 		type: "run",
	// 		arguments: args,
	// 		TOTAL_MEMORY: idealheap,
	// 		MEMFS: files
	// 	});

	// 	this._videoReadyPromiseResolver = null;
	// 	this._videoReadyPromise = new Promise((res)=>{
	// 		this._videoReadyPromiseResolver = res;
	// 	});

	// 	return await this._videoReadyPromise;
	// }

	// async merge(file1, file2) {
	// 	await this.initWebWorker();

	// 	// const encoded1 = await this.toMpegTS(file1);
	// 	// console.error(encoded1);

	// 	// const encoded2 = await this.toMpegTS(file2);
	// 	// console.error(encoded2);

	// 	// console.log(file2);

	// 	let args = ['-y']
	// 		.concat(['-i', 'input1.mp4'])
	// 		.concat(['-i', 'input2.mp4'])
	// 		// .concat(['-i', 'input1.mp4'])
	// 		// .concat(['-filter_complex', "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]"])
	// 		.concat(['-filter_complex', "[0:v][1:v]concat=n=2:v=1:a=0[v]"])
 //            .concat(['-vsync', '2'])
 //            .concat(['-map', '[v]'])
 //            // .concat(['-map', '[a]'])
	// 		.concat(['output.mp4']);

	// 	const idealheap = 128 * 1024 * 1024 * 1024;
	// 	const files = [{name: 'input1.mp4', data: file1.data}, {name: 'input2.mp4', data: file2.data}];

	// 	this.log('querying files to merge...');

	// 	this._worker.postMessage({
	// 		type: "run",
	// 		arguments: args,
	// 		TOTAL_MEMORY: idealheap,
	// 		MEMFS: files
	// 	});

	// 	this._videoReadyPromiseResolver = null;
	// 	this._videoReadyPromise = new Promise((res)=>{
	// 		this._videoReadyPromiseResolver = res;
	// 	});

	// 	return await this._videoReadyPromise;
	// 	//
	// 	// let mylistContent = "#content\n";
	// 	// mylistContent += "file '"+file1.name+"'\n";
	// 	// mylistContent += "duration 2.0\n\n";
	// 	// mylistContent += "file '"+file2.name+"'\n";
	// 	// mylistContent += "duration 2.0\n\n";

	// 	// const textEncoder = new TextEncoder(); // always utf-8
	// 	// const uint8Array = textEncoder.encode(mylistContent);
	// 	// const myListBuffer = uint8Array.buffer;

	// 	// const myListFile = {name: 'mylist.txt', data: myListBuffer};

	// 	// let args = ['-y']
 //  //           .concat(['-f', 'concat'])
 //  //           .concat(['-safe', '0'])
 //  //           .concat(['-i', 'mylist.txt'])
 //  //           .concat(['-c', 'copy'])
	// 	// 	.concat(['output.mp4']);

	// 	// const idealheap = 128 * 1024 * 1024 * 1024;
	// 	// const files = [file1, file2, myListFile];

	// 	// this.log('querying files to merge...');

	// 	// this._worker.postMessage({
	// 	// 	type: "run",
	// 	// 	arguments: args,
	// 	// 	TOTAL_MEMORY: idealheap,
	// 	// 	MEMFS: files
	// 	// });

	// 	// this._videoReadyPromiseResolver = null;
	// 	// this._videoReadyPromise = new Promise((res)=>{
	// 	// 	this._videoReadyPromiseResolver = res;
	// 	// });

	// 	// return await this._videoReadyPromise;
	// }

	messageFromWebworker(type, data) {
		// if (type == 'stderr' && (''+data).indexOf('SAR') != -1)

		switch (type) {
			case "ready":
				this.log('web worker ready.');
				this._workerReady = true;
				this._workerReadyPromiseResolver();
				// globalResolve();
				break;
			case "stdout":
				// if (this.stderr) this.stderr(msg);
				// stdout += msg.data + "\n";
				break;
			case "stderr":
				console.log(data);

				data = ''+data;
				this._lastErrors = this._lastErrors.slice(0,4);
				this._lastErrors.unshift(data);

				if (data.indexOf('frame=')!= -1) {
					const regex = /frame=[^0-9]+([0-9]+)[^0-9]+/gm;
					const found = [...data.matchAll(regex)];

					if (found[0] && found[0][1]) {
						this._lastProcessedFrame = parseInt(found[0][1]);
						this.log('frame: '+this._lastProcessedFrame);
					}
				}

				// if (this.stderr) this.stderr(msg);
				// stderr += msg.data + "\n";
				break;
			case "done":
				this.log('got encoded file');
				if (data && data.MEMFS && data.MEMFS[0]) {
					this._videoReadyPromiseResolver(data.MEMFS[0].data);
				} else {
					this._videoReadyPromiseRejecter(this._lastErrors);
				}
				// videoResolve(msg.data);
				// worker.terminate();
				// console.log("done");
				break;
			case "exit":
				this.log('exited: '+data);
				// console.log("Process exited with code " + msg.data);
				// console.log(stderr);
				// console.log(stdout);
				break;
		}
	}

	async loadWebWorkerCode() {
		try {
			this.log('getting web worker...');
			// const webWorkerURL = "https://raw.githubusercontent.com/StormRaider2495/video-trimming/master/scripts/ffmpeg.js v4.2.9003/ffmpeg-worker-mp4.js";
			const webWorkerURL = "/ffmpeg-worker-mp4.js";
			const res = await fetch(webWorkerURL);
			this.log('got web worker.');
			const blob = await res.blob();

			this.log('blob', blob);

			this._webWorkerBlobUrl = window.URL.createObjectURL(blob);

			return true;
		} catch(e) {
			console.error(e);

			return false;
		}
	}

	async initWebWorker() {
		if (this._workerReady) {
			return true;
		}

		await this.loadWebWorkerCode();

		this._worker = new Worker(this._webWorkerBlobUrl);
		this._worker.onmessage = (e) => {
			const msg = e.data;
			this.messageFromWebworker(msg.type, msg.data);
		};

		this.log('web worker installed');

		await this._workerReadyPromise; // await for 'ready' message from the worker
		return true;
	}
}