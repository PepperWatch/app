<template>
	<!-- notice dialogRef here -->
	<q-dialog ref="dialog" @hide="onDialogHide">
		<div  class="q-dialog-plugin non-selectable"  style="width: 500px">
			<q-card>
				<q-list>
					<q-item>
						<q-item-section top class="q-ml-none">
							<PrepareFileDialogPreview ref="preview" :file="file" :edit="previewEdit" @blur="onBlur" @range="onRange" />
							<!-- <img :src="previewImageURL" style="width: 100%"> -->
						</q-item-section>
					</q-item>


					<div class="prepareFileDialogMenuBlock" :class="{prepareFileDialogMenuBlockActive: (selectedUploadMethod == null)}">

						<DialogMenuItem @click="onUploadRaw"
							title="Upload As Is"
							description="Just as you do from Telegram application"
							icon="visibility" />
						<DialogMenuItem @click="onClickEncoded"
							title="Upload Encoded"
							description="Keep preview visisble, but let full version available only to you"
							icon="lock" />

					</div>

					<div class="prepareFileDialogMenuBlock" :class="{prepareFileDialogMenuBlockActive: (selectedUploadMethod == 'encoded' && !containerBlob)}">

						<DialogMenuItem @click="onClickBlur"
							title="Blur Public Media"
							description="Change blur settings of public media preview"
							icon="water_drop"
							:disable="generatingPreview"
							:active="previewEdit == 'blur'"
							/>
						<DialogMenuItem @click="onClickRange"
							title="Range Public Media"
							description="Select part of video visible in public preview"
							icon="schedule"
							v-if="preparedType == 'video'"
							:disable="generatingPreview"
							:active="previewEdit == 'range'"
							/>

						<q-separator spaced  />

						<DialogMenuItem @click="onClickDoGenerate"
							title="Generate Public Preview"
							description="Generate public media preview in browser"
							icon="done"
							:loading="generatingPreview"
							:disable="generatingPreview"
							/>

					</div>

					<div class="prepareFileDialogMenuBlock"
					:class="{prepareFileDialogMenuBlockActive: (selectedUploadMethod == 'encoded' && containerBlob)}" >

						<div class="prepareFileDialogMenuBlock"
						:class="{prepareFileDialogMenuBlockActive: (encodingShowPassword)}" >
							<DialogPasswordInput
								v-model="encodingPassword"
								:errorMessage="encodingPasswordError"
								:disable="encoding"
								/>
						</div>

						<DialogMenuItem @click="onClickDoEncodeWithPassword"
							:title="(encodingShowPassword ? 'Encode the Media with Password and Upload' : 'Encode the Media with Password')"
							description="Encode private media and hide it in the public preview"
							icon="lock"
							:loading="encoding" />

					</div>

					<q-separator spaced  />

					<DialogMenuItem @click="onCancelClick"
						title="Cancel"
						icon="close" />
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

	.prepareFileDialogMenuBlock {
		max-height: 0;
		transition: max-height 0.3s ease-out;
		overflow: hidden;
	}

	.prepareFileDialogMenuBlockActive {
		max-height: 500px;
		transition: max-height 0.3s ease-in;
	}
</style>
<script>
import MP4StegAsync from 'shared/components/AsyncComponents/MP4StegAsync.js';
import PrepareFileDialogPreview from './PrepareFileDialogPreview.vue';
import DialogMenuItem from 'shared/components/Helpers/DialogMenu/DialogMenuItem.vue';
import DialogPasswordInput from 'shared/components/Helpers/DialogMenu/DialogPasswordInput.vue';
import VideoProcessor from 'shared/classes/VideoProcessor.js';

export default {
	props: {
		// ...your custom props
		file: Object,
	},

	components: {
		MP4StegAsync,
		PrepareFileDialogPreview,
		DialogMenuItem,
		DialogPasswordInput,
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

            selectedUploadMethod: null,

            previewEdit: null,
            blur: 5,
            range: {
				min: 0,
				max: 1,
            },

            generatingPreview: false,
            containerBlob: null,

            finalFile: null,
            finalThumb: null,

            sampleWidth: null,
            sampleHeight: null,
            sampleDuration: null,

            encoding: false,
            encodingShowPassword: false,
            encodingPassword: '',
            encodingPasswordError: '',
        }
    },

	methods: {
		async initialize() {
			this.preparedSize = this.file.size;

            const re = /(?:\.([^.]+))?$/;
            const extension = (''+re.exec(this.file.name)[1]).toLowerCase();

            const photoExts = ['png', 'jpg', 'jpeg'];
            const videoExts = ['mp4', 'mpeg', 'avi', 'mov', 'webm'];

            if (photoExts.indexOf(extension) !== -1) {
                this.preparedType =  'photo';
            } else if (videoExts.indexOf(extension) !== -1) {
                this.preparedType =  'video';
            }

            this.containerBlob = this.file;

			// this.preparedType = await this.telegramFile.getType();
			// this.previewImageURL = await this.telegramFile.getHighPreview();
		},

		async onClickDoGenerate() {
			this.generatingPreview = true;

			const videoProcessor = new VideoProcessor({
				file: this.file,
			});

			let preview = null;
			if (this.preparedType == 'video') {
				console.log('range', this.range.min, this.range.max);
				preview = await videoProcessor.makePreview({
					fromSeconds: this.range.min,
					toSeconds: this.range.max,
					blurValue: this.blur,
				});
			} else if (this.preparedType == 'photo') {
				preview = await videoProcessor.downsampleImage({
					duration: 1,
					blurValue: this.blur,
				});

				const thumbVideoProcessor = new VideoProcessor({
					file: preview,
				});
				const screenshotBlob = await thumbVideoProcessor.getScreenShotBlob(0);
				this.finalThumb = screenshotBlob;
			}

			this.containerBlob = preview;
			// console.error('preview', preview);
			//
			if (this.preparedType == 'video') {
				const screenshotBlob = await videoProcessor.getScreenShotBlob(this.range.min);
				this.finalThumb = screenshotBlob;

				this.sampleWidth = videoProcessor.sampleWidth;
				this.sampleHeight = videoProcessor.sampleHeight;
				this.sampleDuration = this.range.max - this.range.min;
			}


			this.generatingPreview = false;
			this.previewEdit = null;
		},

		async onClickDoEncodeWithPassword() {
			if (!this.encodingShowPassword) {
				this.encodingShowPassword = true;
				return false;
			}

			if (this.encodingPassword.length < 6) {
				clearTimeout(this.__encodingPasswordErrorTimeout);
				this.encodingPasswordError = 'Password is too short';
				this.__encodingPasswordErrorTimeout = setTimeout(()=>{
					this.encodingPasswordError = '';
				}, 1000);
				return false;
			}

			this.encoding = true;

			const mp4Steg = await window.newMP4Steg(); // MP4StegAsync component should be present on the page
			console.error('mp4Steg', mp4Steg);

			// const randomKey = window.crypto.getRandomValues(new Uint8Array(32));

			mp4Steg.setPassword(this.encodingPassword);

			await mp4Steg.loadFile({file: this.containerBlob});
			console.error(mp4Steg._atoms);

			const id = (''+Math.random()).split('0.').join('');
			const meta = {

			};

			await mp4Steg.embedFile({file: this.file, meta: {id: id, meta:meta}});
			const writable = await mp4Steg.embed();
			const blob = await writable.toBlob();

			this.finalFile = new window.File([blob], ''+id+'.mp4', {
				lastModified: Date.now(),
				type: 'video/mp4',
			});

			this.encoding = false;

			this.onOKClick();
		},

		onClickEncoded() {
			this.selectedUploadMethod = 'encoded';
			this.containerBlob = null;
			this.$refs.preview.setBlur(5);
		},

		onBlur(value) {
			console.error('blur', value);

			this.blur = value;
		},
		onClickBlur() {
			this.previewEdit = 'blur';
		},

		onRange(value) {
			this.range = value;
		},
		onClickRange() {
			this.previewEdit = 'range';
		},

		async onUploadRaw() {
			if (this.preparedType == 'video') {
				const videoProcessor = new VideoProcessor({
					file: this.file,
				});

				this.finalFile = this.file;
				const screenshotBlob = await videoProcessor.getScreenShotBlob(this.range.min);
				this.finalThumb = screenshotBlob;

				this.sampleWidth = videoProcessor.sampleWidth;
				this.sampleHeight = videoProcessor.sampleHeight;
				this.sampleDuration = videoProcessor.originalDuration;
			} else if (this.preparedType == 'photo') {
				this.finalFile = this.file;
			}

			this.onOKClick();
		},

		// async onUploadEncoded() {
		// 	const res = await fetch('//commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4');
		// 	const containerBlob = await res.blob();

		// 	this.telegramFile.uploadEncoded(containerBlob);

		// 	this.onOKClick();
		// },

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
			this.$emit('ok', {
				file: this.finalFile,
				thumb: this.finalThumb,
				width: this.sampleWidth,
				height: this.sampleHeight,
				duration: this.sampleDuration,
			});
			// or with payload: this.$emit('ok', { ... })

			// then hiding dialog
			this.hide()
		},

		onCancelClick () {
			if (!this.selectedUploadMethod) {
				// we just need to hide the dialog
				this.hide();
			} else {
				if (this.encodingShowPassword) {
					this.encodingShowPassword = false;
				} else {
					this.selectedUploadMethod = null;
					this.$refs.preview.setBlur(0);
				}
			}
		}
	}
}
</script>