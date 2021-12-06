

export default {
	namespaced: true,
	state: () => ({
		// maintenance: ((document.location.host.indexOf('pepper') != -1) ? true : false),
		maintenance: false,
	}),
	mutations: {
		MAINTENANCE_OFF: (state) => {
			state.maintenance = false;
		},
		MAINTENANCE_ON: (state) => {
			state.maintenance = true;
		},
	},
	actions: {
		async disable({commit, state}) {
			console.log(state);

			commit('MAINTENANCE_OFF');
			return true;
		},
	},
	getters: {
		maintenance: (state)=>{
			return state.maintenance;
		}
	}
};