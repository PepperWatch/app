<template>

    <q-card class="drive-folder" @click="onClick">
        <div class="drive-folder-inner">
            <q-img :src="previewImage" :placeholder-src="placeholderPreviewImage">
                <div class="absolute-bottom text-subtitle2 text-center folderTitle">
                    {{name}}
                </div>
            </q-img>
        </div>
    </q-card>

    <div v-if="browsing" class="col-12">
        <q-list>
            <q-infinite-scroll @load="loadMore" :offset="250" >
                <DriveFolderRow v-for="(item, index) in rows" :row="item" :key="index" ref="rows" @back="onBack" />
                <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                        <q-spinner-dots color="primary" size="40px" />
                    </div>
                </template>
            </q-infinite-scroll>
        </q-list>

    </div>

</template>

<script>
// import DriveFolderFile from './DriveFolderFile.vue';
import DriveFolderRow from './DriveFolderRow.vue';
import RowBuilder from './RowBuilder.js';
//
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
    name: 'DriveFolder',
    props: {
        folder: Object,
        hidden: Boolean,
    },
    components: {
        // DriveFolderFile,
        DriveFolderRow,
    },
    emits: ['browsing'],
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
        }
    },
    watch: {
    },
    methods: {
        async loadMore(index, done) {
            console.error('loading more...')

            if (this.browsing) {
                const loaded = await this.folder.fetchMoreFiles();
                if (loaded) {
                    await this.folder.restoreFilePreviewsFromCache();
                }
            }

            done();
        },
        onClick() {
            // this.browsing = true;
            this.$emit('browsing', this.folder);

            // console.log('browsing', this.folder);

            // this.__folderFileListener = (e) => {
            //     if (!e.detail.file.ratio) {
            //         return;
            //     }
            //     this.rowBuilder.push(e.detail.file);
            //     this.files.push(e.detail.file);
            // };
            // this.__folderEndListener = () => {
            //     this.rowBuilder.end();
            // };

            // this.folder.addEventListener('file', this.__folderFileListener);
            // this.folder.addEventListener('end', this.__folderEndListener);

            // this.folder.fetchMoreFiles()
            //     .then(async()=>{
            //         await this.folder.restoreFilePreviewsFromCache();
            //         this.loadPreviewInterval();
            //     });
        },
        onBack() {
            this.browsing = false;
            this.$emit('browsing', null);

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

