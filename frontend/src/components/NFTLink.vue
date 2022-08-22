<template>

	<q-btn color="primary" size="sm" target="_blank" :href="href"><Icon :forWhat="forWhat" />&nbsp;{{title}}</q-btn>

</template>
<script>
import Icon from './Icon';

export default {
	name: 'NFTLink',
	props: {
		forWhat: String,
		address: String,
		chainType: String,
	},
	components: {
		Icon,
	},
	data() {
		return {
		}
	},
	mounted: function() {
	},
	computed: {
		title() {
			if (this.forWhat == 'opensea') {
				return 'OpenSea';
			} else if (this.forWhat == 'solscan') {
				return 'SolScan';
			} else if (this.forWhat == 'pepperwatch') {
				return 'PepperWatch';
			}

			return null;
		},
		href() {
			if (this.forWhat == 'opensea') {
				return "https://opensea.io/assets/solana/"+this.address;
			} else if (this.forWhat == 'solscan') {
				return "https://solscan.io/token/"+this.address;
			} else if (this.forWhat == 'pepperwatch') {
				return "/v/"+this.address;
			}

			return '';
		}
	}
}
</script>
<style>
</style>
