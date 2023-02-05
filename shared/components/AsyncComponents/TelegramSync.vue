<template>

	<div>
	</div>

</template>

<style>
</style>

<script>
import TelegramThoughWorker from '../../classes/drive/telegram/TelegramThoughWorker.js';

export default {
	name: 'TelegramSync',
	data() {
		return {
		}
	},
	emits: ['wait','qr', 'loaded', 'connected', 'disconnected'],
	components: {
	},
	methods: {
	},
	mounted: function() {
		this.telegram = TelegramThoughWorker.getSingleton();

		this.telegram.addEventListener('wait', (e) => {
			this.$emit('wait', e.detail.what);
		});
		this.telegram.addEventListener('qr', (e) => {
			this.$emit('qr', e.detail.url);
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
