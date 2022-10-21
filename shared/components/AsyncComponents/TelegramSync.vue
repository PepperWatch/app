<template>

	<div>
	</div>

</template>

<style>
</style>

<script>
import Telegram from '../../classes/Telegram.js';

export default {
	name: 'TelegramSync',
	data() {
		return {
		}
	},
	emits: ['wait', 'loaded', 'connected', 'disconnected'],
	components: {
	},
	methods: {
	},
	mounted: function() {
		this.telegram = Telegram.getSingleton();

		this.telegram.addEventListener('wait', (e) => {
			this.$emit('wait', e.detail.what);
		});
		this.telegram.addEventListener('disconnected', () => {
			this.$emit('disconnected', this.telegram);
		});
		this.telegram.addEventListener('connected', () => {
			this.$emit('connected', this.telegram);
		});
		this.$emit('loaded', this.telegram);
	},
	computed: {
	}
}
</script>
