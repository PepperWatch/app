<template>

	<div>

		<div class="fixed-bottom-right q-ma-lg row q-gutter-xs" style="z-index: 2;">
			<q-btn color="primary" square flat text-color="primary" :label="currentStatus" class="gt-sm" />
			<q-btn :color="invalidChainType ? 'negative' : 'primary'" square text-color="white" label="" icon="help_outline" :loading="!videoInfoLoaded" @click="showInfoDialog = true" />
			<q-btn-group push square>
				<q-btn color="white" text-color="primary" :label="priceLabel" />
				<q-btn color="primary" text-color="white" label="Purchase" icon-right="add" :disabled="!purchaseEnabled" @click="purchase" :loading="purchasing" v-if="!purchased" />
				<q-btn color="primary" text-color="white"
					:label="showingEncrypted ? 'Show Public' : 'Show Encrypted'"
					:icon-right="showingEncrypted ? 'no_encryption' : 'lock_clock'"
					@click="showEncrypted" :loading="decoding" v-if="purchased" />
			</q-btn-group>
		</div>

		<div class="fixed-bottom-left q-ma-lg row q-gutter-xs" style="z-index: 2;">
			<h1 class="text-primary non-selectable gt-sm">{{videoInfo.videoTitle}}</h1>
		</div>


		<q-dialog v-model="showInfoDialog" position="right">
			<q-card style="max-width: 90vw;">
				<q-linear-progress :value="0.6" color="primary" />

				<q-card-section class="">
					<div>
						<div class="text-weight-bold">{{videoInfo.name}}</div>
						<div class="text-grey">{{videoInfo.descrition}}</div>
					</div>
				</q-card-section>
				<q-linear-progress :value="0.6" color="primary" />
				<q-card-section class="">
					<div>
						<div class="text-weight-bold non-selectable">JSON IPFS Hash</div>
						<div class="text-grey q-pb-xs cut-text">
							<a :href="'https://arweave.net/'+videoInfo.mintIpfsHash" target="_blank">{{videoInfo.mintIpfsHash}}</a>
						</div>
					</div>
					<div v-if="videoInfo.privateResolution">
						<div class="text-weight-bold non-selectable">Private Media Resolution</div>
						<div class="text-grey q-pb-xs cut-text">
							{{videoInfo.privateResolution}}
						</div>
					</div>
					<div v-if="videoInfo.privateDuration">
						<div class="text-weight-bold non-selectable">Private Media Duration</div>
						<div class="text-grey q-pb-xs cut-text">
							{{videoInfo.privateDuration}}
						</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">Thumb IPFS Hash</div>
						<div class="text-grey q-pb-xs cut-text">
							<a :href="'https://arweave.net/'+videoInfo.publicThumbIpfsHash" target="_blank">{{videoInfo.publicThumbIpfsHash}}</a>
						</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">Video IPFS Hash</div>
						<div class="text-grey q-pb-xs cut-text">
							<a :href="'https://arweave.net/'+videoInfo.encodedIpfsHash" target="_blank">{{videoInfo.encodedIpfsHash}}</a>
						</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">Minted Address</div>
						<div class="text-grey q-pb-xs cut-text">
							<a v-if="videoInfo.mintedAddress && videoInfo.chainType == 'devnet'" :href="'https://explorer.solana.com/address/'+videoInfo.mintedAddress+'?cluster=devnet'" target="_blank">
								{{videoInfo.mintedAddress}}
							</a>
							<a v-if="videoInfo.mintedAddress && videoInfo.chainType == 'mainnet-beta'" :href="'https://explorer.solana.com/address/'+videoInfo.mintedAddress+''" target="_blank">
								{{videoInfo.mintedAddress}}
							</a>
						</div>
					</div>
					<div v-if="videoInfo.collectionAddress">
						<div class="text-weight-bold non-selectable">Collection Address</div>
						<div class="text-grey q-pb-xs cut-text">
							<a v-if="videoInfo.collectionAddress && videoInfo.chainType == 'devnet'" :href="'https://explorer.solana.com/address/'+videoInfo.collectionAddress+'?cluster=devnet'" target="_blank">
								{{videoInfo.collectionAddress}}
							</a>
							<a v-if="videoInfo.collectionAddress && videoInfo.chainType == 'mainnet-beta'" :href="'https://explorer.solana.com/address/'+videoInfo.collectionAddress+''" target="_blank">
								{{videoInfo.collectionAddress}}
							</a>
						</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">Chain Type</div>
						<div class="text-negative q-pb-xs cut-text" v-if="invalidChainType">{{videoInfo.chainType}} (different than your connection)</div>
						<div class="text-grey q-pb-xs cut-text">{{videoInfo.chainType}}</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">Public Key</div>
						<div class="text-grey q-pb-xs cut-text">{{encryptionPublicKey}}</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">TX</div>
						<div class="text-grey q-pb-xs cut-text">
							<a v-if="txSignature && videoInfo.chainType == 'devnet'" :href="'https://explorer.solana.com/tx/'+txSignature+'?cluster=devnet'" target="_blank">
								{{txSignature}}
							</a>
							<a v-if="txSignature && videoInfo.chainType == 'mainnet-beta'" :href="'https://explorer.solana.com/tx/'+txSignature+''" target="_blank">
								{{txSignature}}
							</a>
						</div>
					</div>
					<div>
						<div class="text-weight-bold non-selectable">Per User Decode Key</div>
						<div class="text-grey q-pb-xs cut-text">{{userEncryptionEncodedKey}}</div>
					</div>

					<q-space />
				</q-card-section>
			</q-card>
		</q-dialog>

	</div>

</template>
<script>
/* eslint-disable no-unused-vars */
import Viewer from '../classes/Viewer';
import Crypt from '../classes/Crypt';

export default {
	name: 'DecodeKeyPurchaser',
	props: {
		hash: {
			type: String, // hash is either NFT address or Mint JSON address hash or unique video key
			default: '',
		}
	},
	data() {
		return {
			videoInfoLoaded: false,
			videoInfo: {

			},
			purchaseEnabled: false,
			invalidChainType: false,
			statusItems: [],
			currentStatus: '',

			purchasing: false,
			txSignature: null,
			purchased: false,

			encryptionPublicKey: null,
			userEncryptionEncodedKey: null,
			decoding: false,
			decodedURL: null,

			showingEncrypted: false,

			showInfoDialog: false,
		}
	},
	methods: {
		pushStatus(str) {
			this.currentStatus = str;
			this.statusItems.push(str);

			clearTimeout(this.__clearLogStringTimeout);
			this.__clearLogStringTimeout = setTimeout(()=>{
				this.currentStatus = '';
			}, 3000);
		},
		async showEncrypted() {
			if (this.showingEncrypted) {
				this.pushStatus('Loading public version');

				this.$emit('public');
				this.showingEncrypted = false;
				return;
			}

			this.decoding = true;

			if (this.decodedURL) {
				this.pushStatus('Loading encoded version');

				this.$emit('decoded', this.decodedURL);
				this.showingEncrypted = true;
				this.decoding = false;
				return;
			}

			const provider = this.$store.solana.provider;
			if (!this.userEncryptionEncodedKey || !provider) {
				return false;
			}
			const connectedAddress = provider.connectedAddress;

			this.pushStatus('Decrypt per-user key');

			const decryptedKey = await provider.decryptMessage(this.userEncryptionEncodedKey);

			// console.log('decryptedKey', decryptedKey);

			this.pushStatus('Decode the key');

            const c = new Crypt();
            const videoViewKey = await c.decode(decryptedKey, connectedAddress);

            // console.log('videoViewKey', videoViewKey);

            this.$emit('key', videoViewKey);

			this.pushStatus('Decoding the video from blockchain');

            this.decodedURL = await this.viewer.getDecodedVideoURL(videoViewKey, this.videoInfo.videoURL);

			this.pushStatus('Decoded. Loading it');

            this.$emit('decoded', this.decodedURL);
			this.showingEncrypted = true;

			this.decoding = false;
		},
		async purchase() {
			this.purchasing = true;

			await this.requestBlockchain();
			const provider = this.$store.solana.provider;
			const connectedAddress = provider.connectedAddress;

			this.checkChainType();
			if (!this.purchaseEnabled) {
				return false;
			}

			this.pushStatus('Getting encryption public key');
			const encryptionPublicKey = await provider.getEncryptionPublicKey();
			this.encryptionPublicKey = encryptionPublicKey;
			// console.error('encryptionPublicKey', encryptionPublicKey);


			this.pushStatus('Instantiate purchase');

			const purchase = await this.initializePurchase();

			if (purchase.userEncryptionEncodedKey) {
				// already purchased
				this.purchased = true;
				this.purchasing = false;
				this.userEncryptionEncodedKey = purchase.userEncryptionEncodedKey;

				this.pushStatus('You have already purchased it');

			} else if (purchase.expectedTransactionInstructions) {
				this.pushStatus('Send transaction paying NFT owner, creator and service fees');

				const signature = await provider.sendComplexTransaction(purchase.expectedTransactionInstructions);

				this.txSignature = signature;
				this.pushStatus('Fulfilling purchase and obtaining per-user key');
				// console.error('signature', signature);

				const userEncryptionEncodedKey = await this.fulfillPurchase(encryptionPublicKey, signature);

				this.userEncryptionEncodedKey = userEncryptionEncodedKey;
				this.purchased = true;
				this.purchasing = false;

				this.pushStatus('Successfully purchased');

				// console.error('userEncryptionEncodedKey', userEncryptionEncodedKey);
			} else {
				this.pushStatus('Error. Can not initialize purchase');
				throw new Error('Can not initialize purchase');
			}

            this.purchased = true;
            this.purchasing = false;
		},
		async initializePurchase() {
			const provider = this.$store.solana.provider;

			const mintIpfsHash = this.videoInfo.mintIpfsHash;
			const connectedAddress = provider.connectedAddress;
			const chainType = provider.chainType;

			// initialize purchase on API
			const resp = await this.$store.api.post({
				path: 'api/purchase/new',
				data: {
					mintIpfsHash,
					connectedAddress,
					chainType,
				}});

			if (resp && resp.by && resp.by == connectedAddress && resp.expectedTransactionInstructions && resp.expectedTransactionInstructions.length) {
				return resp;
			} else {
				throw new Error('Something wrong initializing purchase');
			}
		},
		async fulfillPurchase(encryptionPublicKey, txSignature) {
			const provider = this.$store.solana.provider;

			const mintIpfsHash = this.videoInfo.mintIpfsHash;
			const connectedAddress = provider.connectedAddress;
			const chainType = provider.chainType;

			const resp = await this.$store.api.post({
				path: 'api/purchase/fulfill',
				data: {
					mintIpfsHash,
					connectedAddress,
					chainType,
					userEncryptionPublicKey: encryptionPublicKey,
					signature: txSignature,
				}});

			if (resp && resp.userEncryptionEncodedKey) {
				return resp.userEncryptionEncodedKey;
			} else {
				throw new Error('Something wrong fulfilling purchase');
			}
		},
		async requestBlockchain() {
			if (this.$store.solana.provider) {
				return true;
			}

			this.pushStatus('Requesting blockchain connection');

			this.$store.solana.request();

			this.__requestedBlockchainPromiseResolver = null;
			await new Promise((res)=>{
				this.__requestedBlockchainPromiseResolver = res;
			});
		},
		async blockchainSessionChanged() {
			if (this.blockchainSession && this.__requestedBlockchainPromiseResolver) {
				// resolve requested waited
				this.pushStatus('Connected to blockchain');
				this.__requestedBlockchainPromiseResolver();
			}

			if (this.blockchainSession && !this.purchased && !this.__triedToLoadIfPurchased) {
				this.loadIfPurchased();
			}
		},
		async loadIfPurchased() {
			const provider = this.$store.solana.provider;
			if (!provider) {
				return false;
			}

			this.__triedToLoadIfPurchased = true;

			let connectedAddress = undefined;
			if (provider && provider.connectedAddress) {
				connectedAddress = provider.connectedAddress;
				this.__triedToLoadIfPurchased = true;
			}
			this.pushStatus('Loading NFT info');

			// try to load from API
			const resp = await this.$store.api.post({
				path: 'api/byhash',
				data: {
					hash: this.hash,
					connectedAddress: connectedAddress,
				}});
			if (resp && resp.userEncryptionEncodedKey) {
				this.userEncryptionEncodedKey = resp.userEncryptionEncodedKey;
				this.txSignature = resp.fulfilledByTransaction;
				this.purchased = true;
			}

			this.checkChainType();
		},
		async loadVideoInfo() {
			const provider = this.$store.solana.provider;
			let connectedAddress = undefined;
			if (provider && provider.connectedAddress) {
				connectedAddress = provider.connectedAddress;
				this.__triedToLoadIfPurchased = true;
			}

			this.pushStatus('Loading NFT info');

			// try to load from API
			const resp = await this.$store.api.post({
				path: 'api/byhash',
				data: {
					hash: this.hash,
					connectedAddress: connectedAddress,
				}});

			if (resp && resp.mintIpfsHash) {
				// found on api
				this.videoInfo = resp;

				this.pushStatus('Loading NFT info from blockchain');

				const request = new Request('https://arweave.net/'+this.videoInfo.mintIpfsHash);
				const response = await fetch(request);
				const json = await response.json();

				this.videoInfo.name = json.name;
				this.videoInfo.description = json.description;

				this.videoInfo.videoURL = 'https://arweave.net/'+this.videoInfo.encodedIpfsHash;
				this.videoInfo.videoTitle = ''+this.videoInfo.name;
				this.videoInfo.videoDescription = ''+this.videoInfo.description;

				if (json.properties && json.properties.private_resolution) {
					this.videoInfo.privateResolution = json.properties.private_resolution;
					this.videoInfo.privateDuration = json.properties.private_duration;

					let infoString = 'Private media has resolution: '+this.videoInfo.privateResolution;
					if (this.videoInfo.privateDuration) {
						infoString += ' and duration: '+this.videoInfo.privateDuration;
					}

					setTimeout(()=>{
						this.pushStatus(infoString);
					}, 2000);
				}

				this.videoInfoLoaded = true;
				this.pushStatus('NFT info loaded');

				this.$emit('video', this.videoInfo);

				this.purchaseEnabled = true;
				this.checkChainType();
			}

			if (resp && resp.userEncryptionEncodedKey) {
				this.pushStatus('Found out you have already purchased it');

				this.userEncryptionEncodedKey = resp.userEncryptionEncodedKey;
				this.txSignature = resp.fulfilledByTransaction;
				this.purchased = true;
			}
		},
		checkChainType() {
			const provider = this.$store.solana.provider;
			if (!provider) {
				return;
			}

			const chainType = provider.chainType;
			if (this.videoInfo && this.videoInfo.chainType && chainType && chainType != this.videoInfo.chainType) {
				this.purchaseEnabled = false;
				this.invalidChainType = true;
			} else {
				this.purchaseEnabled = true;
				this.invalidChainType = false;
			}
		}
	},
	computed: {
		blockchainSession() {
			return this.$store.solana.sessionId;
		},
		priceLabel() {
			if (this.videoInfo && this.videoInfo.price) {
				return ''+this.videoInfo.price+' SOL';
			}

			return null;
		}
	},
	watch: {
		blockchainSession: function() {
			this.blockchainSessionChanged();
		},
	},
	mounted() {
		this.viewer = new Viewer();
		this.blockchainSessionChanged();
		this.loadVideoInfo();
	}
}
</script>
<style scoped="scoped">

	h1 {
		margin: 0;
		padding: 0;
		line-height: 36px;
		vertical-align: middle;
		font-size: 20px;
	}

	.cut-text {
		text-overflow: ellipsis;
		overflow: hidden;
		width: 400px;
		white-space: nowrap;
	}


</style>
