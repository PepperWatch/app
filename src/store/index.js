import { createStore } from 'vuex';
import api from './modules/api.js';
import sessionUser from './modules/sessionUser.js';
import maintenance from './modules/maintenance.js';
import blockchain from './modules/blockchain.js';

const store = createStore({
	modules: {
		api,
		sessionUser,
		maintenance,
		blockchain,
	}
});

export default store;
