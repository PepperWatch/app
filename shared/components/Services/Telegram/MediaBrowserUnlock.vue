<template>

	<q-dialog ref="dialog" v-model="showing" @hide="onHide">
		<div class="q-dialog-plugin non-selectable" style="width: 500px">
			<q-card>
				<q-list>

					<div class="prepareFileDialogMenuBlock"
					:class="{prepareFileDialogMenuBlockActive: (decodingShowPassword)}" >
						<DialogPasswordInput
							v-model="decodingPassword"
							:disable="decoding"
							:errorMessage="decodingPasswordError"
							@enter="onClickDecodeWithPassword"
							autofocus
							/>
					</div>

					<DialogMenuItem @click="onClickDecodeWithPassword"
						:title="(decodingShowPassword ? 'Decode Content And View It' : 'Decode Content With Password')"
						description="Try to decode container content with plain text password"
						icon="lock"
						:disable="decoding"
						:loading="decoding" />

					<q-separator spaced  />

					<DialogMenuItem @click="onCancelClick"
						title="Cancel"
						icon="close" />

				</q-list>
			</q-card>
		</div>
	</q-dialog>

</template>
<style type="text/css">
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
import DialogMenuItem from 'shared/components/Helpers/DialogMenu/DialogMenuItem.vue';
import DialogPasswordInput from 'shared/components/Helpers/DialogMenu/DialogPasswordInput.vue';

export default {
	props: {
		// ...your custom props
		telegramFile: Object,
	},

	components: {
		DialogMenuItem,
		DialogPasswordInput,
	},

	emits: ['hide', 'decoded'],

	data() {
		return {
			showing: false,
			telegramFileToShow: null,

			decoding: false,

			decodingShowPassword: false,
			decodingPassword: '',
			decodingPasswordError: null,
		}
	},

	methods: {
		async onDoDecode() {
			this.decoding = true;

			let decodedContentFiles = null;
			try {
				decodedContentFiles = await this.telegramFileToShow.tryToDecodeWith(this.decodingPassword);
			} catch(e) {
				console.error(e);

				decodedContentFiles = null;
			}

			let success = false;
			if (decodedContentFiles && decodedContentFiles.length) {
				success = true;
			}

			if (!success) {
				this.decodingPasswordError = 'Can not decode anything with this password';
				setTimeout(()=>{
					this.decodingPasswordError = '';
				}, 1000);
			} else {
				this.$emit('decoded');
			}

			this.decoding = false;
		},
		onClickDecodeWithPassword() {
			if (!this.decodingShowPassword) {
				this.decodingShowPassword = true;
			} else {
				this.onDoDecode();
			}
		},
		onCancelClick() {
			if (this.decodingShowPassword) {
				this.decodingShowPassword = false;
			} else {
				this.hide();
			}
		},
		async initialize() {
		},
		hide() {
			this.$refs.dialog.hide();
		},
		onHide() {
			this.$emit('hide');
		},
	},

	watch: {
		async telegramFile() {
			if (this.telegramFile) {
				this.telegramFileToShow = this.telegramFile;
				this.showing = true;
			} else {
				this.showing = false;
			}
		}
	}
}
</script>