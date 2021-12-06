<template>

	<div>

		<div v-if="!signedAddress">
			<q-btn stretch color="primary" label="Connect to Metamask" @click="connect" />
		</div>
		<div v-if="signedAddress">
			<q-btn stretch color="primary" :label="displayLabel" disabled />
		</div>

	</div>

</template>

<style>
</style>

<script>
import Metamask from '../../classes/Metamask.js';

export default {
	name: 'ConnectWithMetamask',
	data() {
		return {
			signedAddress: null,
			chainType: null,
			metamask: null,
		}
	},
    emits: ['connected'],
	components: {
	},
	methods: {
		connect() {
			this.metamask.connect();
		},
	},
	mounted: function() {
		this.metamask = Metamask.getSingleton();
		this.metamask.addEventListener('connected', () => {
			this.signedAddress = this.metamask.connectedAddress;
			this.chainType = this.metamask.connectedNetName;

			this.$emit('connected', this.metamask);
		});
	},
	computed: {
		displayLabel() {
			return (''+this.signedAddress).substr(0,5)+'...'+(''+this.signedAddress).substr(-5)+' on '+this.chainType;
		}
	}
}
</script>
