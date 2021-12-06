<template>

	<div v-if="maintenance">

		<q-input dark borderless v-model="text" input-class="text-right" class="q-ml-md" />

	</div>

</template>

<style>
</style>

<script>

export default {
	name: 'MaintenanceSwitcher',
	data() {
		return {
			text: '',
		}
	},
	watch: {
		text: function () {
			if (this.text == 'show') {
				this.$store.dispatch('maintenance/disable');
			}
		}
	},
	computed: {
		maintenance: function() {
			return this.$store.state.maintenance.maintenance;
		}
	},
	components: {
	},
	methods: {
		checkBuffer(buffer) {
			const str = buffer.slice(-4).join('');
			if (str == 'show') {

				// this.$store.
				this.$store.dispatch('maintenance/disable');
			}
			// alert(str);
		},
	},
	mounted: function() {
		// document.addEventListener('keydown', event => {
		// 	const charList = 'abcdefghijklmnopqrstuvwxyz0123456789';
		// 	const key = event.key.toLowerCase();

		// 	// we are only interested in alphanumeric keys
		// 	if (charList.indexOf(key) === -1) return;

		// 	buffer.push(key);
		// 	console.log(buffer);
		// 	this.checkBuffer(buffer);
		// });
	}
}
</script>
