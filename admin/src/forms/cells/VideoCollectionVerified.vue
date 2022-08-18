<template>

	<span>
		<q-btn color="primary" icon="verified_user" :disabled="true" size="sm" round v-if="row.isCollectionVerified" :loading="isLoading" />
		<q-btn color="primary" icon="shield" size="sm" round v-if="!row.isCollectionVerified" @click="onClick()" :loading="isLoading"/>
		<!-- <q-toggle v-model="localValue" /> -->
	</span>

</template>
<script>

export default {
	props: {
		row: Object,
		col: Object,
		value: String,
		id: String,
	},
	data() {
		return {
			isLoading: false,
			localValue: false,
		}
	},
	watch: {
	},
	methods: {
		async onClick() {
			this.isLoading = true;

			await this.$store.solana.request(this.row.chainType);
			const provider = this.$store.solana.provider;

			let success = false;
			try {
				success = await provider.verifyCollection(this.row.mintedAddress, this.row.collectionAddress);
			} catch(e) {
				success = false;
			}

			if (success) {
				await this.row.markAsVerified();
			}

			this.isLoading = false;
			// this.$emit('cell', 'level', {level});
		},
		// onGoTo() {
		// 	// this.$emit('cell', 'notifications', {row: this.row, id: this.row._id});
		// },
	},
	computed: {
	},
	mounted: function() {
	},
}
</script>
<style lang="css">



</style>