<template>

	<div>

		<div v-if="!signedAddress">

			<q-btn dense flat no-wrap >
				<span v-if="selectedPossibleChainName">{{selectedPossibleChainName}}</span>
				<span v-if="!selectedPossibleChainName">Select Blockchain</span>
				<q-icon name="arrow_drop_down" size="26px" />
				<q-menu auto-close>
					<q-list dense>
	<!-- 					<q-item class="GL__menu-link-signed-in">
							<q-item-section> Connected to {{ chainType }}</q-item-section>
						</q-item>
						<q-separator /> -->

						<q-item clickable class="GL__menu-link" v-for="(item) in possibleChains" v-bind:key="item.name" @click="changeChain(item)">
							<q-item-section>{{ item.name }}</q-item-section>
						</q-item>

					</q-list>
				</q-menu>

			</q-btn>

			<q-btn stretch flat :label="providerButtonTittle" :loading="connecting" @click="connect" />
		</div>
		<div v-if="signedAddress">

			<q-btn dense flat no-wrap >
				{{ displayAddress }} on {{ chainType }}
				<q-icon name="arrow_drop_down" size="26px" />

				<q-menu auto-close>
					<q-list dense>
						<q-item class="GL__menu-link-signed-in">
							<q-item-section> Connected to {{ chainType }}</q-item-section>
						</q-item>
						<q-separator />

						<q-item clickable class="GL__menu-link">
							<q-item-section>Widthdraw Earnings</q-item-section>
						</q-item>
<!--
						<q-item clickable class="GL__menu-link" @click="deployNFT">
							<q-item-section>deployNFT</q-item-section>
						</q-item>

						<q-item clickable class="GL__menu-link" @click="test">
							<q-item-section>Get Enc Key</q-item-section>
						</q-item> -->

					</q-list>
				</q-menu>
			</q-btn>

		</div>

		<div v-if="requested.terra">
			<TerraAsync ref="terra" @connected="terraConnected" @loaded="terraLoaded" @error="terraError"/>
		</div>
		<div v-if="requested.metamask">
			<MetamaskAsync ref="metamask" @connected="metamaskConnected" @loaded="metamaskLoaded"/>
		</div>

	</div>

</template>

<style>
</style>

<script>
// import Metamask from '../classes/Metamask.js';
// import Terra from '../classes/Terra.js';
// import Crypt from '../classes/Crypt.js';

// import { useQuasar } from 'quasar';

import TerraAsync from './AsyncComponents/TerraAsync.js';
import MetamaskAsync from './AsyncComponents/MetamaskAsync.js';
import { mapGetters } from 'vuex';

export default {
	name: 'CryptoAuth',
    emits: ['connected'],
	data() {
		return {
			signedAddress: null,
			chainType: null,

			possibleChains: [
				// {name: 'Polygon Testnet', provider: 'metamask' },
				{name: 'Terra Testnet', provider: 'terra', default: true, netId: 'testnet'},
			],
			selectedPossibleChain: null,
			selectedPossibleChainName: null,

			connecting: false,
			metamask: null,
			terra: null,
			provider: null,

			loaded: {
				terra: false,
				metamask: false,
			},
			requested: {
				terra: false,
				metamask: false,
			},
		}
	},
	components: {
		TerraAsync,
		MetamaskAsync,
	},
	methods: {
		async deployNFT() {
			this.terra.mint('QmWy14jwgNfA1ms3k9MoYobRp98KrzHpgkHFiz9t96rYs9');

		},
		async request(provider) {
			if (provider == 'terra') {
				return await this.requestTerra();
			} else if (provider == 'metamask') {
				return await this.requestMetamask();
			}
		},
		async requestTerra() {
			if (this.loaded.terra) {
				return true;
			}

			this.__requestPromiseTerraResolver = null;
			this.__requestPromiseTerra = new Promise((res)=>{ this.__requestPromiseTerraResolver = res; });

			this.requested.terra = true;

			return await this.__requestPromiseTerra;
		},
		async requestMetamask() {
			if (this.loaded.metamask) {
				return true;
			}

			this.__requestPromiseMetamaskResolver = null;
			this.__requestPromiseMetamask = new Promise((res)=>{ this.__requestPromiseMetamaskResolver = res; });

			this.requested.metamask = true;

			return await this.__requestPromiseMetamask;
		},
		terraLoaded() {
			this.loaded.terra = true;

			if (this.__requestPromiseTerraResolver) {
				this.__requestPromiseTerraResolver();
			}
		},
		metamaskLoaded() {
			this.loaded.metamask = true;


			if (this.__requestPromiseMetamaskResolver) {
				this.__requestPromiseMetamaskResolver();
			}
		},
		async changeChain(possibleChain) {
			console.error('chainging chain to ', possibleChain);

			this.selectedPossibleChain = possibleChain;
			this.selectedPossibleChainName = possibleChain.name;
		},
		async terraConnected(terra) {
			console.error('terra conencted');

			console.error(terra);

			this.terra = terra;
			this.provider = terra;
			this.signedAddress = this.terra.connectedAddress;
			this.chainType = this.terra.connectedNetName;

			let foundInPossibleChains = false;

			for (let possibleChain of this.possibleChains) {
				if (possibleChain.provider == 'terra' && possibleChain.netId == this.chainType) {
					foundInPossibleChains = true;
				}
			}

			if (foundInPossibleChains) {
				this.$store.dispatch('blockchain/connected', {
					signedAddress: this.signedAddress,
					chainType: this.chainType,
					provider: this.terra,
				});

				this.$emit('connected', this.terra);
			} else {
				this.terra.disconnect();

				this.terra = null;
				this.provider = null;
				this.signedAddress = null;

				this.connecting = false;

				// const $q = useQuasar();
				// this.$q.notify({
				// 	type: 'negative',
				// 	position: 'top-right',
				// 	message: 'The chain '+this.chainType+' is not yet supported. Please switch to devnet.',
				// });

				this.$q.notify({
					type: 'negative',
					position: 'top-right',
					message: 'The chain '+this.chainType+' is not yet supported. Please switch to testnet in Extension and connect again.',
				});


				this.chainType = null;
			}
		},
		async terraError() {
			this.$q.notify({
				type: 'negative',
				position: 'top-right',
				message: 'Can not connect to TerraStation Browser Extension. Is it installed?',
			});

			this.connecting = false;
			this.terra = null;
			this.provider = null;
			this.signedAddress = null;
			this.chainType = null;
		},
		async metamaskConnected(metamask) {
			console.error('metamask conencted');

			this.metamask = metamask;
			this.provider = metamask;
			this.signedAddress = this.metamask.connectedAddress;
			this.chainType = this.metamask.connectedNetName;

			this.$emit('connected', this.metamask);
		},
		async connect() {
			this.connecting = true;

			await this.request(this.selectedPossibleChain.provider);
			await this.$refs[this.selectedPossibleChain.provider].connect();

		},
		async disconnect() {

			this.connecting = false;
			this.$refs[this.selectedPossibleChain.provider].disconnect();

			this.signedAddress = null;
			this.chainType = null;
			this.provider = null;
		},
		async checkTheStore() {
			const storeSignedAddress = this.$store.getters['blockchain/signedAddress'];

			if (this.signedAddress != storeSignedAddress) {
				this.signedAddress = storeSignedAddress;
				this.chainType = this.$store.getters['blockchain/chainType'];
				this.provider = this.$store.getters['blockchain/provider'];

				if (this.signedAddress) {
					this.$nextTick(()=>{
						this.$emit('connected', this.provider);
					});
				}
				// alert(this.storeSignedAddress);
			}
		},
		getProvider() {
			return this.provider;
		}
	},
	mounted: function() {
		for (let possibleChain of this.possibleChains) {
			if (possibleChain.default) {
				this.selectedPossibleChain = possibleChain;
				this.selectedPossibleChainName = possibleChain.name;
			}
		}


		this.checkTheStore();
	},
	watch: {
		blockchainSession: async function(){
			this.checkTheStore();
		}
	},
	computed: {
		...mapGetters({
			// map `this.doneCount` to `this.$store.getters.doneTodosCount`
			blockchainSession: 'blockchain/sessionId'
		}),
		displayAddress() {
			return (''+this.signedAddress).substr(0,10)+'...'+(''+this.signedAddress).substr(-5);
		},
		providerButtonTittle() {
			if (this.selectedPossibleChain) {
				if (this.selectedPossibleChain.provider == 'metamask') {
					return 'Connect with Metamask';
				}
				if (this.selectedPossibleChain.provider == 'terra') {
					return 'Connect with Terra Station';
				}
			}

			return '';
		},
	}
}
</script>