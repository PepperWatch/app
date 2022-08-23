<template>

	<q-card class="home-card" v-if="video" @mouseenter="onMouseenter" @mouseleave="onMouseleave" @click="onClick" ref="card">
		<q-img :src="thumbURL" @load="imageLoaded" ref="image">
		<div class="absolute-bottom text-subtitle2 text-center">
			{{video.title}}
		</div>
		</q-img>

		<div  :class="{ videoPart: true, videoPartVisible: (showVideoPart && videoCanPlay), }">
			<video v-if="showVideoPart && videoURL" :src="videoURL" @play="onCanPlay" ref="video" muted autoplay loop />
		</div>
	</q-card>

</template>
<script>

export default {
	name: 'HomeCard',
	props: {
		video: {
			type: Object,
			default: null,
		},
	},
	data() {
		return {
			initializing: true,
			mouseenter: false,

			urlDebounced: null,
			showVideoPart: false,

			videoCanPlay: false,
		}
	},
	methods: {
		onClick() {
			if (this.video.mintIpfsHash) {
				this.$router.push({ path: '/v/'+this.video.mintIpfsHash });
			}
		},
		onCanPlay() {
			this.videoCanPlay = true;
		},
		imageLoaded() {
			setTimeout(()=>{

				// alert(this.$el.querySelector('img').height);
			}, 100);

			this.$emit('loaded');
		},
		onMouseenter() {
			this.mouseenter = true;
			this.showVideoPart = true;
		},
		onMouseleave() {
			this.mouseenter = false;
			this.showVideoPart = false;
		}
	},
	computed: {
		thumbURL: function() {
			if (this.video && this.video.publicThumbIpfsHash) {
				return 'https://arweave.net/'+this.video.publicThumbIpfsHash;
			}

			return null;
		},
		videoURL: function() {
			if (this.video && this.video.encodedIpfsHash) {
				return 'https://arweave.net/'+this.video.encodedIpfsHash;
			}

			return null;
		}
	},
	mounted() {
	}
}
</script>
<style scoped="scoped">

	.videoPart {
		opacity: 0;
		position: absolute;
		z-index: 999;
		left: 0; right: 0; top: 0; bottom: 0;
		transition: opacity 1s ease-in-out;
	}
	.videoPart.videoPartVisible {
		opacity: 1;
	}
	video {
		max-width: 100%;
		max-height: 100%;
	}

</style>
