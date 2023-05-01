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

						<DialogCheckboxInput
							v-model="decodingPersistPassword"
							:disable="decoding"
							label="persist password for this session"
							/>
						<q-separator spaced  />
					</div>

					<DialogMenuItem @click="onClickDecodeWithPassword"
						:title="(decodingShowPassword ? 'Decode Content And View It' : 'Decode Content With Password')"
						description="Try to decode container content with plain text password"
						icon="lock"
						:disable="decoding"
						:loading="decoding" />

					<q-separator spaced  />

					<div class="prepareFileDialogMenuBlock"
					:class="{prepareFileDialogMenuBlockActive: (!decodingShowPassword)}" >


						<DialogMenuItem @click="onClickDecodeWithMetamask"
							:title="'Decode Content With Metamask'"
							:description="decodingPasswordError ? 'Nothing found in this container' : 'Try to decode container using Metamask'"
							icon="metamask"
							:disable="decoding"
							:loading="decoding" />


						<q-separator spaced  />
					</div>

					<MetamaskOnRequest ref="metamask" auto />

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
import DialogCheckboxInput from 'shared/components/Helpers/DialogMenu/DialogCheckboxInput.vue';
import MetamaskOnRequest from 'shared/components/AsyncComponents/MetamaskOnRequest.vue';

export default {
	props: {
		// ...your custom props
		telegramFile: Object,
	},

	components: {
		DialogMenuItem,
		DialogPasswordInput,
		DialogCheckboxInput,

		MetamaskOnRequest,
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

			decodingPersistPassword: false,
		}
	},

	methods: {
		async onClickDecodeWithMetamask() {
			this.decoding = true;
			let expectedSize = 0;

			expectedSize = await this.telegramFileToShow.size();

			if (!expectedSize) {
				this.decoding = false;
				return false;
			}

			const message = "Generate the key to encrypt/decrypt MP4 of size: "+expectedSize+"\n\nPlease be sure you are on pepperwatch.com domain and https is on";

            const metamask = await this.$refs.metamask.request();

			console.error('metamask', metamask);
            if (!metamask) {
				// metamask not installed or user declined connection

				this.decoding = false;
				return false;
            }

            let key = null;

            try {
				key = await metamask.signMessage(message);
			} catch (e) {
				console.error(e);
            }

			if (!key) {
				this.decoding = false;
				return false;
			}

			let decodedContentFiles = null;
			try {
				decodedContentFiles = await this.telegramFileToShow.tryToDecodeWith(''+key);
			} catch(e) {
				console.error(e);

				decodedContentFiles = null;
			}

			let success = false;
			if (decodedContentFiles && decodedContentFiles.length) {
				success = true;
			}

			if (!success) {
				this.decodingPasswordError = 'Can not decode anything in this container';
				setTimeout(()=>{
					this.decodingPasswordError = '';
				}, 1000);
			} else {
				const contentFile = decodedContentFiles[0];
				if (contentFile) {
					await contentFile.prepare();
				}


				this.$emit('decoded');
			}

			console.error('decoding2');
			this.decoding = false;
		},
		async onDoDecode() {
			if (this.decodingPersistPassword) {
				this.$q.sessionStorage.set('decodeEncodePassword', this.decodingPassword);
			} else {
				this.$q.sessionStorage.set('decodeEncodePassword', null);
			}

			this.decoding = true;
			console.error('decoding');

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
				const contentFile = decodedContentFiles[0];
				if (contentFile) {
					await contentFile.prepare();
				}


				this.$emit('decoded');
			}

			console.error('decoding2');
			this.decoding = false;
		},
		onClickDecodeWithPassword() {
			if (!this.decodingShowPassword) {
				const persistedPassword = this.$q.sessionStorage.getItem('decodeEncodePassword');
				if (persistedPassword) {
					this.decodingPassword = persistedPassword;
					this.decodingPersistPassword = true;
				}

				this.decodingShowPassword = true;
			} else {
				this.onDoDecode();
			}
		},
		onCancelClick() {
			this.decodingPassword = '';

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