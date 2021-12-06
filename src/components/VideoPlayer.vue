<template>

	<div>
		<div v-if="videoAvailable">
			<video :src="videoSrc" controls/>
		</div>
	</div>

</template>
<script>
// import UserFile from '../classes/UserFile.js';

export default {
	name: 'VideoPlayer',
	props: {
		blob: Object, // UserFile
	},
	data() {
		return {
			videoSrc: null,
			videoAvailable: false,
		}
	},
	watch: {
		blob: function() {
			this.prepareBlob();
		}
	},
	methods: {
		prepareBlob() {
			const objectURL = URL.createObjectURL(this.blob);
			this.videoSrc = objectURL;
			this.videoAvailable = true;
		}
	},
	computed: {
	},
	mounted() {
		this.prepareBlob();
	}
}
</script>
<style>
	video {
		max-width: 100%;
		max-height: 300px;
	}
</style>
