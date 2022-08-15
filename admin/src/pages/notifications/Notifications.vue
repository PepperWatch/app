<template>

	<div>
		<h5 class="text-primary">Notifications</h5>

		<div>
			<DataTable :form="form" disableAdd defaultSortBy="Date/Time" defaultSortDescending :defaultFilters="filter">
				<template #filters="slotProps">
					<DataSelect multiple collectionName="notification_templates" nameProperty="name" v-model="slotProps.filters.template" label="Template"/>
					<DataSelect multiple collectionName="users" nameProperty="username" v-model="slotProps.filters.user" label="User"/>
				</template>
			</DataTable>
		</div>
	</div>

</template>

<script>

import DataSelect from 'shared/components/Helpers/DataSelect.vue';
import DataTable from 'components/ManageHelpers/DataTable';
import Form from 'forms/Notification';
import { shallowRef} from 'vue';

//
export default {
	name: 'Notifications',
	title: 'Notifications',
	authRequired: true,
	requiredAuthLevel: 'admin',
	path: '/notifications/:filter?',
	components: {
		DataTable,
		DataSelect,
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

