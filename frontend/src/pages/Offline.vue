<template>

    <div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4 q-mb-sm">
                <div>
                    <!-- <h1 class="text-primary serif" style="margin-top: 0; margin-bottom: 16px;">Another level of security for your media files</h1> -->

                    <h5 class="text-primary">Encode Media</h5>

                    <p class="text-primary">
                        <q-btn unelevated color="primary" size="md" @click="onSelectFileClick">Select Local Media File</q-btn>
                        <input type="file" @change="fileSelected" class="fileInput" ref="fileInput">
                        <AllBodyDropFileZone @file="fileSelected" />
                    </p>

                    <p class="text-primary">
                        or just drop your media files into this page
                    </p>

                </div>
            </div>
            <div class="col-12 col-md-8">

                <q-list bordered separator v-if="prepared.length">
                    <PreparedLocalFile v-for="data in prepared" @preview="onShowPreview"
                        @analyse="onShowAnalyse" v-bind:key="data.id" :file="data.file" :thumb="data.thumb" />
                </q-list>

            </div>
        </div>

        <MediaBrowser :file="fileToShow" @hide="onMediaBrowserHide" />
        <AnalyseFileDialog :file="fileToAnalyse" @hide="onAnalyseFileDialogHide" />
        <MP4StegAsync />
    </div>

</template>

<script>
// import Telegram from 'shared/components/Auth/Telegram';
import PrepareFileDialog from 'shared/components/Services/PrepareFile/PrepareFileDialog.vue';
import PreparedLocalFile from 'shared/components/Services/PrepareFile/PreparedLocalFile.vue';
import AllBodyDropFileZone from 'shared/components/Helpers/AllBodyDropFileZone';
import MP4StegAsync from 'shared/components/AsyncComponents/MP4StegAsync.js';
// import Drive from 'shared/classes/drive/telegram/Drive.js';
import MediaBrowser from 'shared/components/Services/Telegram/MediaBrowser.vue';
import AnalyseFileDialog from 'shared/components/Services/AnalyseFile/AnalyseFileDialog.vue';

export default {
	name: 'Encode/Decode Offline',
    path: '/offline',
	props: {
	},
    components: {
        AllBodyDropFileZone,
        PreparedLocalFile,
        MP4StegAsync,
        MediaBrowser,
        AnalyseFileDialog,
        // Drive,
    },
	data() {
		return {
            isLoading: false,
            prepared: [],
            // folders: [],
            //
            fileToShow: null,
            fileToAnalyse: null,
		}
	},
    watch: {
    },
	methods: {
        onShowAnalyse(file) {
            this.fileToAnalyse = file;
        },
        onAnalyseFileDialogHide() {
            this.fileToAnalyse = null;
        },
        onShowPreview(file) {
            this.fileToShow = file;
        },
        onMediaBrowserHide() {
            this.fileToShow = null;
        },
        onSelectFileClick() {
            this.$refs.fileInput.click();
        },
        async fileSelected(ev) {
            let files = [];
            if (ev.target && ev.target.files) {
                files = ev.target.files;
            } else {
                files.push(ev);
            }

            if (!files[0]) {
                return;
            }

                // this.prepared.push({
                //     file: files[0],
                //     thumb: files[0],
                //     id: ( ''+Math.random() ),
                // });

                // this.fileToShow = files[0];

            this.showDialog(files[0]);
            this.$refs.fileInput.value = null;
            // this.$refs.fileInput.value = null;

        },
        async showDialog(file) {
            this.$q.dialog({
                component: PrepareFileDialog,
                componentProps: {
                    file: file,
                    isForTelegram: false,
                }
            }).onOk((results) => {

                console.error(results);
                this.prepared.push({
                    file: results.file,
                    thumb: results.thumb,
                    id: ( ''+Math.random() ),
                });

            }).onCancel(() => {
                // console.log('Cancel')
            }).onDismiss(() => {
                // console.log('Called on OK or Cancel')
            });
        },
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

