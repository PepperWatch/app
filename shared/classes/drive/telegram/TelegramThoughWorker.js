import TelegramWorker from "worker-loader!./TelegramWorker.js";
import CommonTelegramMethods from './CommonTelegramMethods.js';

export default class TelegramThoughWorker extends CommonTelegramMethods {
	constructor() {
		super();

		this._isConnecting = false;
		this._isConnected = false;
		this._isDisconnected = false;

		this._stringSession = null;

		this._client = null;
		this._apiId = null;
		this._apiHash = null;
		this._connectionRetries = 2;

		this._phoneNumber = null;
		this._password = null;
		this._code = null;

		this.waitingFor = {

		};

		this._me = null;
		this._mePhoto = null;

		/// data for stripped images decoding
		this._header8 = Uint8Array.from([255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0,255,219,0,67,0,40,28,30,35,30,25,40,35,33,35,45,43,40,48,60,100,65,60,55,55,60,123,88,93,73,100,145,128,153,150,143,128,140,138,160,180,230,195,160,170,218,173,138,140,200,255,203,218,238,245,255,255,255,155,193,255,255,255,250,255,230,253,255,248,255,219,0,67,1,43,45,45,60,53,60,118,65,65,118,248,165,140,165,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,248,255,192,0,17,8,0,0,0,0,3,1,34,0,2,17,1,3,17,1,255,196,0,31,0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,255,196,0,181,16,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,125,1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250,255,196,0,31,1,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,255,196,0,181,17,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,119,0,1,2,3,17,4,5,33,49,6,18,65,81,7,97,113,19,34,50,129,8,20,66,145,161,177,193,9,35,51,82,240,21,98,114,209,10,22,36,52,225,37,241,23,24,25,26,38,39,40,41,42,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,130,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,226,227,228,229,230,231,232,233,234,242,243,244,245,246,247,248,249,250,255,218,0,12,3,1,0,2,17,3,17,0,63,0]);
		this._footer8 = Uint8Array.from([ 255, 217 ]);

		this.sessionLifetime = 24 * 60 * 60 * 1000 * 30;

		this._initializationPromiseResolver = null;
		this._initializationPromise = new Promise((res)=>{
			this._initializationPromiseResolver = res;
		});

		this._workerPromises = {};
		this._workerPromisesResolvers = {};


		this._downloadingItems = 0;
		this._downloadedItems = 0;

		this._debug = true;
	}

	get me() {
		return this._me;
	}

	/**
	 * Decode stripped photo
	 * @param  {Uint8Array} bytes data returned from TG api
	 * @return {Uint8Array}       image data
	 */
	decodeStrippedPhoto(bytes) {
		if (bytes && bytes.name != 'Uint8Array' && bytes[0] !== undefined) {
			// from JSON
			let a = [];
			let i = 0;
			while (bytes[i] || bytes[i] === 0) {
				a.push(bytes[i]);
				i++;
			}
			bytes = new Uint8Array(a);
		}

		if (!bytes || bytes.byteLength < 3 || bytes[0] != 1) {
			return bytes;
		}

		const out = new Uint8Array(bytes.byteLength + this._header8.byteLength - 3 + 2);
		const headerLength = this._header8.byteLength;
		out.set(this._header8);
		out[164] = bytes[1];
		out[166] = bytes[2];
		out.set(bytes, headerLength - 3);

		out[headerLength - 3] = this._header8[headerLength - 3];
		out[headerLength - 2] = this._header8[headerLength - 2];
		out[headerLength - 1] = this._header8[headerLength - 1];

		out[out.byteLength - 2] = this._footer8[0];
		out[out.byteLength - 1] = this._footer8[1];

		return out;
	}

	async setApiId(apiId) {
		this.callWorker('setApiId', apiId);
	}

	async setApiHash(apiHash) {
		this.callWorker('setApiHash', apiHash);
	}

	async setPhoneNumber(phoneNumber) {
		this.callWorker('setPhoneNumber', phoneNumber);
	}

	async setPassword(password) {
		this.callWorker('setPassword', password);
	}

	async setCode(code) {
		this.callWorker('setCode', code);
	}

	async initialize(options = {}) {
		return await this.initializeWorker(options);
	}

	async onWorkerEvent(eventName, data) {
		this.log('Got event: '+eventName, data);

		if (eventName == 'wait') {
			if (data.detail && data.detail.what && data.detail.what == 'session') {
				this.log('Setting session on Telegram Worker');
				this.callWorker('setSession', this._stringSession);
				return; // no need to dispatch event in this case
			}
		} else if (eventName == 'me') {
			this._me = data.detail;
		} else if (eventName == 'session') {
			this.log('Persisting Telegram session');
			this.setCache('telegram_session', data.detail.session);
		}

		this.dispatchEvent(new CustomEvent(eventName, { detail: data.detail }));
	}

	async getMessages(options) {
		return await this.callWorker('getMessages', options);
	}

	async getDialogs(params) {
		return await this.callWorker('getDialogs', params);
	}

	async downloadProfilePhoto(params) {
		return await this.callWorker('downloadProfilePhoto', params);
	}

	async downloadMedia(options) {
		return await this.callWorker('downloadMedia', options);
	}

	async parallelLimitStart() {
		const maxParallel = 8;
		if (!this.__parallelLimitStartPromiseResolvers) {
			this.__parallelLimitStartPromiseResolvers = [];
			this.__parallelLimitStarted = 0;
			this.__parallelLimitFinished = 0;
		}

		if (this.__parallelLimitStarted - this.__parallelLimitFinished >= maxParallel) {
			do {
				const promise = new Promise((res)=>{
					this.__parallelLimitStartPromiseResolvers.push(res);
				});
				await promise;
			} while(this.__parallelLimitStarted - this.__parallelLimitFinished >= maxParallel);
		}

		this.__parallelLimitStarted++;
	}

	async parallelLimitFinished() {
		this.__parallelLimitFinished++;

		const waitingPromiseResolver = this.__parallelLimitStartPromiseResolvers.shift();
		if (waitingPromiseResolver) {
			waitingPromiseResolver();
		}
	}

	async downloadFile(options) {
		await this.parallelLimitStart();

		const data = await this.callWorker('downloadFile', options);

		await this.parallelLimitFinished();

		return data;
	}

	async writeFile(options) {
		const data = await this.callWorker('writeFile', options);
		return data;
	}

	async endFile(options) {
		const data = await this.callWorker('endFile', options);
		return data;
	}

	/**
	 * Get data url base64 encoded of currently signed in user profile image
	 * @return {String} data url
	 */
	async getMePhoto() {

		if (this._mePhoto) {
			return this._mePhoto;
		}
		if (this.isThereSingleThread('getMePhoto')) {
			return await this.waitForSingleThread('getMePhoto');
		}
		this.createSingleThread('getMePhoto');

		const cacheId = 'telegram_session_photo';
		const cacheLifetime = 1000;

		const cached = this.getCached(cacheId, cacheLifetime);
		if (cached) {
			this._mePhoto = 'data:image/jpeg;base64,'+cached;
			return this._mePhoto;
		}

		await this.initializeWorker();
		const me  = this.me;

		if (!me || !me.photo || !me.photo.strippedThumb) {
			return null;
		}

		const buffer = await this.callWorker('downloadProfilePhoto', {
			entity: 'me',
			fileParams: {
				isBig: false,
			},
		});

		if (buffer) {
			this.log('Downloaded');
			const bytes = new Uint8Array(buffer);

			let binary = '';
			for (let i = 0; i < bytes.byteLength; i++) {
				binary += String.fromCharCode(bytes[i]);
			}
			const b64 = btoa(binary);

			this.setCache(cacheId, b64);
			this._mePhoto = 'data:image/jpeg;base64,'+b64;
			this.resolveSingleThread('getMePhoto', this._mePhoto);

			return this._mePhoto;
		} else {
			this.log('No profile photo, trying to get it from strippedThumb...');
			const bytes = this.decodeStrippedPhoto(me.photo.strippedThumb);

			if (bytes) {
				let binary = '';
				for (let i = 0; i < bytes.byteLength; i++) {
					binary += String.fromCharCode(bytes[i]);
				}
				const b64 = btoa(binary);

				this.setCache(cacheId, b64);
				this._mePhoto = 'data:image/jpeg;base64,'+b64;
				this.resolveSingleThread('getMePhoto', this._mePhoto);

				return this._mePhoto;
			} else {
				this.resolveSingleThread('getMePhoto');

				return null;
			}
		}
	}

	async initializeRestored() {
		let thereToRestore = false;
		let stringSession = this.getCached('telegram_session', this.sessionLifetime);

		if (!stringSession) {
			stringSession = '';
		} else {
			try {
				this._stringSession = stringSession;
				thereToRestore = true;
			} catch(e) {
				this._stringSession = '';
			}
		}

		if (thereToRestore) {
			return await this.initializeWorker();
		}

		return false;
	}

	async initializeWorker(options = {}) {
		if (this._initialized) {
			return true;
		}
		if (this._isInitializing) {
			return await this.__initializationPromise;
		}

		this._isInitializing = true;
		this.__initializationPromiseResolver = null;
		this.__initializationPromise = new Promise((res)=>{
			this.__initializationPromiseResolver = res;
		});

		if (!this._worker) {
			this.log('Adding Telegram Worker');
			this._worker = new TelegramWorker();
			this._worker.onmessage = (event)=>{
				if (event.data && event.data.id) {
					if (this._workerPromisesResolvers[event.data.id]) {
						this._workerPromisesResolvers[event.data.id](event.data);
						delete this._workerPromisesResolvers[event.data.id];
						delete this._workerPromises[event.data.id];
					} else if (event.data.id == 'event') {
						this.onWorkerEvent(event.data.data.event, event.data.data);
					}
				}
			};
		}

		this._isConnected = await this.callWorker('initialize', options);

		this._isInitializing = false;
		this.__initializationPromiseResolver(this._isConnected);
		this._initialized = true;

		return this._isConnected;
	}

	async disconnect() {
		const disconnected = await this.callWorker('disconnect');
		this.log('disconnected', disconnected);
		if (disconnected) {
			this.clearCache('telegram_session_me');
			this.clearCache('telegram_session_photo');
			this.clearCache('telegram_session');

			this._isConnected = false;
			this.cancelInitialization();

			this.dispatchEvent(new CustomEvent('disconnected'));

			return true;
		}
	}

	async cancelInitialization() {
		if (this._isConnected) {
			return false;
		}

		this.__initializationPromiseResolver = null;
		this.__initializationPromise = null;

		this.__waitForPromiseResolver = null;
		this.__waitForPromise = null;

		this.waitingFor = {};

		this._isConnecting = false;
		this._isConnected = false;
		this._stringSession = null;

		this._isInitializing = false;
		this._initialized = false;
		this._worker = null;
		this._me = null;
		this._mePhoto = null;

		return true;
	}

	static getSingleton() {
		if (TelegramThoughWorker.__singleInstance) {
			return TelegramThoughWorker.__singleInstance;
		} else {
			TelegramThoughWorker.__singleInstance = new TelegramThoughWorker();
			return TelegramThoughWorker.__singleInstance;
		}
	}

	async callWorker(method, options = {}) {
		const id = (''+Math.random()).split('.').join('');
		const payload = {
			id: id,
			method: method,
			options: options,
		};

		this._workerPromises[id] = new Promise((res)=>{
			this._workerPromisesResolvers[id] = res;
		});

		this._worker.postMessage(payload);

		let res = null;
		if (options.timeout) {
			res =  await Promise.race([new Promise(function(res) { setTimeout(()=>{ res({data: null}); }, options.timeout) }), this._workerPromises[id]]);
		} else {
			res =  await this._workerPromises[id];
		}

		if (res && res.success) {


			return res.data;
		}

		throw new Error( (res && res.data ? res.data : 'Error') );
	}

}