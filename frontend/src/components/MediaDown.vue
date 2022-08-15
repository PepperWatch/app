<template>

	<div class="relative-position">

		<q-splitter
		v-model="splitBy"
		style="height: 400px"
		>

		<template v-slot:before>
			<div class="q-pa-md">
			<div class="text-h6 q-mb-md">Original (private)</div>

			<div v-if="file">
				<div v-if="originalVideoBlobURL">
					<video :src="originalVideoBlobURL" ref="originalVideoPlayer" muted style="width: 100%; height: 300px;" controls />
				</div>
			</div>

			</div>
		</template>


		<template v-slot:after>
			<div class="q-pa-md">
			<div class="text-h6 q-mb-md">Downsampled (public)</div>

				<div :style="previewStyle" @click="areaClick">
				</div>
			</div>
		</template>

		</q-splitter>
<!--
		<q-item>
			<q-item-section avatar>
			</q-item-section>
			<q-item-section>
				<q-checkbox v-model="appendIntro" label="Append Intro" />
			</q-item-section>
		</q-item> -->

		<q-item>
		<q-item-section avatar>
		<q-icon color="deep-orange" name="water_drop" />
		</q-item-section>
		<q-item-section>
		<q-slider
		v-model="blur"
		:min="0"
		:max="maxBlur"
		:step="0.01"
		label
		color="deep-orange"
		/>
		</q-item-section>
		</q-item>

		<q-item>
			<q-item-section avatar>
				<q-icon name="schedule" />
			</q-item-section>
			<q-item-section>
				<q-range
				v-model="selection"
				:min="0"
				:step="0.01"
				:max="maxLength"
				:drag-range="true"
				label
				/>
			</q-item-section>
		</q-item>


		<q-inner-loading :showing="downloading">
			<q-spinner-gears size="50px" color="primary" />
		</q-inner-loading>
	</div>


	<div class="q-pa-md">
	<div class="row no-wrap justify-start items-start content-start">
		<div class="self-center col">
			<q-btn color="primary" :label="buttonLabel" :loading="downloading" @click="download" />
		</div>
		<div class="self-center col-9">
			<q-linear-progress size="25px" :value="progress" v-if="downloading">
				<div class="absolute-full flex flex-center">
					<q-badge color="white" text-color="primary" :label="currentStage" />
				</div>
			</q-linear-progress>
		</div>
	</div>
	</div>

	<div v-if="hasError" class="rounded-borders q-pa-md q-my-md bg-negative q-card--bordered text-white">
		Error processing. Please check the video you are trying to use. Try other settings or other file. If problem persists - contact us.
	</div>


</template>
<script>
import VideoProcessor from '../classes/VideoProcessor.js';

export default {
	name: 'MediaDown',
	props: {
		file: Object, // UserFile
		buttonLabel: {
			type: String,
			default: 'Create'
		}
	},
    emits: ['blob', 'screenshotBlob'],
	data() {
		return {
			appendIntro: false,
			quality: 600,
			blur: 0.01,
			maxBlur: 20,
			selection: {
				min: 0,
				max: 1,
			},
			maxLength: 1,
			splitBy: 50,
			originalVideoBlobURL: null,
			mediaDownsample: null,
			videoProcessor: null,
			timeframeShotURL: null,

			downloading: false,
			hasError: false,

			lastProcessedFrame: null,
			progress: null,
			currentStage: null,
		}
	},
	mounted: function() {
		if (this.file) {
			this.originalVideoBlobURL = this.file.getBlobURL();
			this.videoProcessor = new VideoProcessor({blob: this.file.file, userFile: this.file});
		}

		setInterval(()=>{
			this.areaClick();
		}, 100);

		setInterval(()=>{
			const player = this.$refs.originalVideoPlayer;
			if (player && player.readyState >= 2) {
				this.maxLength = player.duration;
			}
			if (player && (player.currentTime > this.selection.max || player.currentTime < this.selection.min)) {
				player.currentTime = this.selection.min;
			}

			if (this.videoProcessor) {
				this.videoProcessor.getReadyPercent()
					.then((val)=>{
						this.progress = val / 100;
					});
				this.currentStage = this.videoProcessor.getCurrentStage();
			}
		}, 50);
	},
	unmounted: function() {
		if (this.videoProcessor) {
			this.videoProcessor.free();
		}
	},
	watch: {
		file: async function(){
			// this.mediaDownsample = new MediaDownsample({blob: this.file.file});
			this.originalVideoBlobURL = this.file.getBlobURL();
			this.videoProcessor = new VideoProcessor({blob: this.file.file, userFile: this.file});

			setTimeout(async ()=>{
				// const finalBlob = await this.mediaDownsample.mergeFiles(0, 6);
				// this.mediaDownsample.downloadBlob(finalBlob);
			}, 1000);
		},
		quality: function() {
			// this.mediaDownsample.setMaxDimension(this.quality);
		},
		blur: function() {
			this.videoProcessor.setBlurSettings(this.blur, this.maxBlur, 500);
		}
	},
	methods: {
		async download() {
			this.hasError = false;
			this.downloading = true;

			try {
				const screenshotBlob = await this.videoProcessor.getSrcreenShotBlob((this.selection.min + this.selection.max) / 2);
				this.$emit('screenshotBlob', screenshotBlob);

				const blob = await this.videoProcessor.makePreview(this.selection.min, this.selection.max, this.appendIntro);
				this.$emit('blob', blob);
			} catch(e) {
				console.error(e);

				this.hasError = true;
			}

			// await this.mediaDownsample.generateDownsampledAndPrependTheIntro(this.selection.min, this.selection.max);
			// this.mediaDownsample.downloadBlob(finalBlob);

			this.downloading = false;
		},
		async areaClick() {
			if (!this.$refs.originalVideoPlayer ) {
			// if (!this.$refs.originalVideoPlayer || this.downloading) {
				return;
			}

			const timeToSeek = this.$refs.originalVideoPlayer.currentTime;
			this.timeframeShotURL = await this.videoProcessor.getScreenShotURL(timeToSeek);
			// alert(timeToSeek);

			// await this.mediaDownsample.seekToTime(timeToSeek);
			// await new Promise((res)=> setTimeout(res, 100));
			// this.timeframeShotURL = await this.mediaDownsample.getScreenshot();
		}
	},
	computed: {
		previewStyle() {
			return 'width: 100%; height: 300px; background-image: url("'+this.timeframeShotURL+'"); background-size: contain; background-position: center center; background-repeat: no-repeat';
		}
	}
}
</script>
<style>
</style>
