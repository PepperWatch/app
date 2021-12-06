<template>

	<div>
		<div v-if="!!signedAddress && !loading" class="relative-position">
			<q-btn flat round icon="sync" @click="refreshEarnings" color="yellow-6" />
			<span class="text-yellow-6 text-h8">Earnings: <q-icon color="yellow-6" name="circle"  size="20px"/>{{earningsAsLuna}}</span>
			<q-btn flat round icon="call_missed_outgoing" @click="withdraw" color="yellow-6" />
		</div>
		<q-spinner-bars v-if="signedAddress && loading" color="yellow-6" size="2em"/>
	</div>

</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'EarningsWidget',
    emits: ['connected'],
	data() {
		return {
			loading: true,
			signedAddress: null,
			chainType: null,

			provider: null,
			earnings: 0,
		}
	},
	components: {
	},
	methods: {
		withdraw: async function() {
			this.provider = this.$store.getters['blockchain/provider'];

			if (this.provider) {
				this.loading = true;
				const success = await this.provider.withdraw();
				if (success) {
					this.earnings = 0;
				}
				this.loading = false;
			}
		},
		refreshEarnings: async function() {
			this.provider = this.$store.getters['blockchain/provider'];
			this.signedAddress = this.$store.getters['blockchain/signedAddress'];

			if (this.provider && this.signedAddress) {
				const resp = await this.provider.queryContract({
					query: {"get_balance":{"addr": this.signedAddress}},
				});

				if (resp && resp.uluna) {

					this.earnings = parseInt(resp.uluna);
					if (!this.earnings) {
						this.earnings  =0;
					}
					this.loading = false;

					setInterval(()=>{
						this.earnings += (0.1 * Math.random());
					}, 200);
				} else {
					this.earnings = 0;
				}
			}

		}
	},
	mounted: function() {
		this.refreshEarnings();
	},
	watch: {
		blockchainSession: async function(){
			this.refreshEarnings();
		}
	},
	computed: {
		...mapGetters({
			// map `this.doneCount` to `this.$store.getters.doneTodosCount`
			blockchainSession: 'blockchain/sessionId'
		}),
        earningsAsLuna() {
            return ((this.earnings/1000000)).toFixed(6);
        }
	}
}
</script>