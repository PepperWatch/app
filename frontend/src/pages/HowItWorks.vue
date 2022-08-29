<template>

    <div>
        <h6  class="text-primary">How It Works</h6>

        <div class="row  q-col-gutter-md">
            <div class="col-12 col-md-6">
                <p>PepperWatch ciphers public and private parts of the media into a single MP4 file using extra containers to merge data and AES encryption to cipher private media.</p>

                <p>You can try it yourself. We've created a sample video file for you to check out. You can <a @click="download" class="text-link">download it</a> and play it on your local machine or phone, note that only the small 5-second video is playable. Still, there's much more data in it. Open it on our offline decode tool and enter <a @click="showTheKeyDialog = true" class="text-link">the key</a>  and watch full-length version. No interaction with the server or anything needed to decode the file (feel free to check browser console's network explorer to be sure). You did it for free, as it's a sample and you know the key, usually it's very secret.</p>

                <p>This is where Blockchain comes into play. You can mint your video files as NFT with PepperWatch, using our tool to create a preview of it and let anybody purchase the key to check the full video. PepperWatch encodes the key for every buyer, using a unique signature and x25519-xsalsa20-poly1305, minimizing the chances the key to the full media gets lost or becomes available to the public.</p>

                <p>If somebody purchases the key, you get 80% of the price as NFT owner (feel free to sell it btw), and 10% as the original creator (don't forget you may want to sell it, still having 10% of the income). And 10% for us - to pay for hosting and keeping the work we do.</p>

                <p class="text-primary q-gutter-sm">
                    <b>Sounds cool? Follow us:</b><br />

                    <q-btn unelevated outline color="white" text-color="primary" size="sm" target="_blank" href="https://github.com/PepperWatch/app"><Icon forWhat="github" />&nbsp;github</q-btn>
                    <q-btn unelevated outline color="white" text-color="primary" size="sm" target="_blank" href="https://twitter.com/pepper_watch"><Icon forWhat="twitter" />&nbsp;twitter</q-btn>
                </p>

            </div>
            <div class="col-12 col-md-6">

                <q-dialog v-model="showTheKeyDialog">
                    <q-card>
                        <q-card-section class="row items-center">
                            <span id="the_key_content">a354a4eec607fcf4cc0091f91742687c88587bed8c6c586824273ecec0e5ce4a</span>
                        </q-card-section>

                        <q-card-actions align="right">
                            <q-btn label="Copy" color="primary" @click="copyTheKey" v-close-popup />
                            <q-btn label="Ok" color="primary" v-close-popup />
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <div class="q-gutter-sm">
                    <h6  class="text-primary">Check out the tech off-chain</h6>

                    <q-stepper
                    v-model="step"
                    vertical
                    color="primary"
                    animated
                    flat
                    style="margin-top: 0 !important; padding-top: 0 !important;"
                    >
                        <q-step
                        :name="1"
                        title="Download the sample video file"
                        icon="settings"
                        :done="false"
                        >


                            <q-btn label="Download" :percentage="downloadingProgress" @click="download" color="primary" eneleveted :loading="isDownloading" />
                        </q-step>
                    </q-stepper>

                    <q-stepper
                    v-model="step"
                    vertical
                    color="primary"
                    animated
                    flat
                    style="margin-top: 0 !important; padding-top: 0 !important;"
                    >
                        <q-step
                        :name="1"
                        title="Copy the key to use in offline decoder"
                        icon="settings"
                        :done="false"
                        >
                            <q-btn label="Show The Key" @click="showTheKeyDialog = true" color="primary" eneleveted />
                        </q-step>
                    </q-stepper>


                    <q-stepper
                    v-model="step"
                    vertical
                    color="primary"
                    animated
                    flat
                    style="margin-top: 0 !important; padding-top: 0 !important;"
                    >
                        <q-step
                        :name="1"
                        title="Open it on offline decoder page and check the full version"
                        icon="settings"
                        :done="false"
                        >
                            <q-btn label="Offline Decoder" to="/decode" color="primary" eneleveted />
                        </q-step>
                    </q-stepper>


                    <q-stepper
                    v-model="step"
                    vertical
                    color="primary"
                    animated
                    flat
                    style="margin-top: 0 !important; padding-top: 0 !important;"
                    >
                        <q-step
                        :name="1"
                        title="Check out the minted version"
                        icon="settings"
                        :done="false"
                        >
                            <q-btn label="Check The Mint" to="/v/7oNoNjVTCdQkG8b5vv1Udm7EyQsC6T3nGHPkbJwHGA1x" color="primary" eneleveted />
                        </q-step>
                    </q-stepper>

                </div>

            </div>
        </div>


    </div>

</template>

<script>
import { copyToClipboard } from 'quasar';
import Icon from 'shared/components/Icon';

export default {
	name: 'HowItWorks',
    path: '/howitworks',
	props: {
	},
    components: {
        Icon,
    },
	data() {
		return {
            isLoading: false,
            isDownloading: false,
            downloadingProgress: 0,
            step: 1,
            showTheKeyDialog: false,
		}
	},
    watch: {
    },
	methods: {
        copyTheKey() {
            const key = document.querySelector('#the_key_content').innerText;
            copyToClipboard(key);
            this.$q.notify(''+key+' copied to clipboard');
        },
        async download() {
            this.isDownloading = true;
            this.downloadingProgress = 0;

            const getBlobFromURL = async(url)=>{
                try {
                    const blob = await new Promise((res,rej)=>{
                        var oReq = new XMLHttpRequest();
                        oReq.open("GET", url, true);
                        oReq.responseType = "arraybuffer";


                        oReq.addEventListener('progress', (e)=>{
                            if (e.loaded && e.total) {
                                this.downloadingProgress = (e.loaded / e.total) * 100;
                            }
                        });

                        oReq.onload = function () {
                            var arrayBuffer = oReq.response; // Note: not oReq.responseText
                            if (arrayBuffer) {
                                const blob = new Blob([arrayBuffer]);
                                console.log(blob);
                                res(blob);
                            } else {
                                rej();
                            }
                        };

                        oReq.onerror = function(e) {
                            console.error("Error Status: " + e.target.status);
                            console.error(e);
                            rej();
                        }

                        oReq.send(null);
                    });
                    return blob;
                } catch(e) {
                    return null;
                }
            }

            try {
                if (!this.__downloadURL) {
                    const blob = await getBlobFromURL('https://arweave.net/acR3Ae1ck1c_H0JSCCbTJGs8n4TPGSggTyC2FqAg4qc');
                    const url = window.URL.createObjectURL(blob);
                    this.__downloadURL = url;
                }

                this.downloadLink = document.createElement("a");
                this.downloadLink.download = 'pepperwatch.mp4';
                this.downloadLink.href = this.__downloadURL;
                document.body.appendChild(this.downloadLink);
                this.downloadLink.click();
                document.body.removeChild(this.downloadLink);
                delete this.downloadLink;

                // URL.revokeObjectURL(url);
            } catch(e) {
                console.error(e);

                this.isDownloading = false;
            }

            this.downloadingProgress = 100;
            this.isDownloading = false;
        }
	},
    computed: {
    },
    mounted() {
    },
}
</script>

<style scoped="scoped">
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    a.text-link {
        color: var(--q-primary);
        cursor: pointer;
        font-weight: bold;
    }


</style>

