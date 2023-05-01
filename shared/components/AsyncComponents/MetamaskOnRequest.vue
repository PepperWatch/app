<template>

	<MetamaskAsync ref="metamaskComponent" v-if="isRequested" @loaded="onLoaded" @connected="onConnected" @disconnected="onDisconnected"  @notinstalled="onNotinstalled" />

</template>


<script>
import MetamaskAsync from 'shared/components/AsyncComponents/MetamaskAsync.js';

export default {
	name: 'MetamaskOnRequest',
    props: {
        auto: {
			type: Boolean,
			default: false,
		},
    },
	data() {
		return {
			isLoaded: false,
			isRequested: false,
			isConnected: false,

			metamask: null,
			connectedAddress: null,
			connectedNetId: null,
		}
	},
	emits: ['connectstart', 'connectend', 'connected', 'loaded', 'disconnected', 'notinstalled'],
	components: {
		MetamaskAsync,
	},
	watch: {
	},
	methods: {
		async request() {
			this.isRequested = true;

			if (this.metamask) {
				return this.metamask;
			}

			if (!this.isLoaded) {
				// wait for the load
				if (!this.__loadPromise) {
					this.__loadPromiseResolver = null;
					this.__loadPromise = new Promise((res)=>{
						this.__loadPromiseResolver = res;
					});
				}

				await this.__loadPromise;
				// now it's loaded
			}

			console.log('loaded');

			await this.$refs.metamaskComponent.connect();
			// may be connected or not now

			console.log('after connect', this.metamask);
			if (this.metamask) {
				return this.metamask;
			}

			return null;
		},
		onLoaded() {
			this.isLoaded = true;
			this.$emit('loaded');

			if (this.__loadPromiseResolver) {
				this.__loadPromiseResolver();
			}
		},
		onConnected(metamask) {
			this.connectedAddress = metamask.connectedAddress;
			this.connectedNetId = metamask.connectedNetId;
			this.metamask = metamask;

			this.$emit('connected', metamask);
		},
		onDisconnected() {
			this.connectedAddress = null;
			this.connectedNetId = null;
			this.metamask = null;

			this.$emit('disconnected');
		},
		onNotinstalled() {
			this.connectedAddress = null;
			this.connectedNetId = null;
			this.metamask =null;

			this.$emit('notinstalled');
		},
	},
	mounted: function() {
	},
	unmounted: function() {
	},
	computed: {
	}
}
</script>


<style>

</style>