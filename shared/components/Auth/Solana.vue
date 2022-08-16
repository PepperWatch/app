<template>

	<q-btn-dropdown v-model="menuState" flat color="white" :disabled="!isSolanaLoaded" :loading="isConnecting">
		<template v-slot:label>
			<div class="btnLabel" @click="onClick" ><img :src="phantomIcon" :class="{ muted: !isMetaplexInitialized }" v-if="phantomIcon" /><span>{{displayCaption}}</span></div>
		</template>
		<q-list>
			<q-item v-close-popup v-if="!isConnected && !isConnecting" clickable @click="switchChainType">
				<q-item-section>
					<q-item-label>Switch to {{otherChainType}}</q-item-label>
				</q-item-section>
			</q-item>
			<q-item v-close-popup v-if="isConnected">
				<q-item-section>
					<q-item-label>Connected to {{chainType}}</q-item-label>
				</q-item-section>
			</q-item>
			<q-item clickable v-close-popup v-if="isConnected" @click="doDisconnect">
				<q-item-section>
					<q-item-label>Disconnect</q-item-label>
				</q-item-section>
			</q-item>
		</q-list>
	</q-btn-dropdown>
<!--
	<q-btn @click="onClick" :disabled="!isSolanaLoaded || isConnected" value="" :loading="isConnecting"><img :src="phantomIcon" v-if="phantomIcon" />{{displayCaption}}</q-btn> -->

	<SolanaAsync ref="solana" v-if="solanaRequested" @loaded="solanaLoaded" @connected="onConnected" @icon="onPhantomIcon" @disconnected="onDisconnected" @metaplex="onMetaplexStatus"/>
	<SolanaMetaplexAsync ref="metaplex" v-if="metaplexRequested" @loaded="metaplexLoaded" />

</template>

<style scoped="scoped">
	.btnLabel {
		height: 20px;
		line-height: 20px;
		vertical-align: middle;
	}

	.btnLabel span {
		height: 20px;
		line-height: 20px;
		vertical-align: middle;

	}

	img {
		height: 20px;
		margin-right: 8px;
		vertical-align: middle;
	}

	img.muted {
		filter: grayscale(80%);
	}

	.q-btn {
		cursor: pointer;
	}
</style>

<script>
import SolanaAsync from 'shared/components/AsyncComponents/SolanaAsync.js';
import SolanaMetaplexAsync from 'shared/components/AsyncComponents/SolanaMetaplexAsync.js';

export default {
	name: 'Solana',
	components: {
		SolanaAsync,
		SolanaMetaplexAsync,
	},
	data() {
		return {
			menuState: false,


			solanaRequested: false,
			metaplexRequested: false,

			selectedChainType: null,

			isSolanaLoaded: false,
			isMetaplexLoaded: false,
			isMetaplexInitialized: false,

			isConnecting: false,
			isConnected: false,

			signedAddress: null,
			chainType: null,

			phantomIcon: null,
		}
	},
	computed: {
		displayAddress() {
			return (''+this.signedAddress).substr(0,10)+'...'+(''+this.signedAddress).substr(-5);
		},
		displayCaption() {
			if (this.isConnected) {
				return this.displayAddress;
			} else {
				const displayChainType = (''+this.selectedChainType).split('-beta').join('');
				return 'Connect to '+displayChainType;
			}
		},
		otherChainType() {
			if (this.selectedChainType == 'devnet') {
				return 'mainnet-beta';
			} else {
				return 'devnet';
			}
		}
	},
	methods: {
		switchChainType() {
			if (this.selectedChainType == 'devnet') {
				this.selectedChainType = 'mainnet-beta';
			} else {
				this.selectedChainType = 'devnet';
			}

			this.$store.solana.setSelectedChainType(''+this.selectedChainType);
		},
		onMetaplexStatus(isReady) {
			this.isMetaplexInitialized = isReady;
			// alert(isReady);
		},
		onPhantomIcon(icon) {
			// icon is data-url
			this.phantomIcon = icon;
		},
		onConnected(wallet) {
			this.isConnecting = false;
			this.$emit('ready', wallet);
			this.signedAddress = this.$refs.solana.connectedAddress;
			this.chainType = this.$refs.solana.chainType;

			this.isConnected = true;

			setTimeout(()=>{
				this.metaplexRequested = true;
			}, 500);

			this.$store.solana.setProvider(wallet);

			this.isMetaplexInitialized = wallet.isMetaplexReady;
		},
		onDisconnected() {
			this.isConnected = false;
			this.signedAddress = null;
			this.isConnecting = false;

			this.$store.solana.setProvider(null);
		},
		async onClick() {
			setTimeout(()=>{
				this.menuState = false;
			}, 800);
			this.isConnecting = true;

			try {
				await this.$refs.solana.connect(this.selectedChainType);
			} catch(e) {
				this.isConnecting = false;

				this.$q.notify({
					message: 'Can not initialize Solana wallet. Is Phantom installed?',
					color: 'negative'
				});
			}
		},
		doDisconnect() {
			this.isConnecting = true;
			this.$refs.solana.disconnect();
		},
		solanaLoaded() {
			this.isSolanaLoaded = true;
			if (this.isMetaplexLoaded && this.metaplexExportData) {
				this.$refs.solana.importMetaplex(this.metaplexExportData);
			}
		},
		metaplexLoaded(exportData) {
			this.isMetaplexLoaded = true;
			if (this.isSolanaLoaded) {
				this.$refs.solana.importMetaplex(exportData);
			} else {
				this.metaplexExportData = exportData;
			}
		},
	},
	mounted: function() {
		const defaultChainType = this.$q.config.chainType;
		this.selectedChainType = defaultChainType;

		this.$store.solana.setSelectedChainType(defaultChainType);

		setTimeout(()=>{
			this.solanaRequested = true;
		}, 500);

		this.$store.solana.$onAction(({name}) => {
			if (name == 'request') {
				this.onClick();
			}
		});
	}
}
</script>
