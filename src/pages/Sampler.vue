<template>

  <div>
    <h6>Create Sample</h6>

    <div v-if="!selectedFile">

        <Uploader ref="uploader" @filePrepared="file"/>

        <q-btn color="primary" label="Or Use The Sample Video" @click="useSample" />

    </div>

    <MediaDown :file="selectedFile"/>

  </div>

</template>

<script>
import Uploader from '../components/Uploader';
import MediaDown from '../components/MediaDown';

export default {
	name: 'Sampler',
    path: '/sampler',
    title: 'Sample Creation',
    authRequired: false,
	props: {
	},
    components: {
        Uploader,
        MediaDown,
    },
	data() {
		return {
			isActive: false,
            selectedFile: null,
		}
	},
    watch: {
    },
	methods: {
        useSample() {
            this.$refs.uploader.sample();
        },
        file(userFile) {
            this.selectedFile = userFile;
            console.error(userFile.file);
            // const md = new MediaDownsample({blob: userFile.file});
            // md.do();

            // console.error(md);
        }
	},
    mounted() {
        // setTimeout(()=>{
        //     this.$refs.uploader.sample();
        // }, 500);
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.my-card {
  width: 100%;
  max-width: 250px;
}
</style>

