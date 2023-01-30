<template>

    <div style="position: relative; height: 70vh; overflow-x: hidden; scroll-behavior: smooth;" ref="scrollDiv" id="drive-scroll">
        <div class="foldersTab" ref="foldersTab">
            <q-list bordered class="q-pa-md">
                <q-infinite-scroll @load="loadMore" :offset="600" :debounce="50" scroll-target="#drive-scroll" >
                    <DriveFolder v-for="folder in filteredFolders" v-bind:key="folder.name" :folder="folder" @browsing="onBrowsing" :hidden="browsing" />
                    <div style="clear: both"></div>
                    <template v-slot:loading>
                        <div class="row justify-center q-my-md">
                            <q-spinner-dots color="primary" size="40px" />
                        </div>
                    </template>
                </q-infinite-scroll>
            </q-list>
        </div>
        <div class="browsingTab" ref="browsingTab" :class="{ active: browsingReady }">
            <DriveFolderBrowser v-if="browsing" :folder="browsingFolder" @back="onBack" @ready="onBrowsingReady" />
        </div>
    </div>
    <MP4StegAsync />

</template>
<style>
    .foldersTab {
        position: absolute;
        right: 0;
        left: 0;
        top: 0;
    }

    .browsingTab {
        position: absolute;
        right: 0;
        left: 0;
        top: 0;
        background-color: black;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
    }

    .browsingTab.active {
        transform: translateX(0%);
    }

    .q-card {
        /*background-color: transparent !important;*/
    }
    .q-item {
        padding: 0 !important;
    }

    .drive-folder {
        float: left;
        width: 20%;
        cursor: pointer;
        opacity: 1;
        transition: opacity 2s ease-in-out;
    }

    .drive-folder:hover {
        opacity: 0.7;
    }

    .drive-folder-inner {
        padding: 4px;
    }

    .drive-folder-file {
        width: 100%;
        max-width: 250px;
    }

</style>
<script>
import Drive from 'shared/classes/drive/telegram/Drive.js';
import DriveFolder from './DriveFolder.vue';
import DriveFolderBrowser from './DriveFolderBrowser.vue';
import MP4StegAsync from 'shared/components/AsyncComponents/MP4StegAsync.js';


//
export default {
    name: 'Drive',
    props: {
    },
    components: {
        DriveFolder,
        DriveFolderBrowser,
        MP4StegAsync,
    },
    data() {
        return {
            initialized: false,
            browsing: false,
            browsingFolder: null,
            browsingReady: false,
            folders: [],
        }
    },
    watch: {
        authenticated() {
            if (this.authenticated && !this.initialized) {
                this.initialize();
                // this.load();
            }
        }
    },
    methods: {
        async loadMore(index, done) {
            if (!this.browsing && this.drive) {
                const loaded = await this.drive.fetchMoreFolders();
                if (loaded) {
                    await this.drive.restoreFilePreviewsFromCache();
                }
            }

            done();
        },
        onBrowsing(folder) {
            if (folder) {
                this.browsing = true;
                this.browsingFolder = folder;

                this.$q.localStorage.set('tg_browsing_folder', folder.id);
            } else {
                this.browsing = false;
                this.browsingFolder = null;


                this.$q.localStorage.set('tg_browsing_folder', null);
            }


            // this.showUploadDialog();
            //
        },
        onBrowsingReady() {
            this.browsingReady = true;
            this.$refs.scrollDiv.scrollTop = 0;

            const br = this.$refs.foldersTab.getBoundingClientRect();
            const foldersTabHeight = br.height;

            if (foldersTabHeight) {
                this.$refs.browsingTab.style.minHeight = ''+Math.ceil(foldersTabHeight)+'px';
            }
        },
        onBack() {
            // this.browsing = false;
            // this.browsingFolder = null;
            this.browsingReady = false;
            setTimeout(()=>{
                this.browsing = false;
                this.browsingFolder = null;
            }, 300);
        },
        async initialize() {
            if (!this.$store.telegram.provider) {
                return;
            }

            const initialBrowsingFolderId = this.$q.localStorage.getItem('tg_browsing_folder');

            this.drive = new Drive();
            this.drive.setProvider(this.$store.telegram.provider);

            this.drive.registerServiceWorker();

            this.__driveFolderListener = (e) => {
                this.folders.push(e.detail.folder);

                if (initialBrowsingFolderId && e.detail.folder.id == initialBrowsingFolderId) {
                    setTimeout(()=>{
                        this.onBrowsing(e.detail.folder);
                    }, 100);
                }
            }
            this.drive.addEventListener('folder', this.__driveFolderListener);

            this.drive.fetchMoreFolders()
                .then(async()=>{
                    await this.drive.restoreFilePreviewsFromCache();
                    // await this.folder.restoreFilePreviewsFromCache();
                    this.loadPreviewInterval();
                });

            this.initialized = true;

            // setTimeout(()=>{
            //     this.showUploadDialog();
            // }, 200);
        },
        loadPreviewInterval() {
            const fn = async()=>{
                try {
                    if (!this.browsing) {
                        // load preview for files
                        const folder = this.folders.find((folder)=>(!folder.hasHighPreview() && folder.isWritable()));
                        if (folder) {
                            await folder.getHighPreview();
                        }
                    }
                } catch(e) {
                    console.error(e);
                }

                clearTimeout(this._loadPreviewInterval);
                this._loadPreviewInterval = setTimeout(fn, 500);
            };

            fn();


            // this._loadPreviewInterval = setInterval(()=>{
            //     if (!this.browsing) {
            //         // load preview for files
            //         const folder = this.folders.find((folder)=>(!folder.hasHighPreview() && folder.isWritable()));
            //         if (folder) {
            //             folder.getHighPreview();
            //         }
            //     }
            // }, 500);
        },
    },
    mounted() {
        if (this.$store.telegram.provider) {
            this.initialize();
        }
    },
    unmounted() {
        this.drive.removeEventListener('folder', this.__driveFolderListener);
    },
    computed: {
        authenticated() {
            return (!!this.$store.telegram.username);
        },
        filteredFolders() {
            return this.folders.filter((folder)=>{ return (folder.isWritable()); });
        }
    },
}
</script>

