<template>

	<div>
	</div>

</template>

<style>
</style>

<script>
import Terra from '../../classes/Terra.js';

export default {
	name: 'TerraSync',
	data() {
		return {
		}
	},
	emits: ['connected', 'loaded', 'disconnected', 'error'],
	components: {
	},
	methods: {
		// async test() {
		// 	const txhash = await this.terra.executeContract({
		// 		contractAddress: 'terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5',
		// 		instructions: {"increment":{}},

		// 	});

		// 	const tx = await this.terra.waitForTransaction(txhash);

		// 	console.error('tx', tx);



		// 	await this.terra.queryContract({
		// 		contractAddress: 'terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5',
		// 		query: {"get_count":{}},

		// 	});

		// 	await new Promise((res)=>{ setTimeout(res, 10000); });

		// 	await this.terra.getTransaction(txhash);
		// },
		disconnect() {
			this.terra.disconnect();
			this.$emit('disconnected');
		},
		connect() {
			this.terra.connect();
		},
	},
	mounted: function() {
		this.terra = Terra.getSingleton();
		// this.terra.connect();

		this.terra.addEventListener('connected', () => {
			this.$emit('connected', this.terra);

			// console.error(this.terra);

			// this.test();
			//
			// this.terra.executeOnContract({
			// 	contractAddress: 'terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5',
			// 	instructions: {"increment":{}},

			// });
		});

		this.terra.addEventListener('error', () => {
			this.$emit('error', this.terra);

			// console.error(this.terra);

			// this.test();
			//
			// this.terra.executeOnContract({
			// 	contractAddress: 'terra18vd8fpwxzck93qlwghaj6arh4p7c5n896xzem5',
			// 	instructions: {"increment":{}},

			// });
		});

		this.$emit('loaded');
	},
	computed: {
		// displayAddress() {
		// 	return (''+this.signedAddress).substr(0,5)+'...'+(''+this.signedAddress).substr(-5);
		// },
	}
}
</script>
