<template>

    <div style="min-height: 80vh">
        <h6 class="text-primary">Your NFTs <q-btn to="/encode" color="primary">Encode New</q-btn> </h6>

        <div v-if="!isBlockchainReady">
            <q-btn color="primary" icon="info" :loading="isBlockchainRequested" label="Connect to Blockchain" @click="requestBlockchain" />
        </div>

        <div v-if="isBlockchainReady">

            <template v-for="item in items" v-bind:key="item.id">
                <MyNFT :nft="item" :chainType="chainType" @editPrice="editPrice"/>
            </template>

        </div>

        <q-inner-loading :showing="isBlockchainReady && isLoading">
            <q-spinner-rings size="50px" color="primary" />
        </q-inner-loading>

        <q-dialog v-model="showEditPriceDialog">
            <q-card style="width: 70vw;">
                <q-linear-progress :value="0.6" color="primary" />

                <q-card-section class="">

                    <div class="q-mb-xs  text-grey">

                        <div class="text-overline">Price To Watch Private Media (in $SOL)</div>

                        <q-item>
                        <q-item-section avatar>
                        <q-icon color="yellow-10" name="price_change" />
                        </q-item-section>
                        <q-item-section>
                        <q-slider
                        v-model="priceToAdjust"
                        :min="0.001"
                        :max="0.1"
                        :step="0.001"
                        label
                        color="yellow-10"
                        />
                        </q-item-section>
                        </q-item>

                    </div>

                    <q-btn color="primary" :loading="savingThePrice" icon="price_change" label="Save" :disable="!haveToSaveThePrice" @click="commitPriceChange"/>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>

</template>

<script>
import MyNFT from '../components/MyNFT';

export default {
	name: 'Your NFTs',
    path: '/yours',
    title: 'Your NFTs',
    authRequired: false,
	props: {
	},
    components: {
        MyNFT,
    },
	data() {
		return {
			isActive: false,

            isBlockchainRequested: false,
            isBlockchainReady: false,

            isLoading: true,
            items: [],
            chainType: null,

            showEditPriceDialog: false,
            editPriceSInfo: {},
            priceToAdjust: null,
            initialPrice: null,
            haveToSaveThePrice: false,
            savingThePrice: false,
		}
	},
    watch: {
        blockchainSession: function() {
            this.checkBlockchain();
        },
        priceToAdjust: function() {
            if (this.initialPrice != this.priceToAdjust) {
                this.haveToSaveThePrice = true;
            } else {
                this.haveToSaveThePrice = false;
            }
        },
    },
    computed: {
        blockchainSession() {
            return this.$store.solana.sessionId;
        },
    },
	methods: {
        async commitPriceChange() {
            this.savingThePrice = true;
            let success = false;

            try {
                const provider = this.$store.solana.provider;
                const ownerAddress = this.$store.solana.signedAddress;
                const price = this.priceToAdjust;
                const hash = this.editPriceSInfo.mintedAddress;

                const resp = await this.$store.api.post({
                    path: 'api/pricechange/initialize',
                    data: {
                        hash,
                        price,
                        ownerAddress,
                    }});

                if (resp && resp.priceChangeRandomHash) {
                    const signature = await provider.signString(resp.priceChangeRandomHash);
                    const fresp = await this.$store.api.post({
                        path: 'api/pricechange/fulfill',
                        data: {
                            hash,
                            signature,
                            ownerAddress,
                        }});

                    if (fresp && fresp.success) {
                        success = true;
                    }
                }

            } catch(e) {
                console.error(e);

                success = false;
            }

            if (success) {
                this.editPriceSInfo.price = ''+this.priceToAdjust;
                this.showEditPriceDialog = false;
                this.$q.notify({
                    message: 'Price has been updated',
                    color: 'positive'
                });
            } else {
                this.$q.notify({
                    message: 'Error setting the price',
                    color: 'negative',
                });
            }

            this.savingThePrice = false;
        },
        editPrice: function(data) {
            this.editPriceSInfo = data.sInfo;
            this.priceToAdjust = ''+this.editPriceSInfo.price;
            this.initialPrice = ''+this.priceToAdjust;
            this.showEditPriceDialog = true;
        },
        loadItems: async function() {
            this.isLoading = true;
            const provider = this.$store.solana.provider;

            this.chainType = provider.chainType;

            const mine = await provider.getMyNFTs();

            console.error(mine);

            this.items = mine;

            this.isLoading = false;
        },
        checkBlockchain: function() {
            const storeSignedAddress = this.$store.solana.signedAddress;
            if (storeSignedAddress) {
                if (!this.isBlockchainReady) {
                    this.isBlockchainReady = true;
                    this.loadItems();
                }
            } else {
                this.isBlockchainReady = false;
            }
        },
        requestBlockchain: function() {
            this.isBlockchainRequested = true;
            this.$store.solana.request();
        },
	},
    mounted() {
        this.checkBlockchain();
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
