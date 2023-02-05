<template>

	<q-dialog v-model="showing" position="bottom" @hide="onHide">
		<q-card style="min-width: 50vw; max-width: 80vw;">
			<q-linear-progress :value="0.6" color="primary" />
			<q-card-section class="mediaBrowserDisplay">
				<img :src="imageSrc" v-if="showingType == 'photo' && imageSrc"  />
				<video :src="videoSrc" v-if="showingType == 'video' && videoSrc" controls  download="video.mp4" />
			</q-card-section>

			<q-space />

			<q-card-section class="text-center	">
				<q-btn flat round icon="lock_open" @click="onShowUnlock" :disabled="!thereMayBeSomethingEncoded" />
			</q-card-section>
		</q-card>

		<MediaBrowserUnlock :telegramFile="telegramFileToUnlock" @hide="onHideUnlock" @decoded="onUnlockDecoded" />
	</q-dialog>

</template>
<style type="text/css">
	.mediaBrowserDisplay {
		text-align: center;
	}

	.mediaBrowserDisplay img {
		max-height: 70vh;
		max-width: 100%;
	}

	.mediaBrowserDisplay video {
		max-height: 70vh;
		max-width: 100%;
	}

</style>
<script>
import MediaBrowserUnlock from './MediaBrowserUnlock.vue';

export default {
	props: {
		// ...your custom props
		telegramFile: Object,
	},

	components: {
		MediaBrowserUnlock,
	},

	emits: ['hide'],

	data() {
		return {
			showing: false,
			telegramFileToShow: null,
			telegramFileToUnlock: null,

			showingType: null,
			videoSrc: null,
			imageSrc: null,

			thereMayBeSomethingEncoded: false,
		}
	},

	methods: {
		async initialize() {
		},
		onHide() {
			this.$emit('hide');
		},
		onShowUnlock() {
			this.telegramFileToUnlock = this.telegramFileToShow;
		},
		onHideUnlock() {
			this.telegramFileToUnlock = null;
		},
		async onUnlockDecoded() {
			const contentFiles = this.telegramFileToUnlock.contentFiles;
			const contentFile = contentFiles[0];
			this.telegramFileToUnlock = null;

			this.showingType = await contentFile.getType();
			if (this.showingType == 'video') {
				this.videoSrc = await contentFile.getSWURL();
			} else if (this.showingType == 'photo') {
				this.imageSrc = await contentFile.getSWURL();
			}
		},
	},

	watch: {
		async telegramFile() {
			if (this.telegramFile) {
				this.telegramFileToShow = this.telegramFile;

				this.thereMayBeSomethingEncoded = false;

				this.showingType = await this.telegramFile.getType();
				if (this.showingType == 'video') {
					this.videoSrc = await this.telegramFile.getSWURL();
					this.thereMayBeSomethingEncoded = true;
				} else if (this.showingType == 'photo') {
					this.imageSrc = await this.telegramFile.getSWURL();
				}
				this.showing = true;
			} else {
				this.showing = false;
			}
		}
	}
}
</script>