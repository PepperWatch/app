<template>

	<div>
		<VueApexCharts
			v-bind="$attrs"
			></VueApexCharts>
	</div>

</template>

<style>
</style>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
	name: 'ApexChartsSync',
	data() {
		return {
		}
	},
	emits: ['loaded'],
	components: {
		VueApexCharts,
	},
	methods: {
		async test() {
		},
	},
	mounted: function() {
		this.$emit('loaded');
	},
	computed: {
	}
}
</script>
