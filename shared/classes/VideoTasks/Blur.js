import Base from './Base.js';

export default class Blur extends Base {
	constructor(params) {
		super(params);
	}

	async execute({radius = 20}) {
		await this.prepareInputs();

		let args = ['-y']
			.concat(['-i', this.inputFiles[0].name])
			.concat(['-filter_complex', "[0:v]avgblur=sizeX="+radius+":sizeY="+radius+"[blurred]"])
			.concat(['-map', '0:a'])
			.concat(['-map', '[blurred]'])
			.concat(['output.mp4']);

		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}