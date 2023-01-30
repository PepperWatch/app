import { defineStore } from 'pinia';

export const useTelegramStore = defineStore('telegram', {
	// convert to a function
	state: () => ({
		provider: null,
		username: null,
		photo: null,
	}),
	getters: {
	},
	actions: {
		async setProvider(provider) {
			this.provider = provider;
			if (provider && provider.me && provider.me.username) {
				this.username = provider.me.username;
				this.photo = await provider.getMePhoto();
			} else {
				this.username = null;
				this.photo = null;
			}
		}
	},
});