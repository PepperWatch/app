<template>

    <q-card class="my-card bg-secondary text-white non-selectable" flat bordered>
		<q-card-section>
			<span class="text-h5"><DateHuman :value="previewDate" /></span>
		</q-card-section>
    </q-card>

</template>
<script>
import WidgetMixin from '../WidgetMixin';
import DateHuman from 'shared/components/Helpers/DateHuman';

export default {
	name: 'Time',
	mixins: [WidgetMixin],
	props: {
	},
	data() {
		return {
			cacheFor: (24*60*60*1000),
			calculated: {
			},
			previewDate: null,
		};
	},
	watch: {
	},
	computed: {
	},
	components: {
		DateHuman,
	},
	methods: {
		async initialize() {
		},
	},
	beforeMount: function() {
	},
	mounted: async function() {
		this.__timeInterval = setInterval(()=>{
			this.previewDate = new Date();
		}, 1000);
	},
	beforeUnmount() {
		clearInterval(this.__timeInterval);
	},
}
</script>
