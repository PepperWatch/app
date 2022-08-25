<template>

	<a :href="'/v/'+row.mintedAddress" v-if="row.mintedAddress">{{row.mintedAddress}}</a>

	<div class="q-gutter-sm q-pt-sm" v-if="row.mintedAddress">
		<NFTLink  v-if="row.mintedAddress" forWhat="solscan" :address="row.mintedAddress" :chainType="row.chainType" />
		<NFTLink  v-if="row.mintedAddress" forWhat="solana" :address="row.mintedAddress" :chainType="row.chainType" />
		<NFTLink  v-if="row.mintedAddress" forWhat="magiceden" :address="row.mintedAddress" :chainType="row.chainType" />
	</div>

</template>
<script>

import NFTLink from 'shared/components/NFTLink';
// import { colors } from 'quasar';

export default {
	props: {
		row: Object,
		col: Object,
		value: [String, Object],
		id: String,
	},
	components: {
		NFTLink,
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
	}
}
</script>
<style lang="css">



</style>