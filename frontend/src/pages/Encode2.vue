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
        title="Upload video files"
        icon="cloud_upload"
        :done="step > 0"
        >

            <p>Upload the video files you want to mint as NFT.</p>

            <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                    <p>Please select the public part, which will be visible to everybody:</p>

                    <Uploader @filePrepared="filePreparedPublic" ref="originalUploaderPublic" accept="mp4" maxSize="20" />
                </div>
                <div class="col-12 col-md-6">
                    <p>And the one available for purchase (longer, better quality, etc):</p>

                    <Uploader @filePrepared="filePreparedPrivate" ref="originalUploaderPrivate"/>
                </div>
            </div>
        </q-step>


        <q-step
        :name="1"
        title="Prepare the public part"
        icon="cloud_upload"
        :done="step > 1"
        >

            <p>Select the part of video you want to be available for public watching for free.</p>

            <p>And adjust blur settings if you want to reduce the quality.</p>

            <MediaDown :file="selectedFile" @blob="containerPrepared" @screenshotBlob="screenshotPrepared"/>

            <p>Encoding is time-consuming process, please let it few minutes to do its job.
            We are doing all calculations and ciphering in your browser window, nothing is sent to our servers, your privacy is important.</p>
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
                <UserFilePreview label="Container" :userFile="selectedFilePublic"/>
                <UserFilePreview label="Content" :userFile="selectedFilePrivate"/>
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
import VideoProcessor from '../classes/VideoProcessor.js';

export default {
	name: 'Encode',
    path: '/encode2',
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

            selectedFilePublic: null,
            selectedFilePrivate: null,

            selectedFilePublicHashed: false,
            selectedFilePrivateHashed: false,

            selectedFilePublicScreenshotBlob: null,
            selectedFilePrivateScreenshotBlob: null,

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
        filePreparedPublic(userFile) {
            this.selectedFilePublic = userFile;
            this.selectedFilePublic.hash().then(()=>{
                this.selectedFilePublicHashed = true;
                this.filesPrepared();
            });
        },
        filePreparedPrivate(userFile) {
            this.selectedFilePrivate = userFile;
            this.selectedFilePrivate.hash().then(()=>{
                this.selectedFilePrivateHashed = true;
                this.filesPrepared();
            });
        },
        async filesPrepared() {
            if (!this.selectedFilePrivateHashed || !this.selectedFilePublicHashed) {
                return false;
            }

            // prepare screenshot
            let videoProcessor = new VideoProcessor({blob: this.selectedFilePrivate.file, userFile: this.selectedFilePrivate});
            this.selectedFilePrivateScreenshotBlob = await videoProcessor.getSrcreenShotBlob();

            videoProcessor = new VideoProcessor({blob: this.selectedFilePublic.file, userFile: this.selectedFilePublic});
            this.selectedFilePublicScreenshotBlob = await videoProcessor.getSrcreenShotBlob();

            this.step = 2;
            return true;
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
        doEncode() {
            this.encoding = true;
            this.processedContainer = this.selectedFilePublic.toContainer();
            if (this.selectedFilePublicScreenshotBlob) {
                this.processedContainer.setPublicThumbBlob(this.selectedFilePublicScreenshotBlob);
            }
            if (this.selectedFilePrivateScreenshotBlob) {
                this.processedContainer.setPrivateThumbBlob(this.selectedFilePrivateScreenshotBlob);
            }

            this.processedContainer.compose(null, this.selectedFilePrivate) // null - generate password
                .then(()=>{
                    this.encoding = false;
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
