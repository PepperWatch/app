const md5 = require('blueimp-md5'); // the one with no dependecies
import { LocalStorage } from 'quasar';

export default {
	state: () => ({
		isSessionInititalized: false, // session already initialized on startup
		isSessionInitializing: false, // checking session is in progress
		me: false, // false works better than null for LocalStorage values
	}),
	mutations: {
		INITIALIZING_STATUS: (state, status) => {
			state.isSessionInitializing = status;
		},
		ME: (state, data) => {
			try {
				state.me = data;
				state.isSessionInititalized = true;
			} catch (err) {
				console.log(err)
			}
		},
	},
	actions: {
		requireAuth({dispatch, state}) {
			// call doSignIn if user is not signed in
			if (!state.me) {
				dispatch('doSignIn');
			}
		},
		async initSession({commit, dispatch, state}) {
			commit('INITIALIZING_STATUS', true);
			if (LocalStorage.has('signedMe') && LocalStorage.has('signedAuthCode')) {
				commit('ME', LocalStorage.getItem('signedMe'));
				commit('api/AUTH_CODE', LocalStorage.getItem('signedAuthCode'));
			}

			if (state.me) {
				const me = await dispatch('api/get', {path: '/auth/me'});
				if (me) {
					commit('ME', me); // session is ok
				} else {
					commit('ME', false); // signed out while we were offline?
					commit('api/AUTH_CODE', false);
					LocalStorage.set('signedMe', false);
					LocalStorage.set('signedAuthCode', false);
				}
			}

			commit('INITIALIZING_STATUS', false);
		},
		doSignIn() {
			// show Auth Sign In dialog via $store.subscribeAction
		},
		async signIn({commit, dispatch}, data = {}) {
			const response = await dispatch('api/post', {path: '/auth/nonce'});
			if (response && response.nonce) {
				const nonce = response.nonce;
				const authResponse = await dispatch('api/post', {path: '/auth/auth', data: {
					username: data.username,
					password: md5(''+nonce+data.password),
				}});

				if (authResponse && authResponse.me) {
					commit('ME', authResponse.me);
					LocalStorage.set('signedMe', authResponse.me);

					if (authResponse.authCode) {
						commit('api/AUTH_CODE', authResponse.authCode);
						LocalStorage.set('signedAuthCode', authResponse.authCode);
					}

					return true;
				}

				return false;
			}
		},
		doLogOut({commit}) {
			commit('ME', false);
			commit('api/AUTH_CODE', false);
			LocalStorage.set('signedMe', false);
			LocalStorage.set('signedAuthCode', false);
		},
	},
	getters: {

	}
};