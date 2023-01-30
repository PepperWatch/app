import Base from './Base.js';

export default class Scale extends Base {
	constructor(params) {
		super(params);
	}

	async execute({toWidth, toHeight}) {
		await this.prepareInputs();

		let args = ['-y']
			.concat(['-i', this.inputFiles[0].name])
            .concat(['-vf', "scale='min("+toWidth+",iw)':min'("+toHeight+",ih)':force_original_aspect_ratio=1,pad="+toWidth+":"+toHeight+":-1:-1:color=black"])
			.concat(['output.mp4']);

		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}