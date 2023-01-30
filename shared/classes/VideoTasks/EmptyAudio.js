import Base from './Base.js';

export default class EmptyAudio extends Base {
	constructor(params) {
		super(params);
	}

	async execute({emptyAudio}) {
		await this.prepareInputs();

		const ab = await emptyAudio.arrayBuffer();
		this.inputFiles.push({name: 'input.mp3', data: ab});
// ffmpeg -i video -f lavfi -i anullsrc=cl=1 -shortest -c:v libx264 -c:a aac output.mov

		let args = ['-y']
			.concat(['-i', this.inputFiles[0].name])
			.concat(['-i', this.inputFiles[1].name])
			.concat(['-shortest'])
			.concat(['-c:v', 'copy'])
			.concat(['-c:a', 'aac'])
			.concat(['output.mp4']);

		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}