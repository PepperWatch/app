<template>

	<q-card class="nft q-mb-md" flat bordered>

		<q-card-section horizontal>
			<q-img :src="thumbURL" ref="image" class="col-2" height="220px" />
			<q-card-section class="col-6 q-pt-xs">
				<div class="text-overline">
				{{name}}
				</div>
				<div class="text-caption text-grey">
				{{description}}
				</div>
				<div class="text-overline q-pb-xs">
					<a v-if="address && chainType == 'devnet'" :href="'https://explorer.solana.com/address/'+address+'?cluster=devnet'" target="_blank">
						{{address}}
					</a>
					<a v-if="address && chainType == 'mainnet-beta'" :href="'https://explorer.solana.com/address/'+address+''" target="_blank">
						{{address}}
					</a>
				</div>
				<div class="text-overline text-grey" v-if="!verified">
					<q-avatar color="primary" text-color="white" icon="shield" size="20px" />
					NFT is not yet verified by PepperWatch NFT collection owner
				</div>
				<div class="text-overline text-grey" v-if="verified">
					<q-avatar color="primary" text-color="white" icon="verified_user" size="20px" />
					NFT is verified
				</div>


				<div class="text-overline q-gutter-sm" v-if="address">

					<NFTLink forWhat="pepperwatch" :address="address" :chainType="chainType" />
					<NFTLink forWhat="solscan" :address="address" :chainType="chainType" />
					<NFTLink forWhat="opensea" :address="address" :chainType="chainType"  :disable="!verified" />

				</div>
			</q-card-section>
			<q-card-section class="col-4 q-pt-xs">

				<div class="text-overline">
					<div class="text-overline">
						Private Media
					</div>
				</div>

				<div class="text-overline  text-grey">
					{{privateMediaDuration}} ... {{privateMediaResolution}}
				</div>

				<div class="text-overline" v-if="priceFormatted">
					<div class="text-overline">
						Access Price
					</div>
				</div>

				<div class="text-overline  text-grey" v-if="priceFormatted">
					<q-btn color="primary" icon="edit" size="xs" round @click="editPrice" /> {{priceFormatted}} SOL
					<!-- https://stackoverflow.com/questions/72414999/how-to-verify-the-signature-of-a-message-in-phantom-solana -->
				</div>

				<div class="text-overline">
					<div class="text-overline">
						Transactions
					</div>
				</div>

				<div class="text-overline  text-grey">
					<q-btn color="primary" icon="search" size="xs" round />
				</div>
			</q-card-section>
		</q-card-section>

	</q-card>

</template>
<script>
import NFTLink from './NFTLink';

export default {
	name: 'MyNFT',
	props: {
		nft: Object,
		chainType: String,
	},
	components: {
		NFTLink,
	},
	data() {
		return {
			infoLoaded: false,

			info: {},
			sInfo: {},
			price: 1,
			minimumPrice: 0,
		}
	},
	mounted: function() {
		this.loadInfo();
	},
	watch: {
	},
	methods: {
		editPrice() {
			this.$emit('editPrice', {
				info: this.info,
				sInfo: this.sInfo,
			});
		},
		async loadInfo() {
			const provider = this.$store.solana.provider;

			if (this.nft.model == 'metadata') {
				const info = await provider.loadMetadata(this.nft);
				this.info = info;
			} else {
				this.info = this.nft;
			}

			// try to load from API
			const resp = await this.$store.api.post({
				path: 'api/byhash',
				data: {
					hash: this.address,
				}});
			if (resp && resp.mintedAddress) {
				this.sInfo = resp;
			}


			this.infoLoaded = true;
		}
	},
	computed: {
		verified: function() {
			if (this.sInfo && this.sInfo.isCollectionVerified) {
				return true;
			}

			return false;
		},
		priceFormatted: function() {
			if (this.sInfo && this.sInfo.price) {
				return this.sInfo.price;
			}

			return null;
		},
		address: function() {
			return (''+this.info?.mint?.address);
		},
		name: function() {
			return (''+this.info?.name);
		},
		description: function() {
			return (''+this.info?.json?.description);
		},
		thumbURL: function() {
			if (this.info && this.info.json && this.info.json.image) {
				return this.info.json.image;
			}

			return null;
		},
		privateMediaResolution: function() {
			if (this.info && this.info.json && this.info.json.properties.private_resolution) {
				return this.info.json.properties.private_resolution;
			}

			return null;
		},
		privateMediaDuration: function() {
			if (this.info && this.info.json && this.info.json.properties.private_duration) {
				return this.info.json.properties.private_duration;
			}

			return null;
		}
	}
}
</script>
<style>


</style>
