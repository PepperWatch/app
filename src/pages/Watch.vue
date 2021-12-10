<template>

    <div class="relative-position">
        <h6>{{ videoTitle }}</h6>

        <div class="row">
            <div class="col-8">
                <div v-if="videoURL" class="q-py-md">
                    <q-video :src="videoURL" :ratio="16/9"/>
                </div>

                <div v-if="!videoURL && !initializing" class="q-py-md">

                    <div class="rounded-borders q-pa-md q-my-md bg-light-blue-1 q-card--bordered">
                        <h5><q-icon size="32px" name="info" color="red" />No media found</h5>

                        <p>Hash not found or media has not been deployed to IPFS yet.</p>
                    </div>


                </div>
            </div>
            <div class="col-4">
                <div class="q-pa-md">

                    <div v-if="videoDescription"  class="q-pb-sm">
                        {{ videoDescription }}
                        <q-separator />
                    </div>

                    <div v-if="!!price">
                        <span class="text-yellow-10 text-h6"><q-icon color="yellow-10" name="circle"  size="25px"/> {{priceAsLuna}} LUNA</span>
                    </div>

                    <div v-if="mintIpfsHash && !gettingFromBlockchain"  class="q-pt-sm">
                        <p v-if="!viewingDecoded">
                            <q-icon name="lock" color="primary" size="20px" /> This NFT has hidden media. You need a key to view it
                        </p>
                        <p v-if="viewingDecoded">
                            <q-icon name="lock_clock" color="primary" size="20px" /> You are watching NFT hidden media
                        </p>

                        <div v-if="!viewingDecoded">

                            <div class="row no-wrap items-left q-gutter-sm">
                                <q-btn v-if="!userHaveAKey" stretch color="primary" label="Already have one?" @click="haveAKey" />
                                <q-btn v-if="!userHaveAKey" :disable="!isOkOnAPI" stretch color="primary" label="Get it from Blockchain" @click="getFromBlockchain" />
                                <q-space />
                            </div>

                            <div v-if="userHaveAKey">
                                <q-input v-model="userKey" filled type="text" label="Key Password" borderless :error="userKeyError"/>

                                <div class="row no-wrap items-left q-gutter-sm">
                                    <q-btn stretch color="primary" label="Check Hidden Content" :loading="decoding" @click="decodeByUserKey" />
                                    <q-btn stretch color="primary" label="I Don't :(" :disabled="decoding" @click="dontHaveAKey" />
                                    <q-space />
                                </div>
                            </div>

                        </div>

                    </div>

                    <div v-if="gettingFromBlockchain" class="relative-position">

                        <q-inner-loading :showing="initializingBlockchain"  color="primary" />

                        <div v-if="mintIpfsHash"  class="q-pt-sm">
                            <q-input v-model="mintIpfsHash" filled type="textarea" label="Mint IPFS Hash" autogrow borderless disable/>
                        </div>

                        <div v-if="mintIpfsHash"  class="q-pt-sm">
                            <CryptoAuth @connected="connectedToBlockchain"/>
                        </div>

                        <div v-if="connectedAddress"  class="q-pt-sm">
                            <q-input v-model="connectedAddress" filled type="textarea" label="Current User Address" autogrow borderless disable/>
                        </div>

                        <div v-if="connectedAddress && !encryptionPublicKey"  class="q-pt-sm">
                            <q-btn stretch color="primary" label="Generate Public Key" @click="askForPublicKey" />
                        </div>

                        <div v-if="encryptionPublicKey"  class="q-pt-sm">
                            <q-input v-model="encryptionPublicKey" filled type="textarea" label="Current User Public Key" autogrow borderless disable/>
                        </div>

                        <div v-if="encryptionPublicKey"  class="q-pt-sm">
                            <q-btn stretch color="primary" label="Do Purchase" :loading="purchasing"  @click="emulatePurchase" :disable="!!personalPublicDecodeKey"/>

                            <span v-if="!!personalPublicDecodeKey">&nbsp;&nbsp;&ndash; already purchased</span>

                            <p class="text-caption text-grey">The step of actual purchase. User notifies our servers user are going to purchase. user sends transaction to blockchain. Our servers publish personalPublicDecodeKey on blockchain after successful purchase. User gets personalPublicDecodeKey from blockchain.</p>
                            <q-separator />
                        </div>

                        <div v-if="personalPublicDecodeKey"  class="q-pt-sm">
                            <q-input v-model="personalPublicDecodeKey" filled label="Per Account Public Decode Key" borderless disable dense/>

                            <p class="text-caption text-grey">This data is safe to be stored on Blockchain. As it may be used to decode original video only with user's private key (handled by Metamask or Terra Station)</p>
                        </div>

                        <div v-if="personalPublicDecodeKey"  class="q-pt-sm">
                            <q-btn stretch color="primary" label="Decode The Key" @click="decodeTheKey" />
                        </div>

                        <div v-if="personalPrivateDecodeKey"  class="q-pt-sm">
                            <q-input v-model="personalPrivateDecodeKey" filled type="textarea" label="Per Account Private Decode Key" autogrow borderless disable/>

                            <p class="text-caption text-grey">This one decoded by Metamask/TerraStation. Value is unique for each user address, but it's enough data to decrypt video. Should be stored in browser only.</p>
                            <q-separator />
                        </div>

                        <div v-if="videoViewKey"  class="q-pt-sm">
                            <q-input v-model="videoViewKey" filled type="textarea" label="Per Account Private Key" autogrow borderless disable/>
                            <q-separator />

                            <q-btn stretch color="primary" label="Show Private Media" :loading="showingPrivate" @click="showPrivate" />
                        </div>

                    </div>

                </div>
            </div>
        </div>

        <q-inner-loading :showing="initializing">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

        <MP4StegAsync />

        <CryptoAuth @loaded="providerLoaded" ref="publicCryptoAuth" :visible="false"/> <!-- this is the one to connect to query function (no auth) -->

    </div>

</template>

<script>
import Viewer from '../classes/Viewer';
// import ConnectWithMetamask from '../components/Auth/ConnectWithMetamask';
import Crypt from '../classes/Crypt.js';

import CryptoAuth from '../components/CryptoAuth';
import MP4StegAsync from '../components/AsyncComponents/MP4StegAsync';

import { mapGetters } from 'vuex';

export default {
	name: 'Watch',
    path: '/v/:hash',
    title: 'Watch',
    authRequired: false,
	props: {
	},
    components: {
        CryptoAuth,
        MP4StegAsync,
    },
	data() {
		return {
			isActive: false,
            viewer: null,
            initializing: true,
            initializingBlockchain: false,

            decoding: false,
            viewingDecoded: false,

            userHaveAKey: false,
            userKey: '',
            userKeyError: false,

            gettingFromBlockchain: false,

            mintIpfsHash: null,

            videoURL: null,
            videoTitle: null,
            videoDescription: null,
            videoHash: null,

            connectedAddress: null,
            encryptionPublicKey: null,

            blockchainProvider: null,

            purchasing: false,
            personalPublicDecodeKey: null,
            personalPrivateDecodeKey: null,

            videoViewKey: null,
            showingPrivate: false,

            price: null,
            defaultPrice: 1000000,

            isOkOnAPI: false,
		}
	},
    watch: {
        blockchainSession: function() {

            this.getVideoInfo();
        },
    },
	methods: {
        async getFromBlockchain() {
            this.videoViewKey = null;
            this.gettingFromBlockchain = true;
        },
        async dontHaveAKey() {
            this.userHaveAKey = false;
        },
        async haveAKey() {
            this.userHaveAKey = true;
        },
        async decodeByUserKey() {
            this.decoding = true;

            this.videoViewKey = this.userKey;
            const success = await this.showPrivate();

            if (!success) {
                this.userKeyError = true;
                setTimeout(()=>{
                    this.userKeyError = false;
                }, 1000);
            } else {
                this.viewingDecoded = true;
            }

            this.decoding = false;
        },
        async showPrivate() {
            this.showingPrivate = true;

            const decodedURL = await this.viewer.getDecodedVideoURL(this.videoViewKey);
            if (decodedURL) {
                this.videoURL = decodedURL;

                return true;
            }

            return false;
        },
        async decodeTheVideoKey() {
            const c = new Crypt();
            this.videoViewKey = await c.decode(this.personalPrivateDecodeKey, this.connectedAddress);
        },
        async decodeTheKey() {
            this.personalPrivateDecodeKey = await this.blockchainProvider.decryptMessage(this.personalPublicDecodeKey);
            await this.decodeTheVideoKey();
        },
        async emulatePurchase() {
            this.purchasing = true;


            let price = this.defaultPrice;
            if (this.price) {
                price = this.price;
            }

            await this.blockchainProvider.doPurchase(this.mintIpfsHash, price);

            console.log('asking validator to check blockchain...');

            const params = {
                path: '/fill',
                data: {
                    // encryptionPublicKey: this.encryptionPublicKey,
                    userAccount: this.connectedAddress,
                    // videoHash: this.videoHash,
                    media: this.mintIpfsHash,
                    contract: this.blockchainProvider.contractAddress,
                },
            };
            const resp = await this.$store.dispatch('api/post', params);

            if (resp && resp.txhash) {
                console.log('validator notified us about her transaction: '+resp.txhash);
                await this.blockchainProvider.waitForTransaction(resp.txhash);
            }

            // if (resp && resp.message) {
            //     this.personalPublicDecodeKey = resp.message;
            // }
            //
            //
            const theKey = await this.blockchainProvider.getPrivateKey(this.mintIpfsHash);
            this.personalPublicDecodeKey = theKey;
            // this.personalPrivateDecodeKey = theKey;
            //
            await this.decodeTheKey();

            this.purchasing = false;
        },
        async askForPublicKey() {
            this.encryptionPublicKey = await this.blockchainProvider.getEncryptionPublicKey();
        },
        async connectedToBlockchain(blockchainProvider) {
            this.initializingBlockchain = true;

            this.connectedAddress = blockchainProvider.connectedAddress;
            this.blockchainProvider = blockchainProvider;

            this.getVideoInfo();

        },
        async providerLoaded(blockchainProvider) {
            // loaded, but not connected
            await this.getVideoPublicInfo(blockchainProvider);
        },
        async getVideoPublicInfo(withProvider) {
            try {
                const info = await withProvider.queryContract({
                    query: { nft_info: {token_id: this.mintIpfsHash}}
                });
                if (info && info.extension && info.extension.watch_price) {
                    this.price = parseInt(info.extension.watch_price, 10);
                }
            } catch(e) {
                console.error(e);
            }
        },
        async getVideoInfo() {
            const blockchainProvider = this.$store.getters['blockchain/provider'];

            this.blockchainProvider = blockchainProvider;

            if (this.blockchainProvider) {
                this.connectedAddress = blockchainProvider.connectedAddress;

                const info = await this.blockchainProvider.queryContract({
                    query: { nft_info: {token_id: this.mintIpfsHash}}
                });

                if (info && info.extension && info.extension.watch_price) {
                    this.price = parseInt(info.extension.watch_price, 10);
                }

                if (this.blockchainProvider.hasEncryptionPublicKey()) {
                    this.encryptionPublicKey = await this.blockchainProvider.getEncryptionPublicKey();
                }

                const alreadyPurchasedKey = await this.blockchainProvider.getPrivateKey(this.mintIpfsHash);

                if (alreadyPurchasedKey) {
                    this.personalPublicDecodeKey = alreadyPurchasedKey;
                    await this.decodeTheKey();
                }

                this.initializingBlockchain = false;
            }
        },
        async initialize() {
            this.mintIpfsHash = this.$route.params.hash;
            this.viewer = new Viewer({
                $store: this.$store,
            });

            try {
                await this.viewer.loadInfoByHash(this.mintIpfsHash);
            } catch(e) {
                console.error(e);
            }

            this.isOkOnAPI = this.viewer.isOkOnAPI;

            // we may have video url from ipfs json, even if our server is offline
            this.videoURL = await this.viewer.getVideoURL();
            this.videoTitle = await this.viewer.getVideoTitle();
            this.videoDescription = await this.viewer.getVideoDescription();
            this.videoHash = await this.viewer.getVideoHash();

            try {
                await this.getVideoInfo();
            } catch(e) {
                console.error(e);
            }

            this.initializing = false;
        },
	},
    mounted() {
        this.initialize();

        const blockchainProvider = this.$store.getters['blockchain/provider'];
        if (!blockchainProvider) {
            this.$refs.publicCryptoAuth.requestTerra();
        }
        // alert(this.$route.params.hash);
        // this.viewer = new Viewer({
        //     $store: this.$store,
        // });

        // this.mintIpfsHash = this.$route.params.hash;

        // this.viewer.loadInfoFromApiByHash(this.$route.params.hash)
        //     .then(async ()=>{
        //         this.videoURL = await this.viewer.getVideoURL();
        //     });
    },
    computed: {
        ...mapGetters({
            // map `this.doneCount` to `this.$store.getters.doneTodosCount`
            blockchainSession: 'blockchain/sessionId'
        }),
        priceAsLuna() {
            return ((this.price/1000000)).toFixed(6);
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

