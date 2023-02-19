<template>

    <div :style="{backgroundColor: color, marginLeft: (indent ? 10 : 0)+'px'}">
        <q-item clickable ripple @click="onClick">
            <q-item-section class="text-black q-pl-md" >
                <div>{{atom.name}}</div>
                <div class="childBlocks" v-if="atoms.length">
                    <template v-for="atom in atoms" v-bind:key="atom.id">
                        <div class="childBlock" :atom="atom" :style="{backgroundColor: getColorByType(atom.name)}"></div>
                    </template>
                </div>
            </q-item-section>
            <q-item-section class="text-black q-mr-md q-pt-md q-pb-md" side>
                <div class="text-black q-gutter-xs">
                {{humanSize}}
                </div>
            </q-item-section>
        </q-item>
        <q-item :style="{backgroundColor: color}" v-if="clicked" >
            <q-item-section avatar class="q-pl-md">
                &nbsp;
            </q-item-section>
            <q-item-section class="text-black" >
                <div>{{description}}</div>

                <component v-bind:is="atomDetailsComponent" v-if="atomDetailsComponent" :file="file" :atom="atom" :fileAtoms="fileAtoms" ></component>
            </q-item-section>
            <q-item-section top class="text-black q-mr-md q-pt-md q-pb-md" side>
                <div class="text-black q-gutter-xs">
                <q-btn size="10px" flat dense round icon="download" color="primary" @click.prevent="download" />
                </div>
            </q-item-section>
        </q-item>

        <AnalyseFileDialogAtom v-for="atom in visibleAtoms"
            v-bind:key="atom.start" :atom="atom" :indent="indent + 1" :file="file" :fileAtoms="fileAtoms" ref="childsRefs"
            />

        <div v-if="visibleAtoms.length" style="padding-bottom: 10px;"></div>
    </div>

</template>
<style type="text/css">
    .childBlocks {
        height: 12px;
        overflow: hidden;
    }

    .childBlock {
        width: 12px;
        height: 12px;
        margin-right: 8px;
        filter: brightness(80%);
        float: left;
    }
</style>
<script>
import AnalyseFileDialogAtom from './AnalyseFileDialogAtom.vue';
import { atomTypes } from './atomTypes.js';

import MDAT from './atoms/MDAT.vue';
import MVHD from './atoms/MVHD.vue';
import TKHD from './atoms/TKHD.vue';

export default {
    name: 'AnalyseFileDialogAtom',
    props: {
        atom: Object,
        file: Object,
        fileAtoms: Array,
        indent: {
            type: Number,
            default: 0,
        }
    },
    emits: [],
    components: {
        AnalyseFileDialogAtom,
        MDAT,
        MVHD,
        TKHD,
    },
    data() {
        return {
            clicked: false,
            atoms: [],
            visibleAtoms: [],
            color: null,
            humanSize: '',
            description: '',

            atomDetailsComponent: null,
        }
    },
    computed: {
    },
    watch: {
    },
    methods: {
        async Analyse() {
            if (this.atom.name == 'trak') {
                console.error(this.atom.isVideo() ? 'video' : 'audio');
                const samplesPerChunk = await this.atom.getSampleToChunk();
                console.error('samplesPerChunk', samplesPerChunk);

                const sampleSizes = await this.atom.getSampleSize();
                console.error('sampleSizes', sampleSizes);

                const chunkOffsets = await this.atom.getChunkOffsets();
                console.error('chunkOffsets', chunkOffsets);

                const chunksInfo = await this.atom.getChunksInfo();
                console.error('chunksInfo', chunksInfo);
            }
        },
        async download() {
            const chunk = await this.file.getSlice(this.atom.start, this.atom.size);

            const blob = new Blob([chunk], {type: 'binary/octet-stream' });

            let blobUrl = window.URL.createObjectURL(blob);
            let link = document.createElement("a");
            link.href = blobUrl;

            link.download = this.atom.name+'.bin';

            document.body.appendChild(link);
            link.innerHTML = "download";
            link.style.display = 'none';
            link.click();

            link.remove();

            window.URL.revokeObjectURL(blobUrl);
        },
        getColorByType(atomType) {
            try {
                const n = Object.keys(atomTypes).indexOf(atomType);
                return this.getColorByN(n);
            } catch(e) {
                return '#ffffff';
            }
        },
        getN() {
            this.color = this.getColorByType(this.atom.name);
            const sizeI = Math.floor( Math.log(this.atom.size) / Math.log(1024) );
            this.humanSize = ( this.atom.size / Math.pow(1024, sizeI) ).toFixed(0) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
            this.atoms = this.atom.childs;
            this.description = atomTypes[this.atom.name].desc;


            // if there component for this type:
            const registerdComponenetsNames = Object.keys( this.$options.components );
            if (registerdComponenetsNames.indexOf(this.atom.name.toUpperCase()) !== -1) {
                this.atomDetailsComponent = this.atom.name.toUpperCase();
            }
        },
        getColorByN(n) {
            const rgb = [0, 0, 0];

            for (let i = 0; i < 24; i++) {
                rgb[i%3] <<= 1;
                rgb[i%3] |= n & 0x01;
                n >>= 1;
            }

            if (rgb[0] < 80) {
            rgb[0] = 80;
            }
            if (rgb[1] < 80) {
            rgb[1] = 80;
            }
            if (rgb[2] < 80) {
            rgb[2] = 80;
            }

            if (rgb[0] < 180) {
            rgb[0] = Math.ceil(rgb[0]*1.5);
            }
            if (rgb[1] < 180) {
            rgb[1] = Math.ceil(rgb[1]*1.5);
            }
            if (rgb[2] < 180) {
            rgb[2] = Math.ceil(rgb[2]*1.5);
            }

            return '#' + rgb.reduce((a, c) => (c > 0x0f ? c.toString(16) : '0' + c.toString(16)) + a, '')
        },
        openAll() {
            this.clicked = true;
            if (this.atom.childs && !this.visibleAtoms.length) {
                this.visibleAtoms = this.atom.childs;
            }

            setTimeout(()=>{
                if (this.$refs.childsRefs) {
                    this.$refs.childsRefs.forEach((ref)=>{
                        ref.openAll();
                    });
                }

                this.Analyse();
            }, 50);
        },
        onClick() {

            if (!this.clicked) {
                this.clicked = true;
                if (this.atom.childs && !this.visibleAtoms.length) {
                    this.visibleAtoms = this.atom.childs;
                }
            } else {
                this.clicked = false;
                this.visibleAtoms = [];
            }
        }
    },
    mounted() {
        this.getN();
    },
    unmounted() {
    },
}
</script>

