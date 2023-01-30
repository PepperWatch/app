import LocalCachedMethods from 'shared/classes/abstract/LocalCachedMethods.js';

export default class CommonTelegramMethods extends LocalCachedMethods {
	constructor(params = {}) {
		super();

		this._debug = params.debug || false;
	}

	log(...args) {
		if (!this._debug) {
			return;
		}

		args.unshift(''+this.constructor.name+' | ');
		console.info.apply(null, args);
	}

	fileNameToType(fileName) {
		const re = /(?:\.([^.]+))?$/;
		const extension = (''+re.exec(fileName)[1]).toLowerCase();

		const photoExts = ['png', 'jpg', 'jpeg'];
		const videoExts = ['mp4', 'mpeg', 'avi', 'mov', 'webm'];

		if (photoExts.indexOf(extension) !== -1) {
			return 'photo';
		} else if (videoExts.indexOf(extension) !== -1) {
			return 'video';
		}

		return null;
	}
}