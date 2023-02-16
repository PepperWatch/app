<template>

    <div>
        <q-toolbar class="bg-primary text-white non-selectable">
<!--         <q-btn flat round dense icon="assignment_ind">
        <q-badge floating color="red">2</q-badge>
        </q-btn> -->
            <q-toolbar-title>
            <q-breadcrumbs active-color="white" style="font-size: 16px">
                <q-breadcrumbs-el label="Your Telegram Files" @click="onBack" style="cursor: pointer;" class="gt-sm" />
                <q-breadcrumbs-el :label="browsingFolder.name" v-if="browsingFolder && browsingReady" icon="folder_open" />
                <template v-slot:separator>
                <q-icon
                    size="0.8em"
                    name="arrow_forward"
                    color="white"
                    />
                </template>
            </q-breadcrumbs>
            </q-toolbar-title>


            <q-btn color="white" text-color="primary" unelevated class="q-mr-xs"
                icon="upload"
                @click="onUploadClick"
                :disable="uploadDisabled"
                >
                Upload
            </q-btn>
            <input type="file" @change="fileToUploadSelected" class="fileInput" ref="fileInput">
            <AllBodyDropFileZone @file="fileToUploadSelected" />

            <Telegram />

<!--         <q-btn flat round dense icon="sim_card" class="q-mr-xs" />
        <q-btn flat round dense icon="gamepad" /> -->
        </q-toolbar>

        <div style="position: relative; height: calc(100vh - 150px); overflow-x: hidden; scroll-behavior: smooth;" ref="scrollDiv" id="drive-scroll">
            <div class="foldersTab" ref="foldersTab">
                <q-list>
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
                <DriveFolderBrowser ref="driveFolderBrowser" v-if="browsing" :folder="browsingFolder" @back="onBack" @ready="onBrowsingReady" />
            </div>
        </div>
        <MP4StegAsync />
    </div>

</template>
<style>

    .fileInput {
        display: none;
    }

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
        background-color: #ffffff;
        transform: translateX(100%);
        transition: transform 0.3s ease-in-out;
    }

    .body--dark .browsingTab {
        background-color: var(--q-dark);
    }

    .browsingTab.active {
        transform: translateX(0%);
    }

    .foldersTab .q-card {
        box-shadow: none;
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
        transition: opacity 0.5s ease-in-out;
        text-overflow: ellipsis;
    }

    .drive-folder .folderTitle {
        text-overflow: ellipsis;
        height: 45px;
        overflow:hidden;
        white-space:nowrap;
        width: 100%;
    }

    .drive-folder:hover {
        opacity: 0.5;
    }

    .drive-folder-inner {
        padding: 4px;
    }

    .drive-folder-file {
        width: 100%;
        max-width: 250px;
        transition: opacity 0.5s ease-in-out;
    }

    .drive-folder-file:hover {
        opacity: 0.5;
    }

</style>
<script>
import Drive from 'shared/classes/drive/telegram/Drive.js';
import DriveFolder from './DriveFolder.vue';
import DriveFolderBrowser from './DriveFolderBrowser.vue';
import MP4StegAsync from 'shared/components/AsyncComponents/MP4StegAsync.js';

import Telegram from 'shared/components/Auth/Telegram';
import AllBodyDropFileZone from 'shared/components/Helpers/AllBodyDropFileZone';

//
export default {
    name: 'Drive',
    props: {
    },
    components: {
        DriveFolder,
        DriveFolderBrowser,
        MP4StegAsync,
        Telegram,
        AllBodyDropFileZone,
    },
    data() {
        return {
            initialized: false,
            browsing: false,
            browsingFolder: null,
            browsingReady: false,
            folders: [],

            uploadDisabled: true,
        }
    },
    watch: {
        authenticated() {
            if (this.authenticated && !this.initialized) {
                this.initialize();
                // this.load();
            } else if (!this.authenticated) {
                this.folders = [];
                this.drive = null;
                this.browsing = false;
                this.browsingReady = false;
                this.browsingFolder = null;
                this.initialized = false;

                this.uploadDisabled = true;
            }
        }
    },
    methods: {
        onUploadClick() {
            this.$refs.fileInput.click();
        },
        async fileToUploadSelected(ev) {
            let files = [];
            if (ev.target && ev.target.files) {
                files = ev.target.files;
            } else {
                files.push(ev);
            }

            if (!files[0]) {
                return;
            }
            if (this.$refs.driveFolderBrowser && this.browsingFolder) {
                // upload to currently selected folder
                this.$refs.driveFolderBrowser.uploadUserFile(files[0]);
            } else {
                // select 'Saved' first and upload to it
                if (this.$store.telegram && this.$store.telegram.provider && this.$store.telegram.provider.me) {
                    let meId = this.$store.telegram.provider.me.id;
                    if (meId.value) {
                        meId = meId.value;
                    }
                    const savedFolderId = ''+meId;
                    if (this.drive.getFolderById(savedFolderId)) {
                        await this.onBrowsing(this.drive.getFolderById(savedFolderId));
                        if (this.$refs.driveFolderBrowser && this.browsingFolder && this.browsingReady) {
                            this.$refs.driveFolderBrowser.uploadUserFile(files[0]);
                        }
                    }
                }
            }
        },
        async loadMore(index, done) {
            if (!this.browsing && this.drive) {
                const loaded = await this.drive.fetchMoreFolders();
                if (loaded) {
                    await this.drive.restoreFilePreviewsFromCache();
                }
            }

            done();
        },
        async onBrowsing(folder) {
            if (folder) {
                if (!this.browsingFolder || this.browsingFolder.id != folder.id) {
                    this.browsing = true;
                    this.browsingFolder = folder;

                    this.$q.localStorage.set('tg_browsing_folder', folder.id);

                    if (this.__broswingReadyPromiseResolver) {
                        this.__broswingReadyPromiseResolver();
                    }

                    this.__broswingReadyPromiseResolver = null;
                    this.__browsingReadyPromise = new Promise((res)=>{
                        this.__broswingReadyPromiseResolver = res;
                    });

                    await this.__browsingReadyPromise; // wait for onBrowsingReady
                    this.__broswingReadyPromiseResolver = null;
                    this.__browsingReadyPromise = null;
                }
            } else {
                this.browsing = false;
                this.browsingFolder = null;

                this.$q.localStorage.set('tg_browsing_folder', null);
            }
        },
        onBrowsingReady() {
            this.browsingReady = true;
            this.$refs.scrollDiv.scrollTop = 0;

            const br = this.$refs.foldersTab.getBoundingClientRect();
            const foldersTabHeight = br.height;

            if (foldersTabHeight) {
                this.$refs.browsingTab.style.minHeight = ''+Math.ceil(foldersTabHeight)+'px';
            }

            if (this.__broswingReadyPromiseResolver) {
                this.__broswingReadyPromiseResolver();
            }

            this.uploadDisabled = false;
        },
        onBack() {
            // this.browsing = false;
            // this.browsingFolder = null;
            this.browsingReady = false;
            setTimeout(()=>{
                this.browsing = false;
                this.browsingFolder = null;
                this.$q.localStorage.set('tg_browsing_folder', null);
            }, 300);
        },
        async initialize() {
            if (!this.$store.telegram.provider) {
                return;
            }

            const initialBrowsingFolderId = this.$q.localStorage.getItem('tg_browsing_folder');

            let savedFolderId = null;
            if (this.$store.telegram && this.$store.telegram.provider && this.$store.telegram.provider.me) {
                let meId = this.$store.telegram.provider.me.id;
                if (meId.value) {
                    meId = meId.value;
                }
                savedFolderId = ''+meId;
            }

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

                if (e.detail.folder.id == savedFolderId) {
                    this.uploadDisabled = false;
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

