<template>

	<q-btn color="primary" @click="showDialog = true;" :loading="isConnecting || isDisconnecting">
		<div v-if="isConnected"><img v-if="photo" :src="photo" class="dialog_profile_photo"/> Disconnect</div>
		<div v-if="!isConnected">Connect</div>
	</q-btn>

	<q-dialog v-model="showDialog" @hide="onHideDialog">
		<q-card style="width: 700px; max-width: 80vw;">
			<q-card-section class="">

				<div style="height: 60px;" class="relative-position">

					<q-input v-model="phoneNumber" label="Phone Number" stack-label v-if="waitingFor.phoneNumber"/>
					<q-input v-model="password" label="Password" stack-label v-if="waitingFor.password"/>
					<q-input v-model="code" label="Code" stack-label v-if="waitingFor.code"/>

					<q-inner-loading :showing="(isConnecting && !isWaiting) || isDisconnecting">
						<q-spinner-rings size="35px" color="primary" />
					</q-inner-loading>

					<div v-if="isConnected" class="absolute-center non-selectable">
						Connected as <img v-if="photo" :src="photo" class="dialog_profile_photo"/> {{username}}
					</div>
					<div v-if="!isConnected && !isConnecting" class="absolute-center non-selectable	">
						Connect your Telegram account
					</div>
				</div>
			</q-card-section>
			<q-card-section style="max-height: 50vh">
				<q-btn label="Connect" type="submit" color="primary" @click="connect" ripple no-caps unelevated v-if="!isConnecting && !isConnected" style="width: 100%"/>
				<q-btn label="Next" type="submit" color="primary" @click="next" ripple no-caps unelevated :disable="!isWaiting" v-if="isConnecting" style="width: 100%"/>
				<q-btn label="Disconnect" type="submit" color="primary" @click="disconnect" ripple no-caps unelevated v-if="isConnected" style="width: 100%" :loading="isDisconnecting"/>

			</q-card-section>
		</q-card>
	</q-dialog>

	<TelegramAsync @loaded="telegramLoaded" @connected="onConnected" @disconnected="onDisconnected"/>

</template>
<script>

import TelegramAsync from 'shared/components/AsyncComponents/TelegramAsync.js';

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

			if (this._telegram) {
				this._telegram.cancelInitialization();
			}
		},
		async onConnected() {
			// this._telegram = telegram;
			this.isConnected = true;
			this.photo = await this._telegram.getMePhoto();

			this.$store.telegram.setProvider(this._telegram);
		},
		async onDisconnected() {
			this.isConnected = false;
			this.photo = null;

			this.$store.telegram.setProvider(null);
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
				}
			});

			this.isConnecting = true;
			const connected = await this._telegram.initializeRestored();
			if (connected) {
				this.isConnected = true;
				this.photo = await this._telegram.getMePhoto();

				this.$store.telegram.setProvider(this._telegram);
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
		async connect() {
			this.isConnecting = true;
			const success = await this._telegram.initialize();

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
