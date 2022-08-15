import Trim from './Trim.js';
import Blur from './Blur.js';
import Scale from './Scale.js';
import Merge from './Merge.js';
import MP4 from './MP4.js';
import ImageVideo from './ImageVideo.js';
import EmptyAudio from './EmptyAudio.js';

const processors = {
	trim: Trim,
	blur: Blur,
	scale: Scale,
	merge: Merge,
	mp4: MP4,
	imageVideo: ImageVideo,
	emptyAudio: EmptyAudio,
};

export default class VideoTask {
	constructor() {
	}

	static async execute(taskName, params = {}) {
		if (!processors[taskName]) {
			throw new Error('Invalid taskName: '+taskName);
		}

		params.VideoTask = VideoTask;
		const processor = new processors[taskName](params);

		console.log('VideoTask | Executing '+taskName+'...');
		return await processor.execute(params);
	}
}