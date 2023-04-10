<template>

    <q-card class="drive-folder-file" :class="{ isToBeUploaded: isToBeUploaded }" @click="onClick">
         <div class="drive-folder-file-back" v-if="shouldHaveBack">
            <img :src="previewImage" v-if="previewImage" />
        </div>
        <div class="drive-folder-file-back drive-folder-file-back-blurred" v-if="shouldHaveBack">
            <img :src="previewImage" v-if="previewImage" />
        </div>
        <q-img :src="previewImage" :placeholder-src="placeholderPreviewImage" no-spinner no-transition :fit="shouldHaveBack ? 'contain' : 'cover'">
 <!--            <div class="absolute-bottom text-subtitle2 text-center">
                {{name}}
            </div> -->
            <div class="absolute-center">
                <q-circular-progress
                    :value="(progress !== null && progress < 100) ? (progress * 100) : null"
                    rounded
                    size="50px"
                    color="primary"
                    class="q-ma-md"
                    />
            </div>
        </q-img>
    </q-card>

</template>
<style type="text/css" scoped>
    .q-img__content > .absolute-center {
        background-color: transparent !important;
    }

    .q-img__content img {
        opacity: 1;
        transition: opacity ease-in 500ms;
    }

    .isToBeUploaded img {
        opacity: 0.2;
    }

    .drive-folder-file-back {
        position: absolute;
        left: 2px; right: 2px; top: 2px; bottom: 2px;
        border-radius: 4px !important;
        overflow: hidden;
    }


    .drive-folder-file-back img {
        object-position: 50% 50%;
        object-fit: cover;
        width: 100%;
        height: 200px;
        border-radius: 4px !important;
        opacity: 0.3;
    }

    .drive-folder-file-back-blurred img {
        filter: blur(10px);
    }

    @media screen and (max-width: 900px) {
        .drive-folder-file-back img {
            height: 100px;
        }
    }

</style>
<script>
//
export default {
    name: 'DriveFolderFile',
    props: {
        file: Object,
    },
    emits: ['click'],
    data() {
        return {
            initialized: false,
            name: '',
            browsing: false,
            previewImage: null,
            placeholderPreviewImage: null,

            progress: null,
            isToBeUploaded: true,

            shouldHaveBack: false,
        }
    },
    watch: {
    },
    methods: {
        async onClick() {
            console.error('this.file.ratio', this.file.ratio);
            this.$emit('click', this.file);

            // const type = await this.file.getType();
            // this.name = type;

            // await this.file.download();

            // this.file.getPreview();
            // this.previewImage = await this.file.getHighPreview();
            // console.log(this.previewImage);
            // console.log(this.file);

            // const fileSize = await this.file.size();
            // const chunk = await this.file.getSlice(0, fileSize);
            // console.log(chunk);
            // this.file.download();
            // console.log(this.file._downloadedChunks);
        },
    },
    created() {
        if (this.file.hasHighPreview()) {
            this.previewImage = this.file.hasHighPreview();
            this.placeholderPreviewImage = ''+this.previewImage;
        } else {
            this.previewImage = this.file.getLowPreview();
            this.placeholderPreviewImage = ''+this.previewImage;
        }

        if (this.file.ratio < 0.51 || this.file.ratio > 3) {
            this.shouldHaveBack = true;
        }
    },
    mounted() {
        // this.name = '' + this.file.width + 'x' + this.file.height + ' ( '+this.file.ratio;
        this.__filePreviewListener = (e)=>{
            this.previewImage = e.detail.preview;
        };
        this.__fileProgressListener = (e)=>{
            this.progress = e.detail.progress;
            if (this.progress == 100) {
                this.isToBeUploaded = false;
            }
        };
        this.file.addEventListener('preview', this.__filePreviewListener);
        this.file.addEventListener('progress', this.__fileProgressListener);

        this.isToBeUploaded = this.file.isToBeUploaded;
    },
    unmounted() {
        this.file.removeEventListener('preview', this.__filePreviewListener);
        this.file.removeEventListener('progress', this.__fileProgressListener);
    },
    computed: {
    },
}
</script>

