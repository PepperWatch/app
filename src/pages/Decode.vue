<template>

  <div>
    <h6 class="text-h6 q-mb-md text-primary">Decode Container</h6>

    <ContainerUploader @container="containerUploaded" />

    <div class="q-pa-md"> <!-- v-if="this.container"  -->
      <div class="q-gutter-md" style="max-width: 300px">
        <q-input v-model="decodeKey" label="Decode Key" @change="decodeKeyChanged"/>
      </div>
    </div>

    <div>
      <q-splitter
        v-model="splitterModel"
        style="height: 400px"
      >

        <template v-slot:before>
          <div class="q-pa-md">
            <div class="text-h6 q-mb-md text-primary">Container</div>

            <div v-if="containerBlob">
              <VideoPlayer :blob="containerBlob" />
            </div>

          </div>
        </template>

        <template v-slot:after>
          <div class="q-pa-md">
            <div v-if="decoding">Trying to decode...</div>
            <div v-if="decodeSuccess === null">Waiting for container and decode key...</div>
            <div v-if="decodeSuccess === false">Empty container or invalid decode key</div>
            <!-- <div class="text-h6 q-mb-md text-primary">Decoded</div> -->

            <div v-if="decodeSuccess === true">
              <div class="text-h6 q-mb-md text-primary">Decoded</div>

              <div v-if="decodedBlob">
                <VideoPlayer :blob="decodedBlob" />
              </div>
            </div>
          </div>
        </template>

      </q-splitter>
    </div>
  </div>

</template>

<script>
  // ksB29VHY
import ContainerUploader from '../components/ContainerUploader';
import VideoPlayer from '../components/VideoPlayer';
// import Ajax from '../classes/ajax';

export default {
	name: 'Decode',
  title: 'Decode Container',
  authRequired: false,
  path: '/decode',

  components: {
      ContainerUploader,
      VideoPlayer,
      // VideoPlayer,
  },
	props: {
	},
	data() {
		return {
			isActive: false,
      splitterModel: 50,
      containerBlob: null,
      container: null,

      decoding: false,
      decodeKey: '',
      decodedBlob: null,
      decodeSuccess: null,
		}
	},
	methods: {
    async decodeKeyChanged() {
      this.decoding = true;
      this.decodedBlob = null;
      this.decodeSuccess = null;

      try {
        const success = await this.container.decode(this.decodeKey);
        console.error('decode', success);

        this.decodeSuccess = success;
        if (this.decodeSuccess) {
          this.decodedBlob = this.container.decodedBlob;
        }
      } catch(e) {
        console.error(e);
      }

      this.decoding = false;
    },
    containerUploaded(container) {
      this.container = container;
      this.decodeKey = '';
      this.containerBlob = container.containerBlob;

      console.error(this.containerBlob);
    }
	},
  mounted() {
  },
}
</script>
<style scoped>

</style>

