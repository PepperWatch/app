<template>

    <div class="upload_dialog_blurer">


        <div class="upload_dialog_blurer_slider" v-if="edit == 'blur'">
            <q-slider
            v-model="blur"
            :min="0"
            :max="20"
            :step="0.01"
            vertical
            reverse
            switch-label-side
            style="height: 270px;"
            @change="onBlurChanged"
            />
        </div>
        <div class="upload_dialog_blurer_range" v-if="edit == 'range'">
            <q-range
            v-model="range"
            :min="0"
            :step="0.01"
            :max="maxLength"
            label
            drag-range
            muted
            @change="onRangeChanged"
            />
        </div>
        <div class="upload_dialog_blurer_preview">
            <div class="upload_dialog_blurer_preview_image" v-if="preparedType == 'photo'" :style="{'background-image': 'url(' + previewURL + ')', 'filter': 'blur('+blur+'px)'}" />
            <div class="upload_dialog_blurer_preview_video" v-if="preparedType == 'video'"  :style="{'filter': 'blur('+blur+'px)'}">
                <video :src="previewURL" @loadedmetadata="onVideoLoadedMetadata" ref="originalVideoPlayer" @click="onVideoClick" />
            </div>
        </div>

    </div>

</template>
<style type="text/css">
    .upload_dialog_blurer {
        width: 100%;
        min-height: 100px;
        position: relative;
        margin: 0;
        padding: 0;
        height: 300px;
        overflow: hidden;
    }

    .upload_dialog_blurer img {
        filter: blur(4px);
    }

    .upload_dialog_blurer_range {
        position: absolute;
        z-index: 2;
        left: 16px;
        bottom: 0px;
        right: 16px;
    }

    .upload_dialog_blurer_slider {
        position: absolute;
        z-index: 2;
        right: 8px;
        top: 16px;
    }

    .upload_dialog_blurer_preview {
        height: 300px;
        overflow: hidden;
        text-align: center;
    }

    .upload_dialog_blurer_preview_image, .upload_dialog_blurer_preview_video {
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
        height: 100%;
    }

    .upload_dialog_blurer_preview_video video {
        height: 100%;
        cursor: pointer;
    }
</style>
<script>

export default {
    name: 'PrepareFileDialogPreview',
    props: {
        file: Object,
        edit: {
            type: String,
            default: null,
        }
    },
    emits: ['blur', 'range'],
    components: {
    },
    data() {
        return {
            isInitialized: false,

            preparedType: null,
            previewURL: null,

            blur: 0,

            maxLength: 0,
            range: {
                min: 0,
                max: 0,
            },
        }
    },
    watch: {
    },
    methods: {
        setBlur(value) {
            this.blur = value;
        },
        onVideoLoadedMetadata() {
            this.maxLength = this.$refs.originalVideoPlayer.duration;
            this.range.max = 1;

            this.setVideoLoopInterval();
            this.onRangeChanged();
            // alert(this.$refs.originalVideoPlayer.duration);
        },
        onVideoClick() {
            this.onRangeChanged();
        },
        onBlurChanged() {
            this.$emit('blur', this.blur);
        },
        onRangeChanged() {
            const player = this.$refs.originalVideoPlayer;
            if (player) {
                player.currentTime = this.range.min;
                player.pause();

                clearTimeout(this.__videoPlayTimeout);
                this.__videoPlayTimeout = setTimeout(()=>{
                    player.play();
                }, 50);
            }

            this.$emit('range', this.range);
        },
        setVideoLoopInterval() {
            const maxRangeLength = 2;

            clearInterval(this.__videoLoopInterval);
            this.__videoLoopInterval = setInterval(()=>{
                const player = this.$refs.originalVideoPlayer;
                if (player && (player.currentTime > this.range.max || player.currentTime > (this.range.min + maxRangeLength) || player.currentTime < this.range.min)) {
                    if (player.currentTime > this.range.max || player.currentTime > (this.range.min + maxRangeLength) ) {
                        player.pause();

                        if (this.range.max - this.range.min > 2) {
                            this.range.max = this.range.min + 2;
                        }
                    }
                    player.currentTime = this.range.min;
                }
            }, 20);
        },
        async initialize() {
            this.preparedSize = this.file.size;
            this.previewURL = window.URL.createObjectURL(this.file);

            const re = /(?:\.([^.]+))?$/;
            const extension = (''+re.exec(this.file.name)[1]).toLowerCase();

            const photoExts = ['png', 'jpg', 'jpeg'];
            const videoExts = ['mp4', 'mpeg', 'avi', 'mov', 'webm'];

            if (photoExts.indexOf(extension) !== -1) {
                this.preparedType =  'photo';
            } else if (videoExts.indexOf(extension) !== -1) {
                this.preparedType =  'video';
            }
            // this.preparedType = await this.telegramFile.getType();
            // this.previewURL = await this.telegramFile.toBeUploadedOriginalURL();

            this.isInitialized = true;
        },
    },
    mounted() {
        this.initialize();
    },
    computed: {
    },
}
</script>

