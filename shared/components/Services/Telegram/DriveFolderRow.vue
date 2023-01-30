<template>

    <q-item class="rowRow" v-if="row.isFull || row.isEnded || true">
        <template v-for="(item, index) in row.items" :key="item.id">
            <div class="rowItem" :style="{ width: row.widths[index] + '%' }" v-if="!item.isBackButton">
                <DriveFolderFile :file="item" @click="onFileClick" />
            </div>
            <div class="rowItem" :style="{ width: row.widths[index] + '%' }" v-if="item.isBackButton">
                <q-card class="drive-folder-file text-center relative-position backItem" @click="onBack">
                    <div class="q-img">
                        <q-icon name="arrow_back" color="primary" size="4.4em" class="absolute-center   " />
                    </div>
                </q-card>
            </div>
        </template>
    </q-item>

</template>
<style type="text/css">
    .rowRow {
        margin-bottom: 4px;
    }

    .backItem {
        cursor: pointer;
    }
    .backItem:hover {
        opacity: 0.9;
    }
    .rowItem {
        float: left;
        height: 200px;
    }
    .drive-folder-file {
        width: 100%;
        max-width: 100% !important;
    }
    .rowItem img {
        height: 200px;
    }
    .rowItem .q-img {
        height: 200px;
    }
    .rowItem .q-card {
        padding: 4px;
    }

    @media screen and (max-width: 900px) {
        .rowItem {
            height: 100px;
        }
        .rowItem img {
            height: 100px;
        }
        .rowItem .q-img {
            height: 100px;
        }
    }
</style>
<script>
import DriveFolderFile from './DriveFolderFile.vue';

export default {
    name: 'DriveFolderRow',
    props: {
        row: Object,
    },
    emits: ['click', 'back'],
    components: {
        DriveFolderFile,
    },
    data() {
        return {
        }
    },
    watch: {
    },
    methods: {
        onFileClick(file) {
            this.$emit('click', file);
        },
        onBack() {
            this.$emit('back');
        },
    },
    mounted() {
    },
    computed: {
    },
}
</script>

