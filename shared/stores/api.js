import { defineStore } from 'pinia';
import axios from 'axios';
import ModelFactory from 'shared/classes/ModelFactory.js';

const mapResponseToModels = function(item, api) {
	if (Array.isArray(item)) {
		return item.map((i)=>{
			return mapResponseToModels(i, api);
		});
	} else if (item !== null && typeof item === 'object') {
		const ret = {};
		for (let key in item) {
			ret[key] = mapResponseToModels(item[key], api);
		}
		if (item.__modelName) {
			const c = ModelFactory.getModel(item.__modelName, api);
			return new c({
				fields: ret,
			});
		} else {
			return ret;
		}

	} else {
		return item;
	}
}

class APICollection {
	constructor(params = {}) {
		this.api = params.api || null;
		this._name = params.name || null;

		this._apiPrefix = 'api/';
		this._listPath = ''+this._name;
	}

	setListPath(path) {
		if (path) {
			this._listPath = path;
		} else {
			this._listPath = ''+this._name;
		}
	}

	get axios() {
		return this._api._axios;
	}

	new() {
		const c = ModelFactory.getModel(this._name, this.api); // get by collection name
		return new c({
			collection: this,
			fields: {},
		});
	}

	async get(params) {
		let id = params.id || params._id || null;

		const resp = await this.api.get({path: 'api/'+this._name+'/'+id});
		return mapResponseToModels(resp, this.api);
	}

	async list(params) {
		const resp = await this.api.get({path: this._apiPrefix + this._listPath, params: params});
		return mapResponseToModels(resp, this.api);
	}

	async post(data = {}, params = {}) {
		let fields = data;
		// if (data._model && data._fields) {
		// 	fields = data.fields; // Model is passed
		// }

		const resp = await this.api.post({path: 'api/'+this._name, params: params, data: fields});
		return mapResponseToModels(resp, this.api);
	}

	async edit(data = {}, params= {}) {
		let id = data.id || data._id || null;
		if (!id) {
			throw 'id or _id is required';
		}

		let fields = data;
		// if (data._model && data._fields) {
		// 	fields = data.fields; // Model is passed
		// }

		const resp = await this.api.put({path: 'api/'+this._name+'/'+id, data: fields, params: params});
		return mapResponseToModels(resp, this.api);
	}

	async delete(data = {}) {
		let id = data.id || data._id || null;
		if (!id) {
			throw 'id or _id is required';
		}

		const resp = await this.api.delete({path: 'api/'+this._name+'/'+id});
		return resp.success;
	}
}

/**
 * Removes extra slashes
 */
const normalizePath = (baseURL, path) => {
	return baseURL.replace(/\/$/, '') + '/' + path.replace(/^\/+/, '');
}

export const useApiStore = defineStore('api', {
	// convert to a function
	state: () => ({
		baseURL: (process.env.API_URL ? process.env.API_URL : '/'),
		authCode: false,
		querying: false,
		requestsCount: 0,
	}),
	getters: {
	},
	actions: {
		setBaseURL(baseURL) {
			this.baseURL = baseURL;
		},
		collection(name) {
			return new APICollection({
				name: name,
				api: this,
			});
		},
		async get({path, params}) {
			try {
				const config = { headers: {} };
				if (this.authCode) {
					config.headers.authcode = this.authCode;
				}
				params = params || {};
				config.params = params;

				const response = await axios.get(normalizePath(this.baseURL, path), config);

				// commit('REQUEST_SUCCESS');
				return response.data;

			} catch(e) {
				// commit('REQUEST_ERROR');
			}

			return null
		},
		async post({path, data, params}) {
			data = data || {};
			// commit('REQUEST_SENT');


			// eslint-disable-next-line no-useless-catch
			try {
				const config = { headers: {} };
				if (this.authCode) {
					config.headers.authcode = this.authCode;
				}

				if (params) {
					config.params = params;
				}

				const response = await axios.post(normalizePath(this.baseURL, path), data, config);

				// commit('REQUEST_SUCCESS');
				return response.data;

			} catch(e) {

				// commit('REQUEST_ERROR');
				throw e;
			}
		},
		async put({path, data, params}) {
			data = data || {};
			// commit('REQUEST_SENT');

			// eslint-disable-next-line no-useless-catch
			try {
				const config = { headers: {} };
				if (this.authCode) {
					config.headers.authcode = this.authCode;
				}

				if (params) {
					config.params = params;
				}

				const response = await axios.put(normalizePath(this.baseURL, path), data, config);

				// commit('REQUEST_SUCCESS');
				return response.data;

			} catch(e) {

				// commit('REQUEST_ERROR');
				throw e;
			}
		},
		async delete({path}) {
			// commit('REQUEST_SENT');

			try {
				const config = { headers: {} };
				if (this.authCode) {
					config.headers.authcode = this.authCode;
				}

				const response = await axios.delete(normalizePath(this.baseURL, path), config);

				// commit('REQUEST_SUCCESS');
				return response.data;

			} catch(e) {

				// commit('REQUEST_ERROR');
			}

			return null;
		},
	},
});