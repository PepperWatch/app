<template>

    <q-card class="my-card" flat bordered>
		<q-card-section>
			<div class="text-overline text-primary">Last 7 Days</div>

			<ApexChartsAsync
				v-if="!isLoading && !hasError"
				type="bar"
				:options="chartOptions"
				:series="calculated.series" />

			<div class="text-caption text-grey">
				Sample Chart Widget with count of notifications in last 7 days
			</div>

		</q-card-section>

		<q-inner-loading :showing="hasError">
			<q-icon name="warning" size="50px" color="negative"/>
		</q-inner-loading>
		<q-inner-loading :showing="isLoading">
			<q-spinner-gears size="50px" color="primary" />
		</q-inner-loading>
    </q-card>

</template>

<style>
	.apexcharts-tooltip {
		/*background: #f3f3f3;*/
		color: black;
	}
	.apexcharts-xaxis-label {
		fill: var(--text-color);
	}
	body.body--dark .apexcharts-xaxis-label {
		fill: var(--text-color-dark);
	}
</style>

<script>
import WidgetMixin from '../WidgetMixin';
import ApexChartsAsync from 'shared/components/AsyncComponents/ApexChartsAsync.js';
import { getCssVar } from 'quasar';

export default {
	name: 'Last7Days', // important to have different names for widgets
	mixins: [WidgetMixin],
	props: {
	},
	data() {
		return {
			cacheFor: (60*60*1000), // cache for 1 hour
			calculated: {
				series: [
					{
						name: "series-1",
						data: [0, 0, 0, 0, 0, 0, 0, 0],
					},
				],
				categories: [],
			},
		};
	},
	watch: {
	},
	computed: {
		hasFiltersSlot() {
			// has filters slot defined on parent component, so we know if to show filters button
			return !!this.$slots.filters;
		},
		chartOptions() {
			return {
				chart: {
					id: "vuechart-example",
					toolbar: {
						show: false,
					},
					height: 400,
				},
				grid: {
					padding: {
						left: 0,
						right: 0,
					},
				},
				colors: [getCssVar('primary')],
				tooltip: {
					// fillSeriesColor: true,
				},
				yaxis: {
					show: false,
				},
				xaxis: {
					categories: this.calculated.categories,
					labels: {
						style: {
							cssClass: 'apexcharts-xaxis-label',
						},
					},
				},
			};
		},
	},
	components: {
		ApexChartsAsync,
	},
	methods: {
		async initialize() {
			// await new Promise((res)=>{ setTimeout(res, Math.random()*10000)});
			const stats = await this.$store.api.post({path: 'api/stats/last7days'});
			stats.stats.reverse();
			const serie = {
				name: 'Notifications',
				data: [],
			};
			const categories = [];
			for (let stat of stats.stats) {
				const statDate = new Date(stat.date);

				serie.data.push(stat.count);
				categories.push(''+statDate.toLocaleString('default', { month: 'short' })+' '+statDate.getDate());
			}

			this.calculated.series = [serie];
			this.calculated.categories = categories;
		},
	},
	beforeMount: function() {
	},
	mounted: async function() {
	}
}
</script>
