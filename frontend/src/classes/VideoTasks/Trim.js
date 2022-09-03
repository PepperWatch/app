import Base from './Base.js';

export default class Trim extends Base {
	constructor(params) {
		super(params);
	}

	secondsToString(value) {
		let sec_num = parseInt(value, 10); // don't forget the second param
		let hours   = Math.floor(sec_num / 3600);
		let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		let seconds = sec_num - (hours * 3600) - (minutes * 60);

		let millis = (value - seconds).toFixed(3).split('.')[1];

		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}


		return hours+':'+minutes+':'+seconds+'.'+millis;
	}

	async execute({fromSeconds, toSeconds}) {
		await this.prepareInputs();

		// console.log(fromTime, toTime);

		let args = ['-y']
			.concat(['-ss', this.secondsToString(fromSeconds)])
			.concat(['-to', this.secondsToString(toSeconds)])
			.concat(['-i', this.inputFiles[0].name])
            .concat(['-vf', "setsar=1"])
			.concat(['-vcodec', 'libx264'])
			.concat(['-crf', '20'])
			// .concat(['-vcodec', 'copy'])
			.concat(['-acodec', 'copy'])
			.concat(['-r', '30'])
			.concat(['output.mp4']);


		await this.executeOnWorker(this.inputFiles, args); // this.inputFiles set in Base.prepareInputs
		return this;
	}
}