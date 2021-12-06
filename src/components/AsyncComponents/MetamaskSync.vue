<template>

	<div>
	</div>

</template>

<style>
</style>

<script>
import Metamask from '../../classes/Metamask.js';

export default {
	name: 'MetamaskSync',
	data() {
		return {
		}
	},
	emits: ['connected', 'loaded'],
	components: {
	},
	methods: {
		async test() {
		},
		connect() {
			this.metamask.connect();
		},
	},
	mounted: function() {
		this.metamask = Metamask.getSingleton();

		this.metamask.addEventListener('connected', () => {
			this.$emit('connected', this.metamask);
		});

		this.$emit('loaded');
	},
	computed: {
	}
}
</script>
