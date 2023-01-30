import Base from './Base.js';

export default class ImageVideo extends Base {
	constructor(params) {
		super(params);
	}

	async execute({toWidth, toHeight, duration = 1}) {
		await this.prepareInputs();

		console.log(toWidth, toHeight);

		let args = ['-y']
			.concat(['-loop', '1'])
			.concat(['-i', this.inputFiles[0].name])
			.concat(['-c:v', "libx264"])
			.concat(['-t', ''+duration])
			.concat(['-pix_fmt', "yuv420p"])
			.concat(['-vf', 'scale='+toWidth+':'+toHeight])
			.concat(['output.mp4']);

		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}