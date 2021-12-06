<template>



	<q-card class="prepared_mint"  flat bordered>
		<q-card-section horizontal>

			<q-card-section class="col-3 flex">

				<q-img
					:src="publicThumbBlobURL"
					fit="cover"
					spinner-color="primary"
					spinner-size="82px"
					class="rounded-borders"
					img-class="mint_img"
					loading="lazy"
					style="max-width: 300px; height: 300px; width: 300px;"
					@click="watchPublic"
				>
					<q-icon class="absolute all-pointer-events" size="32px" name="visibility" color="white" style="top: 8px; right: 8px">
						<q-tooltip>
							This is the public media, visible for everyone
						</q-tooltip>
					</q-icon>

					<q-icon tag="span" class="absolute all-pointer-events absolute-center" size="64px" name="play_circle" color="white"></q-icon>
				</q-img>

			</q-card-section>

			<q-card-section class="col-3 flex">

				<q-img
					:src="privateThumbURL"
					fit="cover"
					spinner-color="primary"
					spinner-size="82px"
					class="rounded-borders"
					img-class="mint_img"
					loading="lazy"
					style="max-width: 300px; height: 300px; width: 300px;"
					@click="watchPrivate"
				>
					<q-icon class="absolute all-pointer-events" size="32px" name="lock" color="white" style="top: 8px; right: 8px">
						<q-tooltip>
							This is the hidden part, available to watch after the purchase
						</q-tooltip>
					</q-icon>

					<q-icon tag="span" class="absolute all-pointer-events absolute-center" size="64px" name="play_circle" color="white"></q-icon>
				</q-img>

			</q-card-section>


			<q-card-section class="q-pt-xs col-6 flex">
				<div>
					<div v-if="!displayAsMinted">

						<div class="text-overline">

							<q-btn size="sm" color="primary" icon="download" label="Download" :loading="downloading" @click="download"/>

							&ndash; you can download encoded MP4 file, minting to blockchain is not required

						</div>
						<div class="text-overline">

							<span class=" non-selectable">
								Password:

								<q-tooltip>
									<p>Password is the KEY private content encoded inside NFT</p>

									<p>The only case you need a password, if you don't want to mint encoded data as NFT and prefer to store it on your computer,
										so nobody can purchase it.</p>

									<p>It would be all your private media, and you can decode anytime on <b>Decode</b> page with password.</p>
								</q-tooltip>
							</span>
							<q-btn v-if="!showPassword" size="xs" flat round color="primary" icon="visibility" @click="showPassword = true;" />
							<span v-if="showPassword">{{password}}</span>
						</div>

						<q-separator />

					</div>

					<div class="text-h5 q-mb-xs">

						<q-input borderless v-model="title" label="Title" :disable="!!mintIpfsHash || displayAsMinted"/>

					</div>
					<div class="text-h5 q-mb-xs">

						<q-input :disable="!!mintIpfsHash || displayAsMinted" v-model="description" filled type="textarea" label="Description" autogrow borderless/>

					</div>




					<div class="text-caption text-grey">

						<div class="q-py-md" v-if="mintIpfsHash">
							<div class="text-overline">IPFS</div>

							<q-markup-table separator="none" flat dense>
								<tbody>
									<tr class="q-tr--no-hover">
										<td class="text-left"><a :href="'https://ipfs.infura.io/ipfs/'+mintIpfsHash" target="_blank">{{mintIpfsHash}}</a></td>
										<td class="text-left">JSON</td>
									</tr>
									<tr class="q-tr--no-hover">
										<td class="text-left"><a :href="'https://ipfs.infura.io/ipfs/'+publicThumbIpfsHash" target="_blank">{{publicThumbIpfsHash}}</a></td>
										<td class="text-left">Thumb Image</td>
									</tr>
									<tr class="q-tr--no-hover">
										<td class="text-left"><a :href="'https://ipfs.infura.io/ipfs/'+ipfsHash" target="_blank">{{ipfsHash}}</a></td>
										<td class="text-left">Content</td>
									</tr>
								</tbody>
							</q-markup-table>
						</div>

						<div class="q-py-md" v-if="prepared">
							<q-markup-table separator="none" flat bordered>
								<thead>
								<tr>
									<th class="text-left">&nbsp;</th>
									<th class="text-right">Size</th>
									<th class="text-right">Length</th>
									<th class="text-right">Resolution</th>
								</tr>
								</thead>
								<tbody>
									<tr class="q-tr--no-hover">
										<td class="text-left">Public</td>
										<td class="text-right">{{ userContainer.getPublicSizeHuman() }}</td>
										<td class="text-right">{{ userContainer.getPublicDurationHuman() }}</td>
										<td class="text-right">{{ userContainer.getPublicResolution() }}</td>
									</tr>
									<tr class="q-tr--no-hover">
										<td class="text-left">Private</td>
										<td class="text-right">{{ userContainer.getPrivateSizeHuman() }}</td>
										<td class="text-right">{{ userContainer.getPrivateDurationHuman() }}</td>
										<td class="text-right">{{ userContainer.getPrivateResolution() }}</td>
									</tr>
									<tr class="q-tr--no-hover">
										<td class="text-left">Encoded Size</td>
										<td class="text-right">{{ userContainer.getEncodedSizeHuman() }}</td>
										<td class="text-right">&nbsp;</td>
										<td class="text-right">&nbsp;</td>
									</tr>
								</tbody>
							</q-markup-table>
						</div>


					</div>
				</div>
			</q-card-section>

		</q-card-section>

		<q-separator />

		<q-card-section horizontal class="row">
			<q-card-section class="col-12">

				<div class="q-mb-xs  text-grey">

					<div class="text-overline">Price To Watch Private Media (in $LUNA) &ndash; you will be able to adjust it after the mint</div>

					<q-item>
					<q-item-section avatar>
					<q-icon color="yellow-10" name="nightlight" />
					</q-item-section>
					<q-item-section>
					<q-slider
					v-model="price"
					:min="0"
					:max="0.1"
					:step="0.001"
					label
					color="yellow-10"
					/>
					</q-item-section>
					</q-item>

				</div>

			</q-card-section>
		</q-card-section>

		<q-separator />

		<q-card-actions  class="justify-around">
			<!-- <q-btn flat color="primary" icon="upload" label="Test" @click="test" /> -->


			<!-- <q-btn flat color="primary" icon="download" label="Download" :loading="downloading" @click="download"/> -->
			<q-btn flat color="primary" icon="upload" label="Upload to IPFS" :loading="uploading" @click="upload" v-if="!ipfsHash || !mintIpfsHash"/>
			<!-- <q-btn flat type="a" :href="ipfsURL" target="_blank" color="primary" icon="open_in_new" label="Check on IPFS" v-if="ipfsHash"/> -->


			<q-btn flat color="green" icon="price_change" :disable="!priceChangeAvailable" label="Commit Price Change" v-if="haveToChangePriceOnBlockchain" @click="commitPriceChange"/>

			<q-btn flat type="a" :to="watchURL" color="primary" icon="open_in_new" label="Watch Page" v-if="isMinted"/>
			<q-btn flat color="green" icon="bookmark" :disable="!mintAvailable" label="Mint" @click="mint" :loading="minting" v-if="!!mintIpfsHash && !isMinted"/>
			<q-btn flat :disable="!!isMinted"  color="negative" icon="delete" label="Remove" @click="remove" v-if="!displayAsMinted" />

		</q-card-actions>

	</q-card>

	<!--
	<div v-if="userContainer">

		test

		<img :src="thumbURL" />

	</div> -->

</template>
<script>
import { mapGetters } from 'vuex';
import Crypt from '../classes/Crypt.js';

export default {
	name: 'PreparedMint',
	props: {
		userContainer: Object,
		displayAsMinted: Boolean,
	},
    emits: ['watch', 'remove'],
	data() {
		return {
			showPassword: false,

			title: "",
			description: "",

			privateThumbURL: "",
			publicThumbBlobURL: null,

			dialog: true,
			downloading: false,
			password: null,

			uploading: false,

			prepared: false,

			ipfsHash: null,
			mintIpfsHash: null,
			publicThumbIpfsHash: null,

			mintAvailable: false,
			minting: false,

			isMinted: false,
			price: 0.01,

			priceChangeAvailable: false,
			haveToChangePriceOnBlockchain: false,
			commitingPriceChange: false,
		}
	},
	mounted: function() {
		this.prepare();
		this.checkMintAvailable();
	},
	watch: {
		price: function() {
			if (this.price != this.userContainer.getPrice()) {
				this.userContainer.setPrice(this.price);

				this._savePriceTimeout = setTimeout(()=>{
					clearTimeout(this._savePriceTimeout);

					this.userContainer.setPrice(this.price, true);
				}, 1000);

				if (this.isMinted) {
					this.haveToChangePriceOnBlockchain = true;
				}
			}
		},
		title: function() {
			if (this.userContainer.getTitle() != this.title) {
				this.mintIpfsHash = null;
				this.isMinted = false;
			}

			this.userContainer.setTitle(this.title);
		},
		description: function() {
			if (this.userContainer.getDescription() != this.description) {
				this.mintIpfsHash = null;
				this.isMinted = false;
			}

			this.userContainer.setDescription(this.description);
		},
		blockchainSession: function() {
			this.checkMintAvailable();
		},
	},
	methods: {
		test: async function() {
			let c = new Crypt();
			let encoded = await c.videoKeyToPublicKey(this.password);
			console.error('encoded', encoded);
		},
		commitPriceChange: async function() {
			this.commitingPriceChange = true;
			const blockchainProvider = this.$store.getters['blockchain/provider'];

			await blockchainProvider.commitPriceChange(this.mintIpfsHash, this.price);

			this.haveToChangePriceOnBlockchain = false;

			this.commitingPriceChange = false;
		},
		checkMintAvailable: async function() {
			const storeSignedAddress = this.$store.getters['blockchain/signedAddress'];
			if (storeSignedAddress) {
				this.mintAvailable = true;
				this.priceChangeAvailable = true;
			} else {
				this.mintAvailable = false;
				this.priceChangeAvailable = false;
			}
		},
		mint: async function() {
			this.minting = true;
			const blockchainProvider = this.$store.getters['blockchain/provider'];

			const success = await this.userContainer.mintOn(blockchainProvider);

			if (!success) {
				console.error('error minting');
			}

			this.isMinted = this.userContainer.getIsMinted();

			this.minting = false;
		},
		prepare: async function() {
			if (this.userContainer) {
				// await new Promise((res)=>{ setTimeout(res, 2500); });
				this.privateThumbURL = await this.userContainer.getPrivateThumbBlobURL();
				this.publicThumbBlobURL = await this.userContainer.getPublicThumbBlobURL();
				this.password = await this.userContainer.getKeyAsHex();

				this.ipfsHash = this.userContainer.getIPFSHash();
				this.mintIpfsHash = this.userContainer.getMintIPFSHash();
				this.publicThumbIpfsHash = this.userContainer.getPublicThumbIPFSHash();

				this.title = this.userContainer.getTitle();
				this.description = this.userContainer.getDescription();

				this.isMinted = this.userContainer.getIsMinted();
				this.price = this.userContainer.getPrice();

				this.prepared = true;
			}
		},
		async watchPublic() {
			const blobURL = await this.userContainer.getPublicBlobURL();
			this.$emit('watch', blobURL);
		},
		async watchPrivate() {
			const blobURL = await this.userContainer.getPrivateBlobURL();
			this.$emit('watch', blobURL);
		},
		async download() {
			this.downloading = true;
			await this.userContainer.download();
			this.downloading = false;
		},
        async storeIPFSOnApi() {
            const params = {
                path: '/storeipfs',
                data: {
                    hash: this.userContainer.id,
                    key: this.userContainer.getKeyAsHex(),

                    encodedIpfsHash: this.ipfsHash,
                    mintIpfsHash: this.mintIpfsHash,
                    publicThumbIpfsHash: this.publicThumbIpfsHash,
                },
            };
            const resp = this.$store.dispatch('api/post', params);

            return (resp.success || false);
        },
		async upload() {
			this.uploading = true;
			await this.userContainer.uploadToIPFS();

			this.ipfsHash = this.userContainer.getIPFSHash();
			this.mintIpfsHash = this.userContainer.getMintIPFSHash();
			this.publicThumbIpfsHash = this.userContainer.getPublicThumbIPFSHash();

			await this.storeIPFSOnApi();

			this.uploading = false;
		},
		async remove() {
			this.removing = true;
			this.$emit('remove', this.userContainer.id);
			this.removing = false;
		},
	},
	computed: {
		...mapGetters({
			// map `this.doneCount` to `this.$store.getters.doneTodosCount`
			blockchainSession: 'blockchain/sessionId'
		}),
		ipfsURL() {
			return `https://ipfs.infura.io/ipfs/${this.ipfsHash}`;
		},
		watchURL() {
			return `/v/${this.mintIpfsHash}`;
		}
	}
}
</script>
<style>

	.prepared_mint {
		width: 100%;
		margin-bottom: 16px;
	}

	.q-img {
		cursor: pointer;
	}

	.q-img .mint_img {
		filter: brightness(0.7);
		transition: all 0.2s ease-in-out;
	}

	.q-img:hover .mint_img {
		filter: brightness(1);
	}

	.q-img span {
		opacity: 0.1;
		transition: all 0.2s ease-in-out;
	}

	.q-img:hover span {
		opacity: 1;
	}

</style>
