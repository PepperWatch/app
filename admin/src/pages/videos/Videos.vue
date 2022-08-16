<template>

	<div>
		<h5 class="text-primary">Videos</h5>

		<div>
			<DataTable :form="form" disableAdd defaultSortBy="Date/Time" defaultSortDescending :defaultFilters="filter">
				<!-- <template #filters="slotProps">
				</template> -->
			</DataTable>
		</div>
	</div>

</template>

<script>

// import DataSelect from 'shared/components/Helpers/DataSelect.vue';
import DataTable from 'components/ManageHelpers/DataTable';
import Form from 'forms/Video';
import { shallowRef} from 'vue';

//
export default {
	name: 'Videos',
	title: 'Videos',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/videos/:filter?',
	components: {
		DataTable,
		// DataSelect,
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			isVisible: false,
			form: shallowRef(Form),
			filter: null,
		}
	},
	methods: {
		becomeVisible() {
			this.isVisible = true;
		}
	},
	beforeMount() {
		if (this.$route.params.filter) {
			try {
				console.error(this.$route.params.filter)
				this.filter = JSON.parse(this.$route.params.filter);
			} catch(e) {
				this.filter = null;
			}
		}

		console.error('filter', this.filter);
	},
	async mounted() {
	},
}
</script>
<style scoped>

	.subjectColor {
		width: 20px;
		height: 20px;
	}

</style>

