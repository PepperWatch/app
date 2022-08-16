<template>

	<div style="height: 100px;">
		<q-img
			:src="url"
			spinner-color="primary"
			style="height: 100px; max-width: 150px;"
		/>
	</div>

</template>
<script>
// import { colors } from 'quasar';

export default {
	props: {
		row: Object,
		col: Object,
		value: [String, Object],
		id: String,
	},
	data() {
		return {
			isLoading: false,
			url: null,
		}
	},
	watch: {
	},
	methods: {
	},
	computed: {
	},
	mounted: function() {
		if (this.row.publicThumbIpfsHash) {
			this.url = 'https://arweave.net/'+this.row.publicThumbIpfsHash;
		}
	}
}
</script>
<style lang="css">



</style>