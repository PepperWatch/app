import { Api, TelegramClient } from "./telegram.js";
// import { StringSession } from "telegram/sessions";

import LocalCachedMethods from './abstract/LocalCachedMethods.js';

export default class Telegram extends LocalCachedMethods {
	constructor() {
		super();

		this._isConnecting = false;
		this._isConnected = false;

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
	}

	static getSingleton() {
		if (Telegram.__singleInstance) {
			return Telegram.__singleInstance;
		} else {
			Telegram.__singleInstance = new Telegram();
			return Telegram.__singleInstance;
		}
	}

	log(str) {
		console.log('Telegram | ', str);
	}

	get me() {
		return this._me;
	}

	get Api() {
		return Api;
	}

	get client() {
		return this._client;
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

		await this.initialize();

		const me  = this.me;

		if (!me || !me.photo || !me.photo.strippedThumb) {
			return null;
		}

		this.log('Downloading profile photo...');
		const buffer = await this._client.downloadProfilePhoto('me', {isBig: false});
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

	async invoke(q) {
		this.log(q);
		const result = await this._client.invoke(q);
		this.log(result);

		return result;
	}

	async setApiId(apiId) {
		this._apiId = apiId;
		this.resolveWaiter();
	}

	async setApiHash(apiHash) {
		this._apiHash = apiHash;
		this.resolveWaiter();
	}

	async setPhoneNumber(phoneNumber) {
		this._phoneNumber = phoneNumber;
		this.resolveWaiter();
	}

	async setPassword(password) {
		this._password = password;
		this.resolveWaiter();
	}

	async setCode(code) {
		this._code = code;
		this.resolveWaiter();
	}

	async waitForPhoneNumber() {
		return await this.waitFor('phoneNumber');
	}

	async waitForCode() {
		return await this.waitFor('code');
	}

	async waitForPassword() {
		return await this.waitFor('password');
	}

	resolveWaiter() {
		if (this.__waitForPromise) {
			this.__waitForPromiseResolver();
			this.__waitForPromise = null;
			this.__waitForPromiseResolver = null;
		}
	}

	async waitFor(propertyName) {
		this.waitingFor[propertyName] = true;
		this.isWaiting = true;

		if (this['_'+propertyName]) {
			this.waitingFor[propertyName] = false;
			this.isWaiting = false;
			return this['_'+propertyName];
		}
		if (this.__waitForPromise) {
			await this.__waitForPromise;
			this.waitingFor[propertyName] = false;
			this.isWaiting = false;
			return this['_'+propertyName];
		}

		this.__waitForPromiseResolver = null;
		this.__waitForPromise = new Promise((res)=>{
			this.__waitForPromiseResolver = res;
		});

		this.dispatchEvent(new CustomEvent('wait', { detail: {what: propertyName} }));

		await this.__waitForPromise;
		this.waitingFor[propertyName] = false;
		this.isWaiting = false;
		return this['_'+propertyName];
	}

	async getMe() {
		const cacheId = 'telegram_session_me';
		const cacheLifetime = 1000;

		const cached = this.getCached(cacheId, cacheLifetime);
		if (cached) {
			return JSON.parse(cached);
		}

		const me = await this.invoke(new this.Api.users.GetUsers({id: ['me']}));
		if (me && me[0] && me[0].id) {
			this.setCache(cacheId, JSON.stringify(me[0]));
			return me[0];
		}
	}

	async disconnect() {
		const result = await this.invoke(new this.Api.auth.LogOut({}));

		if (result) {
			this.clearCache('telegram_session_me');
			this.clearCache('telegram_session_photo');
			this.clearCache('telegram_session');

			this._me = null;

			this.dispatchEvent(new CustomEvent('disconnected'));

			return true;
		}
	}

	async initializeRestored() {
		let thereToRestore = false;
		let stringSession = this.getCached('telegram_session', this.sessionLifetime);
		if (!stringSession) {
			stringSession = '';
		} else {
			try {
				this._stringSession = new StringSession(stringSession);
				thereToRestore = true;
			} catch(e) {
				this._stringSession = new StringSession('');
			}
		}

		if (thereToRestore) {
			return await this.initialize();
		}

		return false;
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

		this._client = null;

		return true;
	}

	async initialize() {
		if (this.__initializationPromise) {
			return await this.__initializationPromise;
		}

		this.__initializationPromiseResolver = null;
		this.__initializationPromise = new Promise((res)=>{
			this.__initializationPromiseResolver = res;
		});

		let apiId = await this.waitFor('apiId');
		let apiHash = await this.waitFor('apiHash');

		if (!apiId || !apiHash) {
			this.isConnected = false;
		} else {
			apiId = parseInt(apiId, 10);

			let stringSession = this.getCached('telegram_session', this.sessionLifetime);
			if (!stringSession) {
				stringSession = '';
			}

			try {
				this._stringSession = new StringSession(stringSession);
			} catch(e) {
				this._stringSession = new StringSession('');
			}
			try {
				this._client = new TelegramClient(this._stringSession, apiId, apiHash, {
					connectionRetries: this._connectionRetries,
				});

				const success = await this._client.start({
					phoneNumber: async()=>{ return await this.waitForPhoneNumber() },
					password: async()=>{ return await this.waitForPassword() },
					phoneCode: async()=>{ return await this.waitForCode() },
					onError: (err) => { console.error(err); this.log(err) },
				});

				this.log(success);

				if (await this._client.checkAuthorization()){
					this.isConnected = true;
					this.log("You should now be connected.");

					this._me = await this.getMe();

					if (this._me) {
						this.log('Connected');
						this.setCache('telegram_session', this._client.session.save());
					} else {
						this.log('Can not get ME from TG');
						this.clearCache('telegram_session');
					}
				} else {
					this.isConnected = false;
					this.log("Error conencting.");
					this.clearCache('telegram_session');
				}
			} catch(e) {
				this.isConnected = false;

				this.log("Error conencting.");
				this.log(e);

				this.clearCache('telegram_session');
			}
		}

		this.__initializationPromiseResolver(this.isConnected);

		if (this.isConnected) {
			this.dispatchEvent(new CustomEvent('connected'));
		} else {
			this.dispatchEvent(new CustomEvent('disconnected'));
		}

		return this.isConnected;
	}

}