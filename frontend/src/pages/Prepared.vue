<template>

    <div>
        <h6 class="text-primary">Prepared Mints <q-btn to="/encode" color="primary">Encode New</q-btn> </h6>

        <div class="rounded-borders q-pa-md q-my-md bg-primary q-card--bordered text-white" v-if="!isBrowserOptimizedFor && !initializing">
            The minting process is optimized for desktop Google Chrome browser with Phantom wallet extension
        </div>

        <div class="rounded-borders q-pa-md q-my-md bg-primary q-card--bordered text-white q-pb-xs ">
            <h5 style="font-size: 20px;"><q-icon size="26px" name="info" color="white" bg-color="primary" />We do not store your prepared media</h5>

            <p>Note that everything you see on this page is stored in your browser cache.
            We respect your privacy and do not store any data about you neither your media files. You are free to download encoded media, store it on your local machine and decode any time you want on <router-link to="/decode" style="color: white">decode page</router-link>. Publish your media to Blockchain (Mint Media) to sell it as NFT and make money selling its private content to the audience.</p>

            <p class="q-mb-xs">You can manage your minted NFTs on <router-link to="/yours" style="color: white">this page</router-link></p>
        </div>

        <div v-if="!records.length && !initializing" class="rounded-borders q-pa-md q-my-md bg-negative q-card--bordered text-white">
            You have no prepared mints. Ready to <router-link to="/encode" class="text-white">create one</router-link>?
        </div>

        <div v-for="record in records" v-bind:key="record.id">
            <PreparedMint :userContainer="record" @watch="watch" @remove="remove"/>
        </div>

            <q-dialog v-model="showWatchDialog" position="bottom">
                <q-card style="width: 900px; max-width: 80vw;">

                    <q-video v-if="watchDialogVideoURL" :ratio="16/9" :src="watchDialogVideoURL" />

                    <q-linear-progress :value="0.6" color="pink" />

                    <q-card-section class="row items-center no-wrap">
                        <div>
                            <div class="text-weight-bold">&nbsp;</div>
                            <div class="text-grey">&nbsp;</div>
                        </div>

                        <q-space />

                        <q-btn flat round icon="fast_rewind" />
                        <q-btn flat round icon="pause" />
                        <q-btn flat round icon="fast_forward" />
                    </q-card-section>
                </q-card>
            </q-dialog>


            <q-dialog v-model="showSureRemove">
                <q-card>
                    <q-card-section class="row items-center">
                        <q-avatar icon="delete_forever" color="primary" text-color="white" />
                        <div class="q-ml-sm">
                            <p>You are sure that you want to remove this prepared mint?</p>

                            <p>You can still use it for decoding if you downloaded the file and write down the password for it.</p>
                        </div>
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="primary" v-close-popup />
                        <q-btn label="Yes, Remove It" color="negative" v-close-popup @click="doRemove" />
                    </q-card-actions>
                </q-card>
            </q-dialog>


        <MP4StegAsync />

        <q-inner-loading :showing="initializing">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>

    </div>

</template>

<script>
import PreparedMints from '../classes/PreparedMints.js';

import PreparedMint from '../components/PreparedMint';

import MP4StegAsync from '../components/AsyncComponents/MP4StegAsync';

export default {
	name: 'Prepared',
    path: '/prepared',
    title: 'Prepared Mints',
    authRequired: false,
	props: {
	},
    components: {
        PreparedMint,
        MP4StegAsync,
    },
	data() {
		return {
			isActive: false,
            records: [],
            showWatchDialog: false,
            watchDialogVideoURL: null,

            showSureRemove: false,
            sureRemoveId: null,

            isBrowserOptimizedFor: false,

            initializing: true,
		}
	},
    watch: {
    },
	methods: {
        watch: function(blobURL) {
            // alert(blobURL);

            this.watchDialogVideoURL = blobURL;
            this.showWatchDialog = true;

        },
        remove: function(uniqId) {
            this.showSureRemove = true;
            this.sureRemoveId = uniqId;
        },
        doRemove() {
            const uniqId = this.sureRemoveId;

            let toRemoveI = null;
            for (let i = 0; i < this.records.length; i++) {
                if (this.records[i].id == uniqId) {
                    toRemoveI = i;
                }
            }

            if (toRemoveI !== null) {
                const recordToRemove = this.records[toRemoveI];
                this.records.splice(toRemoveI, 1);

                recordToRemove.remove();
            }
        }
	},
    mounted() {
        const mints = new PreparedMints();
        mints.restore()
            .then(()=>{
                this.records = mints.records;

                setTimeout(()=>{
                    const isPhantomInstalled = window.phantom?.solana?.isPhantom;
                    if (this.$q.platform.is.chrome &&  this.$q.platform.is.desktop && isPhantomInstalled) {
                        this.isBrowserOptimizedFor = true;
                    } else {
                        this.isBrowserOptimizedFor = false;
                    }

                    this.initializing = false;
                }, 500);
            });

    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
