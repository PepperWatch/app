<template>

	<div>
	</div>

</template>

<style>
</style>

<script>
const { MP4 } = require('mp4steg');

export default {
	name: 'MP4Steg',
	data() {
		return {
		}
	},
	emits: [],
	components: {
	},
	methods: {
		getMP4Steg() {
			return MP4;
		}
	},
	mounted: function() {

		window.newMP4StegFunc = function() {
			return new MP4();
		}
		window._newMP4StegPromiseResolver();
	},
	computed: {
	}
}
</script>
