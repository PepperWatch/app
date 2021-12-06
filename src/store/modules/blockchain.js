

export default {
	namespaced: true,
	state: () => ({
		signedAddress: null,
		chainType: null,
		provider: null,
	}),
	mutations: {
		SIGNED_ADDRESS: (state, signedAddress) => {
			state.signedAddress = signedAddress;
		},
		CHAIN_TYPE: (state, chainType) => {
			state.chainType = chainType;
		},
		PROVIDER: (state, provider) => {
			state.provider = provider;
		},
		DISCONNECT: (state) => {
			state.provider = null;
			state.chainType = null;
			state.signedAddress = null;
		},
	},
	actions: {
		async connected({commit}, {signedAddress, chainType, provider}) {
			commit('SIGNED_ADDRESS', signedAddress);
			commit('CHAIN_TYPE', chainType);
			commit('PROVIDER', provider);

			return true;
		},
		async disconnected({commit}) {
			commit('DISCONNECT');
		},
	},
	getters: {
		provider: (state)=>{
			return state.provider;
		},
		signedAddress: (state)=>{
			return state.signedAddress;
		},
		chainType: (state)=>{
			return state.chainType;
		},
		sessionId: (state)=>{ // using this to watch
			return ''+state.signedAddress+'_'+state.chainType;
		},
	}
};