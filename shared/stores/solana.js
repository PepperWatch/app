import { defineStore } from 'pinia';

export const useSolanaStore = defineStore('solana', {
	// convert to a function
	state: () => ({
		provider: null,
		signedAddress: null,
		chainType: null,
		selectedChainType: null,
	}),
	getters: {
		sessionId: function(){ // using this to watch
			return ''+this.signedAddress+'_'+this.chainType;
		},
	},
	actions: {
		setSelectedChainType(chainType) {
			this.selectedChainType = chainType;
		},
		setProvider(provider) {
			this.provider = provider;
			if (!provider) {
				this.signedAddress = null;
				this.chainType = null;
			} else {
				this.signedAddress = provider.connectedAddress;
				this.chainType = provider.chainType;
			}
		},
		request() {
			// subscribe to this action in auth component
		},
	},
});