<template>

    <div class="col-12 driveFolderBrowser">
        <q-list>
            <q-infinite-scroll @load="loadMore" :offset="600" scroll-target="#drive-scroll">
                <DriveFolderRow v-for="(item, index) in rows" :row="item" :key="index" ref="rows" @back="onBack" @click="onFileClick" />
                <div style="clear: both"></div>
                <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                        <q-spinner-dots color="primary" size="40px" />
                    </div>
                </template>
            </q-infinite-scroll>
        </q-list>

        <MediaBrowser :telegramFile="telegramFileToShow" @hide="onMediaBrowserHide" />

    </div>

</template>
<style type="text/css" scoped>
    .driveFolderBrowser {
        padding: 0px;
    }

</style>
<script>
// import DriveFolderFile from './DriveFolderFile.vue';
import DriveFolderRow from './DriveFolderRow.vue';
import MediaBrowser from './MediaBrowser.vue';
import RowBuilder from './RowBuilder.js';
//
import PrepareFileDialog from 'shared/components/Services/PrepareFile/PrepareFileDialog.vue';
import TelegramFile from 'shared/classes/drive/telegram/TelegramFile.js';

class BackItem extends EventTarget {
    constructor() {
        super();
        this.isBackButton = true;
    }
    get ratio() {
        return 1;
    }
}
        // <div class="q-pa-md row items-start q-gutter-md">
        //     <DriveFolderFile v-for="file in filteredFiles" v-bind:key="file.id" :file="file" />
        // </div>
export default {
    name: 'DriveFolderBrowser',
    props: {
        folder: Object,
        hidden: Boolean,
    },
    components: {
        // DriveFolderFile,
        DriveFolderRow,
        MediaBrowser,
    },
    emits: ['browsing', 'ready', 'back'],
    data() {
        return {
            initialized: false,
            name: '',
            browsing: false,
            files: [],
            rows: [],
            rowBuilder: null,

            previewImage: null,
            placeholderPreviewImage: null,

            isDragging: false,
            dragCounter: 0,

            telegramFileToShow: null,
        }
    },
    watch: {
    },
    methods: {
        onMediaBrowserHide() {
            this.telegramFileToShow = null;
        },
        async showUploadDialog(telegramFile) {
            this.$q.dialog({
                component: PrepareFileDialog,
                componentProps: {
                    file: telegramFile.originalFile(),
                }
            }).onOk((results) => {

                if (results.file) {
                    telegramFile.upload(results);

                    this.rowBuilder.unshift(telegramFile);
                    this.files.unshift(telegramFile);
                    this.folder.addTelegramFile(telegramFile);
                }

                // this.rowBuilder.unshift(telegramFile);
                // this.files.unshift(telegramFile);

            }).onCancel(() => {
                // console.log('Cancel')
            }).onDismiss(() => {
                // console.log('Called on OK or Cancel')
            });
        },
        async onFileClick(file) {
            this.telegramFileToShow = file;

            // const content = file.contentFiles[0];
            // await content.download();



            // const copy = await file.fromURL('https://gist.githubusercontent.com/danomanion/3f9776916a1ccc47c10aa363cc0aecd1/raw/25fc623dbf7e6aecae37546cceaa5419383f04f6/Tiny-PWA.png');
            // const copy = await file.fromURL('//gist.githubusercontent.com/danomanion/3f9776916a1ccc47c10aa363cc0aecd1/raw/25fc623dbf7e6aecae37546cceaa5419383f04f6/Tiny-PWA.png');

            // await copy.prepareLocal();
            // const copy = file.copy();

            // this.showUploadDialog(copy);

            // this.rowBuilder.unshift(copy);
            // console.error('copy', copy);
            // this.files.unshift(copy);

            // copy.upload();

        },
        uploadUserFile: async function(localFile) {
            const telegramFile = new TelegramFile({
                file: localFile,
                provider: this.folder.provider,
                drive: this.folder._drive,
                folder: this.folder,
                id: (''+Math.random()),

            });

            await telegramFile.prepareLocal();

            this.showUploadDialog(telegramFile);
            // this.rowBuilder.unshift(file);
            // this.files.unshift(file);

            // await file.upload();
        },
        // drop: function(ev) {
        //     // Prevent default behavior (Prevent file from being opened)
        //     ev.preventDefault();

        //     this.isDragging = false;

        //     if (ev.dataTransfer.items) {
        //         // Use DataTransferItemList interface to access the file(s)
        //         for (let i = 0; i < ev.dataTransfer.items.length; i++) {
        //             // If dropped items aren't files, reject them
        //             if (ev.dataTransfer.items[i].kind === 'file') {
        //                 const file = ev.dataTransfer.items[i].getAsFile();
        //                 this.uploadUserFile(file);
        //             }
        //         }
        //     } else {
        //         // Use DataTransfer interface to access the file(s)
        //         for (let i = 0; i < ev.dataTransfer.files.length; i++) {
        //             // console.log('... 2 file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
        //             this.uploadUserFile(ev.dataTransfer.files[i]);
        //         }
        //     }
        //     // this.$emit('files', this.fileListFileSet);
        // },
        // dragenter: function(ev) {
        //     if (!ev.dataTransfer) {
        //         return;
        //     }
        //     this.isDragging = true;
        //     ev.stopPropagation();
        //     ev.preventDefault();
        //     this.dragCounter++;
        //     ev.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        // },
        // dragover: function(ev) {
        //     if (!ev.dataTransfer) {
        //         return;
        //     }
        //     this.isDragging = true;
        //     ev.stopPropagation();
        //     ev.preventDefault();
        //     ev.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        // },
        // dragleave: function(ev) {
        //     if (!ev.dataTransfer) {
        //         return;
        //     }
        //     this.dragCounter--;
        //     if (this.dragCounter === 0) {
        //         this.isDragging = false;
        //     }
        // },
        async loadMore(index, done) {
            if (this.browsing) {

                const loaded = await this.folder.fetchMoreFiles();
                if (loaded) {
                    await this.folder.restoreFilePreviewsFromCache();
                }
            }

            done();
        },
        initialize() {
            this.browsing = true;
            this.$emit('browsing', this.folder);

            // let clicked = false;
            this.__folderFileListener = (e) => {
                if (!e.detail.file.ratio) {
                    return;
                }
                this.rowBuilder.push(e.detail.file);
                this.files.push(e.detail.file);

                // if (!clicked) {
                //     clicked = true;
                //     this.onFileClick(e.detail.file);
                // }
            };
            this.__folderEndListener = () => {
                this.rowBuilder.end();
            };

            this.folder.addEventListener('file', this.__folderFileListener);
            this.folder.addEventListener('end', this.__folderEndListener);

            this.folder.files.forEach((file)=>{
                this.__folderFileListener({detail: {file: file}});
            });

            if (this.folder.files.length < 40) {
                this.folder.fetchMoreFiles()
                    .then(async()=>{
                        await this.folder.restoreFilePreviewsFromCache();
                        this.loadPreviewInterval();

                        this.$emit('ready');
                    });
            } else {
                this.loadPreviewInterval();
                this.$emit('ready');
            }

        },
        onBack() {
            this.browsing = false;
            this.$emit('browsing', null);
            this.$emit('back');

            clearInterval(this._loadPreviewInterval);
            this.folder.removeEventListener('file', this.__folderFileListener);
            this.folder.removeEventListener('end', this.__folderEndListener);
        },
        loadPreviewInterval() {
            clearInterval(this._loadPreviewInterval);
            this._loadPreviewInterval = setInterval(()=>{
                if (this.browsing) {
                    // load preview for files
                    const file = this.files.find((file)=>(!file.hasHighPreview()));
                    if (file) {
                        file.getHighPreview();
                    }
                }
            }, 500);
        },
    },
    created() {
        if (this.folder.hasHighPreview()) {
            this.previewImage = this.folder.hasHighPreview();
            this.placeholderPreviewImage = ''+this.previewImage;
        } else {
            this.previewImage = this.folder.getLowPreview();
            this.placeholderPreviewImage = ''+this.previewImage;
        }
    },
    mounted() {
        this.name = this.folder.name;
        this.rowBuilder = new RowBuilder();
        this.rows = this.rowBuilder.rows;

        const backItem = new BackItem();
        this.rowBuilder.push(backItem);

        this.__folderPreviewListener = (e)=>{
            this.previewImage = e.detail.preview;
        };

        this.folder.addEventListener('preview', this.__folderPreviewListener);

        this.initialize();
    },
    unmounted() {
        this.folder.removeEventListener('preview', this.__folderPreviewListener);
    },
    computed: {
        filteredFiles() {
            return this.files;
        }
    },
}
</script>

