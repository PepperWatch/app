import { defineStore } from 'pinia';
// const md5 = require('blueimp-md5'); // the one with no dependecies
import { LocalStorage } from 'quasar';
import { useApiStore } from './api'
import { useSettingsStore } from './settings'

export const useSessionUserStore = defineStore('sessionUser', {
	// convert to a function
	state: () => ({
		isSessionInititalized: false, // session already initialized on startup
		isSessionInitializing: false, // checking session is in progress
		me: false, // false works better than null for LocalStorage values
		authRequired: false,

		possibleLevels: ['superadmin', 'admin', 'user', 'guest'], // 0 - top level, last - lowest level,
		level: null, // maximum user access level

		profileSettings: {

		},
	}),
	getters: {
	},
	actions: {
		setProfileSetting(name, value) {
			this.profileSettings[name] = value;
		},
		persistProfileSettings() {
			LocalStorage.set('profileSettings', this.profileSettings);
		},
		loadProfileSettings() {
			try {
				this.profileSettings = {};
				const loaded = LocalStorage.getItem('profileSettings');
				if (loaded) {
					for (let key in loaded) {
						this.profileSettings[key] = loaded[key];
					}
				}
			} catch(e) {
				console.error(e);
			}
		},
		signInHidden() {
		},
		requireAuth() {
			// call doSignIn if user is not signed in
			//
			// commit('AUTH_REQUIRED');
			this.authRequired = true;
			if (!this.me) {
				// dispatch('doSignIn');
				this.doSignIn();
			}
		},
		dontRequireAuth() {
			// commit('AUTH_NOT_REQUIRED');
			this.authRequired = false;
		},
		checkLevel() {
			if (!this.me) {
				this.level = null;
			} else {
				if (this.me.level) {
					if (this.me.level != this.level) {
						this.level = this.me.level;
					}
				} else {
					this.level = null;
				}
			}

			// also flush settings store cache
			const settings = useSettingsStore();
			settings.flush();

			// and try to load user's settings
			this.loadProfileSettings();
		},
		getAvailableAccessLevels() {
			const possibleLevels = this.possibleLevels;
			return possibleLevels.filter((level)=>(this.hasLevelOf(level)));
		},
		hasLevelOf(level) {
			if (!this.level) {
				if (level == 'guest') {
					return true;
				}
				return false;
			}
			const curLevelPosition = this.possibleLevels.indexOf(this.level);
			const checkLevelPosition = this.possibleLevels.indexOf(level);

			if (curLevelPosition === -1 || checkLevelPosition === -1) {
				return false;
			} else if (curLevelPosition <= checkLevelPosition) {
				return true;
			}

			return false;
		},
		isLevelGreaterThan(level) {
			if (!this.level) {
				return false;
			}
			const curLevelPosition = this.possibleLevels.indexOf(this.level);
			const checkLevelPosition = this.possibleLevels.indexOf(level);

			if (curLevelPosition === -1 || checkLevelPosition === -1) {
				return false;
			} else if (curLevelPosition < checkLevelPosition) {
				return true;
			}

			return false;
		},
		async initSession() {
			const api = useApiStore();

			// commit('INITIALIZING_STATUS', true);
			this.isSessionInitializing = true;

			console.log('Initializing session...');

			if (LocalStorage.has('signedMe') && LocalStorage.has('signedAuthCode')) {

				this.me = LocalStorage.getItem('signedMe');
				this.checkLevel();
				this.isSessionInititalized = true;
				// commit('api/AUTH_CODE', LocalStorage.getItem('signedAuthCode'));
				api.authCode = LocalStorage.getItem('signedAuthCode');

				console.log('Session restored from storage. Level of: ', this.level);
			}

			if (this.me) {
				const me = await api.get({path: '/auth/me'});

				// console.error('/auth/me', me);
				if (me) {
					this.me = me.me;
					this.checkLevel();
					this.isSessionInititalized = true;
				} else {
					this.me = false;
					this.checkLevel();
					this.isSessionInititalized = true;

					// commit('ME', false); // signed out while we were offline?
					// commit('api/AUTH_CODE', false);
					api.authCode = false;
					LocalStorage.set('signedMe', false);
					LocalStorage.set('signedAuthCode', false);
				}
			}

			// commit('INITIALIZING_STATUS', false);
			this.isSessionInitializing = false;
		},
		doSignIn() {
			// show Auth Sign In dialog via $store.subscribeAction
		},
		async register(data = {}) {
			const api = useApiStore();

			const authResponse = await api.post({path: '/auth/register', data: {
				email: data.email,
				username: data.username,
				password: data.password,
				captcha: data.captcha,
			}});

			if (authResponse && authResponse.me) {
				this.me = authResponse.me;
				this.checkLevel();
				this.isSessionInititalized = true;
				// commit('ME', authResponse.me);
				LocalStorage.set('signedMe', authResponse.me);

				if (authResponse.authCode) {
					api.authCode = authResponse.authCode;
					// commit('api/AUTH_CODE', authResponse.authCode);
					LocalStorage.set('signedAuthCode', authResponse.authCode);
				}

				return true;
			}

			return (authResponse.success || false);
		},
		async signInWithJWT(credential) {
			const api = useApiStore();

			const authResponse = await api.post({path: '/auth/google', data: {
				credential: credential,
			}});

			if (authResponse && authResponse.me) {
				this.me = authResponse.me;
				this.checkLevel();
				this.isSessionInititalized = true;
				// commit('ME', authResponse.me);
				LocalStorage.set('signedMe', authResponse.me);

				if (authResponse.authCode) {
					api.authCode = authResponse.authCode;
					// commit('api/AUTH_CODE', authResponse.authCode);
					LocalStorage.set('signedAuthCode', authResponse.authCode);
				}

				return true;
			}

			return false;
		},
		async signIn(data = {}) {
			const api = useApiStore();

			const authResponse = await api.post({path: '/auth/auth', data: {
				username: data.username,
				password: data.password,
				captcha: data.captcha,
			}});

			if (authResponse && authResponse.me) {
				this.me = authResponse.me;
				this.checkLevel();
				this.isSessionInititalized = true;
				// commit('ME', authResponse.me);
				LocalStorage.set('signedMe', authResponse.me);

				if (authResponse.authCode) {
					api.authCode = authResponse.authCode;
					// commit('api/AUTH_CODE', authResponse.authCode);
					LocalStorage.set('signedAuthCode', authResponse.authCode);
				}

				return true;
			}

			return false;
		},
		doLogOut() {
			const api = useApiStore();

			this.me = false;
			this.checkLevel();
			this.isSessionInititalized = true;

			// commit('ME', false);
			// commit('api/AUTH_CODE', false);
			api.authCode = false;
			LocalStorage.set('signedMe', false);
			LocalStorage.set('signedAuthCode', false);
			LocalStorage.set('profileSettings', {});
		},
		doResetPassword() {
		},
		doRegister() {
		},
		async resetPassword(data = {}) {
			// try {
				const api = useApiStore();

				const resetResponse = await api.post({path: '/auth/reset', data: {
					username: data.username,
					captcha: data.captcha,
				}});

				if (resetResponse && resetResponse.success) {
					return true;
				}
			// } catch(e) {
			// 	return false;
			// }

			return false;
		},
	},
});