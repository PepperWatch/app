<template>

    <div>
        <h6>Tags</h6>

        <CryptoAuth v-if="!connected" @loaded="providerLoaded" ref="cryptoAuth"/>

        <q-toggle label="Show yours only" v-model="yours" v-if="connected" />

        <div class="rounded-borders q-pa-md q-my-md bg-light-blue-1 q-card ">
            <q-icon size="22px" name="info" color="info" />Tag is an unique set or collection of NFTs.
        </div>
<!--
        <div class="rounded-borders q-pa-md q-my-md bg-negative q-card text-white">
            You have no minted NFTs. Ready to <router-link to="/prepared" class="text-white">mint one</router-link>?
        </div> -->


        <q-list>
            <template v-for="tag in tags" v-bind:key="tag" class="q-card tag-card">
                <OnChainTag :tag="tag" />
            </template>
        </q-list>

    </div>

</template>

<script>
import { mapGetters } from 'vuex';
import CryptoAuth from '../components/CryptoAuth';
import OnChainTag from '../components/OnChain/OnChainTag';

export default {
	name: 'Tags',
    path: '/tags',
    title: 'NFT Tags',
    authRequired: false,
	props: {
	},
    components: {
        CryptoAuth,
        OnChainTag,
    },
	data() {
		return {
			isActive: false,
            tags: [],

            connected: false,

            yours: false,
		}
	},
	methods: {
        providerLoaded: function(provider) {
            this.queryTheProvider(provider);
        },
        queryTheProvider: async function(provider) {
            this.loading = true;

            const data = await provider.getAllTags({
                    mintedByConnected: this.yours,
                    allContracts: true,
                });

            if (data.tags) {
                this.tags = data.tags;
            }

            this.loaded = true;
            this.loading = false;

        },
        checkTheBlockchain: async function() {
            const blockchainProvider = this.$store.getters['blockchain/provider'];
            if (blockchainProvider) {
                this.connected = true;

                await this.queryTheProvider(blockchainProvider);
                return true;
            }

            return false;
        }
	},
    mounted() {
        this.checkTheBlockchain()
            .then((success)=>{
                if (!success) {
                    this.$refs.cryptoAuth.requestTerra();
                }
            });
    },
    watch: {
        blockchainSession: function() {
            this.checkTheBlockchain();
        },
    },
    computed: {
        ...mapGetters({
            // map `this.doneCount` to `this.$store.getters.doneTodosCount`
            blockchainSession: 'blockchain/sessionId'
        }),
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tag-card {
  width: 100%;
  /*max-width: 33%;*/
}

</style>

