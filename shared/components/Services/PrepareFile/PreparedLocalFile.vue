<template>

    <q-item>
        <q-item-section class="q-pl-md" style="overflow: hidden;">{{file.name}}</q-item-section>
        <q-item-section avatar class="q-pl-md q-pt-md q-pb-md gt-sm">
            <img :src="thumbURL" height="50" v-if="thumbURL" @error="onThumbError">
        </q-item-section>
        <q-item-section  avatar class="q-mr-md">
            <div class="text-grey-8 q-gutter-xs">
                <q-btn size="18px" flat dense round icon="analytics" color="primary" @click="analyse" />
                <q-btn size="18px" flat dense round icon="visibility" color="primary" @click="preview" />
                <q-btn size="18px" flat dense round icon="download"  color="primary" @click="download" />
            </div>
        </q-item-section>
    </q-item>

</template>
<style type="text/css">
</style>
<script>

export default {
    name: 'PreparedLocalFile',
    props: {
        file: Object,
        thumb: Object,
    },
    emits: ['preview', 'analyse'],
    components: {
    },
    data() {
        return {
            thumbURL: null,
        }
    },
    watch: {
    },
    methods: {
        async analyse() {
            this.$emit('analyse', this.file);
        },
        preview() {
            this.$emit('preview', this.file);
        },
        download() {
            let blobUrl = window.URL.createObjectURL(this.file);
            let link = document.createElement("a");
            link.href = blobUrl;

            link.download = this.file.name;

            document.body.appendChild(link);
            link.innerHTML = "download";
            link.style.display = 'none';
            link.click();

            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        },
        onThumbError() {
            try {
                window.URL.revokeObjectURL(this.thumbURL);
            } catch (e) {
                console.error(e);
            }
            this.thumbURL = null;
        },
    },
    mounted() {
        if (this.thumb) {
            this.thumbURL = window.URL.createObjectURL(this.thumb);
        }
    },
    unmounted() {
        if (this.thumbURL) {
            window.URL.revokeObjectURL(this.thumbURL);
        }
    },
    computed: {
    },
}
</script>

