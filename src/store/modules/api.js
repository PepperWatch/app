import axios from 'axios';
import settings from '../../settings';


/**
 * Removes extra slashes
 */
const normalizePath = (baseURL, path) => {
	return baseURL.replace(/\/$/, '') + '/' + path.replace(/^\/+/, '');
}

export default {
	namespaced: true,
	state: () => ({
		baseURL: settings.api.basePath,
		authCode: false,
		querying: false,
		requestsCount: 0,
	}),
	mutations: {
		REQUEST_SENT: (state) => {
			state.requestsCount++;
			state.querying = true;
		},
		REQUEST_SUCCESS: (state) => {
			state.requestsCount--;
			if (!state.requestsCount) {
				state.querying = false;
			}
		},
		REQUEST_ERROR: (state) => {
			state.requestsCount--;
			if (!state.requestsCount) {
				state.querying = false;
			}
		},
		AUTH_CODE: (state, authCode) => {
			state.authCode = authCode;
		},
	},
	actions: {
		async get({commit, state}, {path}) {
			commit('REQUEST_SENT');

			try {
				const config = { headers: {} };
				if (state.authCode) {
					config.headers.authcode = state.authCode;
				}

				const response = await axios.get(normalizePath(state.baseURL, path), config);

				commit('REQUEST_SUCCESS');
				return response.data;

			} catch(e) {
				commit('REQUEST_ERROR');
			}

			return null;
		},
		async post({commit, state}, {path, data}) {
			data = data || {};
			commit('REQUEST_SENT');

			try {
				const config = { headers: {} };
				if (state.authCode) {
					config.headers.authcode = state.authCode;
				}

				const response = await axios.post(normalizePath(state.baseURL, path), data, config);

				commit('REQUEST_SUCCESS');
				return response.data;

			} catch(e) {

				commit('REQUEST_ERROR');
			}

			return null;
		},
	},
	getters: {

	}
};