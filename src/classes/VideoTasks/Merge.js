import Base from './Base.js';

export default class Merge extends Base {
	constructor(params) {
		super(params);
	}

	async execute({withVideo, withVideo2}) {
		await this.prepareInputs(withVideo, withVideo2);

		// appends withVideo to this.inputFiles

		let args = ['-y']
			.concat(['-i', this.inputFiles[0].name])
			.concat(['-i', this.inputFiles[1].name])
			// .concat(['-i', 'input1.mp4'])

		if (withVideo2) {
			// merging 3 videos
			// args = args.concat(['-i', this.inputFiles[2].name]).concat(['-filter_complex', "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]"])

			args = args.concat(['-i', this.inputFiles[2].name]).concat(['-filter_complex', "[1:v]setsar=1[v1];[0:v][0:a][v1][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]"])
		} else {
			// merging 2 videos
			args = args.concat(['-filter_complex', "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]"])
		}
			// .concat(['-filter_complex', "[0:v][1:v]concat=n=2:v=1:a=0[v]"])
         args = args.concat(['-vsync', '2'])
            .concat(['-map', '[v]'])
            .concat(['-map', '[a]'])
			.concat(['output.mp4']);

		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}