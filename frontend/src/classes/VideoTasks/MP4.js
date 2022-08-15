import Base from './Base.js';

export default class MP4 extends Base {
	constructor(params) {
		super(params);
	}

	async execute() {
		await this.prepareInputs();

		let args = ['-y']
			.concat(['-i', this.inputFiles[0].name])
            // .concat(['-vf', "setsar=1"])
			.concat(['-r', '24'])
			.concat(['output.mp4']);

		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}