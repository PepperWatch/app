<template>

	<div>
		<h5 class="text-primary">Users</h5>

		<div>
			<DataTable :form="form" @notifications="onNotifications" />
		</div>
	</div>

</template>

<script>

import DataTable from 'components/ManageHelpers/DataTable';
import Form from 'forms/User';
import { shallowRef} from 'vue';

//
export default {
	name: 'Users',
	title: 'Users',
	authRequired: true,
	requiredAuthLevel: 'admin',
	path: '/users',
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
		/**
		 * Event 'notifications' emited in UserNotifications component transmited through DataTable
		 * @param  {[type]} data [description]
		 * @return {[type]}      [description]
		 */
		onNotifications(data) {
			const { row, id } = data; // object where event fired
			console.log('got event from', row, id);

			const filter = JSON.stringify({user: [id]});

			// both would work:
			this.$router.push('/notifications/'+encodeURIComponent(filter));
			// this.$router.push({ name: 'Notifications', params: { filter: filter } });
		},
	},
	beforeMount() {
	},
	mounted() {
	},
}
</script>
<style scoped>

</style>

