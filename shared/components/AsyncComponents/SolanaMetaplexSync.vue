<template>

	<div></div>

</template>


<script>

import MetaplexClass from 'shared/classes/Metaplex.js';

export default {
	name: 'SolanaMetaplexSync',
	data() {
		return {
			initialized: false,
			isReady: false,
		}
	},
	methods: {
	},
	mounted: function() {
		this.$emit('loaded', MetaplexClass.export());
	},
	computed: {
	}
}
</script>