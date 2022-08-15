<template>

	<q-dialog v-model="showFilters" position="right">
		<q-card style="width: 50vw;">
			<!-- class="bg-dark text-primary"  -->
			<q-linear-progress :value="0.6" color="primary" />

			<q-card-section>
				<slot :filters="filters"></slot>
			</q-card-section>
			<q-card-actions vertical>
				<q-btn flat @click="onReset">Reset</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>

</template>

<style lang="css">
</style>

<script>

export default {
	name: 'DataFilters',
	props: {
		default: {
			type: Object,
			default: null,
		}
	},
	emits: ['change'],
	data() {
		return {
			showFilters: false,
			filters: {

			},
		}
	},
	watch: {
		// filters: {
		// 	deep: true,
		// 	handler() {
		// 		this.filtersChanged();
		// 	}
		// },
	},
	computed: {
	},
	components: {
	},
	methods: {
		filtersChanged() {
			console.error('filter change')

			this.$emit('change', this.filters);
		},
		onReset() {
			this.filters = {};
		},
		show() {
			this.showFilters = true;
		}
	},
	beforeMount: function() {
		if (this.default) {
			this.filters = {...this.default};

			console.error('set default filters', this.filters);
		}
	},
	mounted: async function() {
		// add watcher after mount so it's not trigered on initial assigning default value
		this.$watch('filters', ()=>{
			this.filtersChanged();
		}, {deep: true});
	},
}
</script>
