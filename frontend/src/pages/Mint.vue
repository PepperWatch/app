<template>

  <div>
    <h6 class="text-primary">Mint</h6>

    <p>There're two options available:</p>


    <div class="row items-start q-gutter-md">
        <q-card style="max-width: 300px;">
            <q-card-section style=" height: 100px;">
                Use our experimental browser-based video editor to cipher video file and extract part of it that will be available for free.
            </q-card-section>
            <q-card-actions vertical align="center">
            <q-btn unelevated color="primary" size="md" to="/encode">Browser Based</q-btn>
            </q-card-actions>
        </q-card>
        <q-card style="max-width: 300px;">
            <q-card-section style=" height: 100px;">
                Upload two versions of the media you prepared elsewhere.
            </q-card-section>
            <q-card-actions vertical align="center">
            <q-btn unelevated color="primary" size="md" to="/encode2">Already Prepared</q-btn>
            </q-card-actions>
        </q-card>
    </div>


  </div>

</template>

<script>

export default {
	name: 'Mint',
    path: '/mint',
    title: 'Mint',
    authRequired: false,
	props: {
	},
    components: {
    },
	data() {
		return {
			isActive: false,
		}
	},
    watch: {
    },
	methods: {
	},
  mounted() {
  },
}
</script>
