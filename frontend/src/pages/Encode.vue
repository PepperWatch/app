<template>

  <div>
    <h6  class="text-primary">Prepare The Mint</h6>

    <q-stepper
      v-model="step"
      vertical
      color="primary"
      active-icon="tune"
      animated
    >
        <q-step
        :name="0"
        title="Upload the video file"
        icon="cloud_upload"
        :done="step > 0"
        >

            <p>Upload the video file you want to mint as NFT.</p>

            <p>The system will let you extract the copy of it to be available to check out and watch publicly for anybody while keeping the rest
            (full-length high-resolution original content) to paying watchers.</p>

            <p>You are free to mint it as NFT on Blockchain or download and distribute it in traditional ways.</p>

            <Uploader @filePrepared="filePrepared" ref="originalUploader" maxSize="30"/>
            <q-btn color="primary" label="Or Use The Sample Video" @click="useSample" />

        </q-step>


        <q-step
        :name="1"
        title="Prepare the public part"
        icon="cloud_upload"
        :done="step > 1"
        >

            <p>Select the part of the video you want to be available for public watching for free.</p>

            <p>And adjust blur settings if you want to reduce the quality.</p>

            <MediaDown :file="selectedFile" @blob="containerPrepared" @screenshotBlob="screenshotPrepared"/>

            <p>Encoding is a time-consuming process, please let it a few minutes to do its job.
            We are doing all calculations and ciphering in your browser window, nothing is sent to our servers, and your privacy is important.</p>
<!--
            <q-stepper-navigation>
            <q-btn @click="step = 2" color="primary" label="Continue"/>
            </q-stepper-navigation> -->
        </q-step>

        <q-step
        :name="2"
        title="Check it"
        icon="preview"
        caption=""
        :done="step > 2"
        >



            Check everything is fine:

            <div class="q-pa-md row items-start q-gutter-md">
                <UserFilePreview label="Container" :userFile="selectedContainer"/>
                <UserFilePreview label="Content" :userFile="selectedFile"/>
            </div>

            <q-stepper-navigation>
            <q-btn @click="step = 3" color="primary" label="Continue"/>
            </q-stepper-navigation>
        </q-step>


        <q-step
        :name="3"
        title="Encode"
        icon="enhanced_encryption"
        :done="step > 3"
        >
            Encode content into the container

            <q-stepper-navigation>
            <q-btn @click="doEncode" color="primary" label="Encode" :loading="encoding"/>
            </q-stepper-navigation>
        </q-step>

        <q-step
        :name="4"
        title="Download container"
        icon="file_download"
        :done="step > 4"
        >
            <!-- Download encoded container. Container decode key: {{ userContainerPassword }} (copy it somewhere)<br>
            This will take some time (up to 1 minute on 10MB video + container) as we are doing this with no threads. We'll optimize this. -->

            <q-stepper-navigation>
                <q-btn color="primary" label="Go To Prepared Mints" to="/prepared" />
            <!-- <q-btn @click="doDownload" color="primary" label="Download" :loading="downloading"/> -->
            </q-stepper-navigation>
        </q-step>

    </q-stepper>

  </div>

</template>

<script>

import Uploader from '../components/Uploader';
import UserFilePreview from '../components/MediaHelpers/UserFilePreview';
import UserFile from '../classes/UserFile.js';
import MediaDown from '../components/MediaDown';

export default {
	name: 'Encode',
    path: '/encode',
    title: 'Prepare The Mint',
    authRequired: false,
	props: {
	},
    components: {
        Uploader,
        UserFilePreview,
        MediaDown,
    },
	data() {
		return {
			isActive: false,
            step: 0,

            selectedFile: null,
            selectedContainer: null,
            processedContainer: null,

            screenshotBlob: null,

            userContainerPassword: null,

            downloading: false,
            encoding: false,
		}
	},
    watch: {
    },
	methods: {
        useSample() {
            this.$refs.originalUploader.sample();
        },
        filePrepared(userFile) {
            this.selectedFile = userFile;

            this.selectedFile.hash().then((value)=>{
                console.error('hash', value);
            });

            this.step = 1;
        },
        screenshotPrepared(screenshotBlob) {
            this.screenshotBlob = screenshotBlob;
        },
        containerPrepared(containerBlob) {
            const userFile = new UserFile({
                file: containerBlob,
                filename: 'container.mp4',
                size: containerBlob.size,
            });
            this.selectedContainer = userFile;

            this.step = 2;
        },
        fileUploaded(userFile) {
            this.uploadedFile = userFile;
            this.step = 2;
        },
        // async storeOnApi() {
        //     const containerHash = await this.processedContainer.containerUserFile.hash();
        //     const originalHash = await this.processedContainer.privateUserFile.hash();

        //     const params = {
        //         path: '/storevideo',
        //         data: {
        //             containerHash: containerHash,
        //             originalHash: originalHash,
        //             key: this.processedContainer.getKeyAsHex(),
        //         },
        //     };
        //     const resp = this.$store.dispatch('api/post', params);

        //     return (resp.success || false);
        // },
        doEncode() {
            this.encoding = true;
            this.processedContainer = this.selectedContainer.toContainer();

            if (this.screenshotBlob) {
                this.processedContainer.setPublicThumbBlob(this.screenshotBlob);
            }

            this.processedContainer.compose(null, this.selectedFile) // null - generate password
                .then(()=>{
                    this.encoding = false;

                    // const preparedMints = new PreparedMints();
                    // preparedMints.add(this.processedContainer);
                    // this.storeOnApi(); // no need to do this. Let's store when it's minted.

                    this.userContainerPassword = this.processedContainer.getKeyAsHex();
                    this.step = 4;
                });
        },
        doDownload() {
            this.downloading = true;
            this.processedContainer.download()
                .then(()=>{
                    this.downloading = false;
                });
        }
	},
  mounted() {

    // this.$store.dispatch('api/get', {path: '/store'})
    //     .then((resp)=>{
    //         console.error('resp', resp);
    //     });
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.my-card {
  width: 100%;
  max-width: 250px;
}
</style>
