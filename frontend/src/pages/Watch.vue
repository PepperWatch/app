<template>

    <div class="relative-position">

        <DecodeKeyPurchaser v-if="mintIpfsHash" :hash="mintIpfsHash" @video="onVideoInfo" @decoded="onDecoded" @public="backToPublic" />

        <div class="row">
            <div class="col-8">
                <div v-if="video && video.videoURL" class="q-py-md">
                    <VideoPlayer :url="(decodedURL && showingDecoded) ? decodedURL : video.videoURL" />
                    <!-- <q-video :src="video.videoURL" :ratio="16/9"/> -->
                </div>

                <div v-if="!video && !initializing" class="q-py-md">

                    <div class="rounded-borders q-pa-md q-my-md bg-primary text-white q-card--bordered">
                        <h5><q-icon size="32px" name="info" color="red" />No media found</h5>

                        <p>Hash not found or media has not been deployed to IPFS yet.</p>
                    </div>


                </div>
            </div>
            <div class="col-4">
                <div class="q-pa-md">


                </div>
            </div>
        </div>

        <MP4StegAsync />

    </div>

</template>

<script>
import MP4StegAsync from '../components/AsyncComponents/MP4StegAsync';
import DecodeKeyPurchaser from '../components/DecodeKeyPurchaser';
import VideoPlayer from '../components/VideoPlayer';

        // <p v-if="!viewingDecoded">
        //     <q-icon name="lock" color="primary" size="20px" /> This NFT has hidden media. You need a key to view it
        // </p>
        // <p v-if="viewingDecoded">
        //     <q-icon name="lock_clock" color="primary" size="20px" /> You are watching NFT hidden media
        // </p>

export default {
	name: 'Watch',
    path: '/v/:hash',
    title: 'Watch',
    authRequired: false,
	props: {
	},
    components: {
        MP4StegAsync,
        DecodeKeyPurchaser,
        VideoPlayer,
    },
	data() {
		return {
			isActive: false,
            mintIpfsHash: null,
            video: null,

            decodedURL: null,
            showingDecoded: false,

            initializing: true,
		}
	},
    watch: {
    },
	methods: {
        onVideoInfo(video) {
            this.video = video;
            this.initializing = false;
        },
        backToPublic() {
            this.showingDecoded = false;
        },
        onDecoded(url) {
            this.decodedURL = url;
            this.showingDecoded = true;
        },
        async initialize() {
            this.mintIpfsHash = this.$route.params.hash;
        },
	},
    mounted() {
        this.initialize();
    },
    computed: {
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
