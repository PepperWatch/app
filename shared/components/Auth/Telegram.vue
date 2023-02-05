<template>

	<q-btn color="white" text-color="primary" unelevated @click="showDialog = true;" :loading="isConnecting || isDisconnecting">
		<div v-if="isConnected"><img v-if="photo" :src="photo" class="dialog_profile_photo"/> Disconnect</div>
		<div v-if="!isConnected">Connect</div>
	</q-btn>

	<q-dialog v-model="showDialog" ref="telegramDialog" @hide="onHideDialog">
		<q-card style="min-width: 50vw; max-width: 80vw;">

			<div style="min-height: 70px;" class="relative-position">
				<q-list style="height: 70px; overflow: hidden;">
					<DialogInput
						v-model="phoneNumber"
						label="Phone Number"
						v-if="waitingFor.phoneNumber"
						@enter="next"
						mask="+######################"
						autofocus
						/>
					<DialogInput
						v-model="code"
						label="Code"
						v-if="waitingFor.code"
						@enter="next"
						autofocus
						/>
					<DialogPasswordInput
						v-model="password"
						v-if="waitingFor.password"
						label="Password"
						@enter="next"
						autofocus
						/>
				</q-list>

				<div v-if="isConnecting && qr" style="text-align: center;">
					<img :src="qr" height="256" />
				</div>

				<q-inner-loading :showing="(isConnecting && !isWaiting && !qr) || isDisconnecting">
					<q-spinner-rings size="45px" color="primary" />
				</q-inner-loading>

				<div v-if="isConnected" class="absolute-center non-selectable">
					Connected as <img v-if="photo" :src="photo" class="dialog_profile_photo"/> {{username}}
				</div>
				<div v-if="!isConnected && !isConnecting" class="absolute-center non-selectable	">
					Connect&nbsp;your&nbsp;Telegram&nbsp;account
				</div>
			</div>



			<q-card-section style="max-height: 50vh">
				<q-btn label="Connect With Code" type="submit" color="primary" @click="connect(false)" ripple no-caps unelevated v-if="!isConnecting && !isConnected" style="width: 100%"/>

				<q-btn label="Connect With QR" type="submit" color="primary" @click="connect(true)" ripple no-caps unelevated v-if="!isConnecting && !isConnected" style="width: 100%; margin-top: 8px;"/>

				<q-btn label="Next" type="submit" color="primary" @click="next" ripple no-caps unelevated :disable="!isWaiting" v-if="isConnecting" style="width: 100%"/>
				<q-btn label="Disconnect" type="submit" color="primary" @click="disconnect" ripple no-caps unelevated v-if="isConnected" style="width: 100%" :loading="isDisconnecting"/>

			</q-card-section>
		</q-card>
	</q-dialog>

	<TelegramAsync @loaded="telegramLoaded" @connected="onConnected" @disconnected="onDisconnected" @qr="onQRCode" />

</template>
<script>

import TelegramAsync from 'shared/components/AsyncComponents/TelegramAsync.js';
import DialogPasswordInput from 'shared/components/Helpers/DialogMenu/DialogPasswordInput.vue';
import DialogInput from 'shared/components/Helpers/DialogMenu/DialogInput.vue';
const { AwesomeQR } = require("awesome-qr");

export default {
	name: 'Telegram',
	props: {
		url: {
			type: String,
			default: null,
		},
	},
	components: {
		TelegramAsync,
		DialogPasswordInput,
		DialogInput,
	},
	data() {
		return {
			showDialog: false,

			phoneNumber: '',
			password: '',
			code: '',
			// apiId: 1015231,
			// apiHash: "a2848ae779266495f3cd3803f81d91e9",
			isConnecting: false,
			isDisconnecting: false,
			isConnected: false,
			isWaiting: false,
			waitingFor: {

			},
			qr: null,

			photo: null,
		}
	},
	computed: {
		username() {
			return this._telegram?.me?.username;
		},
	},
	methods: {
		onHideDialog() {
			this.isConnecting = false;
			this.isWaiting = false;
			this.waitingFor = {};
			this.isDisconnecting = false;

			this.phoneNumber = '';
			this.password = '';
			this.code = '';
			this.qr = null;

			if (this._telegram) {
				this._telegram.cancelInitialization();
			}
		},
		async onConnected() {
			// this._telegram = telegram;
			this.isConnected = true;
			this.photo = await this._telegram.getMePhoto();

			this.$store.telegram.setProvider(this._telegram);

			this.$refs.telegramDialog.hide();
		},
		async onDisconnected() {
			this.isConnected = false;
			this.photo = null;

			this.$store.telegram.setProvider(null);

			this.$refs.telegramDialog.hide();
		},
		async telegramLoaded(telegram) {
			this._telegram = telegram;
			this._telegram.addEventListener('wait', (e) => {
				const what = e.detail.what;
				if (what == 'apiId') {
					this.$store.settings.get('telegramApiId')
						.then((apiId)=>{
							this._telegram.setApiId(apiId);
						});
				} else if (what == 'apiHash') {
					this.$store.settings.get('telegramApiHash')
						.then((apiHash)=>{
							this._telegram.setApiHash(apiHash);
						});
				} else {
					this.isWaiting = true;
					// return;
					this.waitingFor[e.detail.what] = true;

					this.qr = null; // probably asked for a password after qr sigin
				}
			});

			this.isConnecting = true;
			const connected = await this._telegram.initializeRestored();
			if (connected) {
				this.isConnected = true;
				this.photo = await this._telegram.getMePhoto();

				this.$store.telegram.setProvider(this._telegram);

				this.$refs.telegramDialog.hide();
			} else {
				this.$store.telegram.setProvider(null);
			}
			this.isConnecting = false;
		},
		async next() {
			if (this.waitingFor['phoneNumber']) {
				this._telegram.setPhoneNumber(this.phoneNumber);
			}
			if (this.waitingFor['password']) {
				this._telegram.setPassword(this.password);
			}
			if (this.waitingFor['code']) {
				this._telegram.setCode(this.code);
			}
			this.waitingFor = {};
			this.isWaiting = false;
		},
		async onQRCode(url) {
			const qr = new AwesomeQR({
					text: url,
					size: 512,
				});

			const dataURL = await qr.draw();
			this.qr = dataURL;
		},
		async connect(withQR = false) {
			this.isConnecting = true;
			const success = await this._telegram.initialize({qr: withQR});

			this.isConnecting = false;
			this.isConnected = success;

			if (success) {
				this.photo = await this._telegram.getMePhoto();

				this.$store.telegram.setProvider(this._telegram);
			}
		},
		async disconnect() {
			this.isDisconnecting = true;
			const success = await this._telegram.disconnect();
			if (success) {
				this.isConnected = false;

				this.$store.telegram.setProvider(null);
			}
			this.isDisconnecting = false;
		},
	},
	mounted() {
	}
}
</script>
<style scoped="scoped">
	.q-inner-loading {
		background-color: transparent;
	}

	.dialog_profile_photo {
		height: 25px;
		vertical-align: middle;
		border-radius: 50%;
	}
</style>
