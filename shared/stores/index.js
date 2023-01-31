
import { useSessionUserStore } from './sessionUser.js';
import { useApiStore } from './api.js';
import { useSettingsStore } from './settings.js';
// import { useSolanaStore } from './solana.js';
import { useTelegramStore } from './telegram.js';

export default () => {
	return {
		api: useApiStore(),
		sessionUser: useSessionUserStore(),
		settings: useSettingsStore(),
		// solana: useSolanaStore(),
		telegram: useTelegramStore(),
	}
};