import { defineStore } from 'pinia';
import { useApiStore } from './api'

export const useSettingsStore = defineStore('settings', {
	// convert to a function
	state: () => ({
		settings: {

		},
		loaded: false,
	}),
	getters: {
	},
	actions: {
		flush() {
			this.settings = {};
			this.loaded = false;
		},
		async set(name, value) {
			this.settings[name] = value;
		},
		async get(name) {
			await this.load();
			return this.settings[name];
		},
		async load() {
			if (this.loaded) {
				return true;
			}
			const api = useApiStore();

			const resp = await api.post({path: '/api/settings/load', data: {}});

			if (resp && resp.settings) {
				// const settings = {};
				// for (let item of resp.items) {
				// 	settings[item.name] = item.value;
				// }

				this.settings = resp.settings;
			}

			this.loaded = true;
		},
		async persist(params = {}) {
			const api = useApiStore();
			const resp = await api.post({path: '/api/settings/persist', data: {
				settings: this.settings,
				levelToRead: params.levelToRead,
				levelToWrite: params.levelToWrite,
			}});

			if (resp) {
				return resp.success;
			}

			return false;
		},
	},
});