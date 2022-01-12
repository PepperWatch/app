<template>

    <div>
        <h6>Collection</h6>

        <CryptoAuth v-if="!connected" @loaded="providerLoaded" ref="cryptoAuth"/>


        <div class="q-pa-md row items-start q-gutter-md">
            <q-card v-if="loading" class="q-card my-card">
                <q-img fit="cover" :ratio="16/9">
                <div class="absolute-bottom text-subtitle2 text-center token_address">
                    Loading...
                </div>
                </q-img>
            </q-card>

            <q-card v-for="token in tokens" v-bind:key="token" class="q-card my-card">
                <MintedToken :token="token"/>
            </q-card>
        </div>

    </div>

</template>

<script>
import { mapGetters } from 'vuex';
import CryptoAuth from '../components/CryptoAuth';

export default {
    name: 'Tag',
    path: '/tag/:tag',
    title: 'Collection',
    authRequired: false,
    props: {
    },
    components: {
        CryptoAuth,
    },
    data() {
        return {
            isActive: false,
            connected: false,

            tokens: [],
            loading: true,
            loaded: false,
        }
    },
    methods: {
        providerLoaded: function(provider) {
            this.queryTheProvider(provider);
        },
        queryTheProvider: async function(provider) {
            this.loading = true;

            const data = await provider.getAllTokens({
                    mintedByConnected: this.yours,
                    allContracts: true,
                });

            if (data.tokens) {
                this.tokens = data.tokens;
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

</style>

