<template>

	<div></div>

</template>


<script>
import Metamask from 'shared/classes/Metamask.js';

export default {
	name: 'MetamaskSync',
    props: {
        auto: {
			type: Boolean,
			default: false,
		},
    },
	data() {
		return {
			isLoaded: true,
			isConnected: false,

			connectedAddress: null,
			connectedNetId: null,
		}
	},
	emits: ['connectstart', 'connectend', 'connected', 'loaded', 'disconnected', 'notinstalled'],
	components: {
	},
	watch: {
	},
	methods: {
		onNotInstalled() {
			this.$emit('notinstalled');
		},
		async autoConnectIfNeeded() {
			if (this.auto) {
				const isAlreadyConnected = await this._metamask.isAlreadyConnected();
				if (isAlreadyConnected) {
					this.connect();
				}
			}
		},
		async connect() {
			this.$emit('connectstart');

			try {
				await this._metamask.connect();
			} catch (e) {
				console.error(e);
			}

			if (!this.isConnected) {
				// check if it was already connected, before had a chance to send event to this component
				if (this._metamask && this._metamask._isConnected) {
					this.onConnected();
				}
			}

			this.$emit('connectend');

			return this.isConnected;
		},
		onConnected() {
			if (!this.isConnected) {
				this.connectedAddress = this._metamask.connectedAddress;
				this.connectedNetId = this._metamask.connectedNetId;
				this.isConnected = true;

				this.$emit('connected', this._metamask);
			} else {
				// may be the change of account or address
				if (this.connectedAddress != this._metamask.connectedAddress || this.connectedNetId != this._metamask.connectedNetId) {
					// do like we disconnected and connected again
					this.connectedAddress = null;
					this.connectedNetId = null;

					this.$emit('disconnected');

					if (this._metamask.connectedAddress && this._metamask.connectedNetId) {
						this.connectedAddress = this._metamask.connectedAddress;
						this.connectedNetId = this._metamask.connectedNetId;

						this.$emit('connected', this._metamask);
					}
				}
			}
		},
	},
	mounted: function() {
		const metamask = Metamask.getSingleton();
		this._metamask = metamask;

		this.__metamaskConnectedHandler = ()=>{
			this.onConnected();
		};
		this.__metamaskNotInstalledHandler = ()=>{
			this.onNotInstalled();
		};
		this._metamask.addEventListener('connected', this.__metamaskConnectedHandler);
		this._metamask.addEventListener('notinstalled', this.__metamaskNotInstalledHandler);

		this.$emit('loaded');

		this.autoConnectIfNeeded();
	},
	unmounted: function() {
		this._metamask.removeEventListener('connected', this.__metamaskConnectedHandler);
		this._metamask.removeEventListener('notinstalled', this.__metamaskNotInstalledHandler);
	},
	computed: {
	}
}
</script>


<style>

</style>