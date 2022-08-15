<template>

	<div>
		<h5 class="text-primary">Notification Templates</h5>

		<div>
			<DataTable :form="form">
				<template #filters="slotProps">
					<q-checkbox v-model="slotProps.filters.showInUI" keep-color color="secondary" label="To Be Shown In UI"/>
					<q-separator spaced />
					<q-checkbox v-model="slotProps.filters.canSendAsEmail" keep-color color="secondary" label="Can Be Sent As Email"/>
				</template>
			</DataTable>
		</div>
	</div>

</template>

<script>

import DataTable from 'components/ManageHelpers/DataTable';
import Form from 'forms/NotificationTemplate';
import { shallowRef} from 'vue';

//
export default {
	name: 'Notification Templates',
	title: 'Notification Templates',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/notification_templates',
	components: {
		DataTable
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			form: shallowRef(Form),
		}
	},
	methods: {
	},
	async mounted() {
	},
}
</script>
<style scoped>

</style>

