<template>

	<div class="fullscreen videoBack">

		<div class="row">
			<div class="col-12 col-md-10 text-center">

				<div :class="{ videohere: true, videovisible: !initializing, }">
					<div class="videoherein absolute-center">
						<video v-if="urlDebounced" :src="urlDebounced" @play="onCanPlay" @error="onError" ref="video" muted autoplay loop controls />
					</div>
				</div>

			</div>
		</div>

        <q-inner-loading :showing="initializing">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
	</div>

</template>
<script>

export default {
	name: 'VideoPlayer',
	props: {
		url: {
			type: String,
			default: null,
		},
	},
	data() {
		return {
			initializing: true,
			videoWidth: null,
			videoHeight: null,

			urlDebounced: null,
		}
	},
	methods: {
		onError() {
			this.urlDebounced = null;
			this.__onErrorRetryTimeout = setTimeout(()=>{
				this.urlDebounced = this.url;
			}, 1000);
		},
		onCanPlay() {
			this.videoWidth = this.$refs.video.videoWidth;
			this.videoHeight = this.$refs.video.videoHeight;
			// alert(this.$refs.video.videoWidth);
			// alert(this.$refs.video.videoHeight);
			// alert(this.$refs.video.duration);
			this.initializing = false;
		}
	},
	mounted() {
		this.urlDebounced = this.url;

		this.$watch('url', ()=>{
			clearTimeout(this.__onErrorRetryTimeout);

			this.initializing = true;
			const newUrl = this.url;
			setTimeout(()=>{
				this.urlDebounced = newUrl;
			}, 1000);
		});
	}
}
</script>
<style scoped="scoped">

	.videoBack {
		z-index: 1;
	}

	.body--dark .videoBack {
		background: black;
	}

	.videohere {
		height: 100vh;
		position: relative;
		display: inline-block;
		opacity: 0;
		transition: opacity 1s ease-in-out;
	}

	.videohere.videovisible {
		opacity: 1;
	}


	.videohere video {
		max-height: 80vh;
		max-width: 90vw;
	}

	.videoherein {

	}

</style>
