<template>

    <div>
        <h6>Minted</h6>


        <div class="rounded-borders q-pa-md q-my-md bg-light-blue-1 q-card--bordered">
            <h7><q-icon size="22px" name="info" color="green" />List of NFTs already deployed to blockchain</h7>
        </div>

        <div v-if="!records.length" class="rounded-borders q-pa-md q-my-md bg-negative q-card--bordered text-white">
            You have no minted NFTs. Ready to <router-link to="/prepared" class="text-white">mint one</router-link>?
        </div>

        <div v-for="record in records" v-bind:key="record.id">
            <PreparedMint :userContainer="record" @watch="watch" @remove="remove" v-if="record.getIsMinted()" displayAsMinted/>
        </div>

    </div>

</template>

<script>
import PreparedMints from '../classes/PreparedMints.js';

import PreparedMint from '../components/PreparedMint';

export default {
	name: 'Minted',
    path: '/minted',
    title: 'Minted NFTs',
    authRequired: false,
	props: {
	},
    components: {
        PreparedMint,
    },
	data() {
		return {
			isActive: false,
            records: [],
            showWatchDialog: false,
            watchDialogVideoURL: null,

            showSureRemove: false,
            sureRemoveId: null,
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
            });
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

