<template>
	<!-- notice dialogRef here -->
	<q-dialog ref="dialog" @hide="onDialogHide">
		<div  class="q-dialog-plugin non-selectable	"  style="width: 500px">
			<q-card>
				<q-list>
					<q-item>
						<q-item-section top class="q-ml-none">
							<UploadDialogBlurer :telegramFile="telegramFile" :edit="previewEdit" />
							<!-- <img :src="previewImageURL" style="width: 100%"> -->
						</q-item-section>
					</q-item>

					<q-separator spaced  />

					<q-item clickable @click="onUploadRaw">
					<q-item-section avatar class="q-pl-md">
					<q-icon color="primary" name="visibility" />
					</q-item-section>

					<q-item-section>
					<q-item-label>Upload As Is</q-item-label>
					<q-item-label caption>Just as you do from Telegram application</q-item-label>
					</q-item-section>
					</q-item>

					<q-item clickable @click="onUploadEncoded">
					<q-item-section avatar class="q-pl-md">
					<q-icon color="primary" name="lock" />
					</q-item-section>

					<q-item-section>
					<q-item-label>Upload Encoded</q-item-label>
					<q-item-label caption>Keep preview visisble, but let full version available only to you</q-item-label>
					</q-item-section>
					</q-item>

					<q-separator spaced  />

					<q-item clickable @click="onClickBlur">
					<q-item-section avatar class="q-pl-md">
					<q-icon color="primary" name="water_drop" />
					</q-item-section>

					<q-item-section>
					<q-item-label>Blur Public Media</q-item-label>
					<q-item-label caption>Change blur settings of public media preview</q-item-label>
					</q-item-section>
					</q-item>

					<q-item clickable @click="onClickRange">
					<q-item-section avatar class="q-pl-md">
					<q-icon color="primary" name="schedule" />
					</q-item-section>

					<q-item-section>
					<q-item-label>Range Public Media</q-item-label>
					<q-item-label caption>Select part of video visible in public preview</q-item-label>
					</q-item-section>
					</q-item>

					<q-separator spaced  />

					<q-item clickable @click="onClickRange">
					<q-item-section avatar class="q-pl-md">
					<q-icon color="primary" name="done" />
					</q-item-section>

					<q-item-section>
					<q-item-label>Encode</q-item-label>
					<q-item-label caption>Process encoding in browser</q-item-label>
					</q-item-section>
					</q-item>

					<q-separator spaced  />


					<q-item clickable  @click="onCancelClick" >
					<q-item-section avatar class="q-pl-md">
					<q-icon color="primary" name="close" />
					</q-item-section>

					<q-item-section>
					<q-item-label>Cancel</q-item-label>
					</q-item-section>
					</q-item>
				</q-list>

			</q-card>
		</div>

		<MP4StegAsync />
	</q-dialog>
</template>
<style type="text/css">
	.q-dialog-plugin {
		background: black;
	}
</style>
<script>
import MP4StegAsync from 'shared/components/AsyncComponents/MP4StegAsync.js';

import UploadDialogBlurer from './UploadDialogBlurer.vue';

export default {
	props: {
		// ...your custom props
		telegramFile: Object,
	},

	components: {
		MP4StegAsync,
		UploadDialogBlurer,
	},

	emits: [
		// REQUIRED
		'ok', 'hide'
	],

    data() {
        return {
            preparedSize: 0,
            preparedType: null,
            previewImageURL: null,

            previewEdit: null,
        }
    },

	methods: {
		async initialize() {
			this.preparedSize = await this.telegramFile.size();
			this.preparedType = await this.telegramFile.getType();
			this.previewImageURL = await this.telegramFile.getHighPreview();
		},

		onClickBlur() {
			this.previewEdit = 'blur';
		},

		onClickRange() {
			this.previewEdit = 'range';
		},

		onUploadRaw() {
			this.telegramFile.upload();
			this.onOKClick();
		},

		async onUploadEncoded() {
			const res = await fetch('//commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4');
			const containerBlob = await res.blob();

			this.telegramFile.uploadEncoded(containerBlob);

			this.onOKClick();
		},

		// following method is REQUIRED
		// (don't change its name --> "show")
		show () {
			this.$refs.dialog.show();
			this.initialize();
		},

		// following method is REQUIRED
		// (don't change its name --> "hide")
		hide () {
			this.$refs.dialog.hide()
		},

		onDialogHide () {
			// required to be emitted
			// when QDialog emits "hide" event
			this.$emit('hide')
		},

		onOKClick () {
			// on OK, it is REQUIRED to
			// emit "ok" event (with optional payload)
			// before hiding the QDialog
			this.$emit('ok')
			// or with payload: this.$emit('ok', { ... })

			// then hiding dialog
			this.hide()
		},

		onCancelClick () {
			// we just need to hide the dialog
			this.hide()
		}
	}
}
</script>