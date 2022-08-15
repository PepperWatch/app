<template>

	<q-form class="q-gutter-md non-selectable	">
		<q-input
			filled
			v-model="data.username"
			label="username"
			hint="username"
			lazy-rules
			:rules="[ val => val && val.length > 0 || 'Please type something']"
		/>
		<q-input
			filled
			v-model="data.email"
			label="email"
			hint="email"
			lazy-rules
			:rules="[ val => val && val.length > 0 || 'Please type something']"
		/>

		<q-field
			label="Password" stack-label>

			<div class="q-px-md text-caption">
				Password will be kept for existing users or auto-generated for new ones, so user can reset it with default reset-password procedure.
			</div>
		</q-field>

		<q-field
			label="Access Level" stack-label>

			<q-option-group v-model="data.level" :options="possibleLevels.map((s)=>({label: s, value: s, disable: !this.$store.sessionUser.isLevelGreaterThan(s) }))" color="secondary" inline />
		</q-field>

	</q-form>

</template>
<script>
import UserNotifications from './cells/UserNotifications';
import { shallowRef} from 'vue';

export default {
	props: {
		item: Object
	},
	components: {
	},
	data() {
		return {
			possibleLevels: [], // get from sessionUser store
			data: this.item,
			collectionName: 'users',
			columns: [
				{
					name: 'id',
					label: '#',
					field: '_id',
					align: 'left',
					headerStyle: 'width: 70px',
					style: 'width: 70px',
					sortable: true,
				},
				{
					name: 'username',
					label: 'Username',
					field: 'username',
					align: 'left',
					headerStyle: 'width: 70px',
					style: 'width: 70px',
					sortable: true,
				},
				{
					name: 'email',
					label: 'Email',
					field: 'email',
					align: 'left',
					headerStyle: 'width: 70px',
					style: 'width: 70px',
					sortable: true,
				},
				{
					name: 'Level',
					align: 'left',
					label: 'Level',
					field: 'level',
					headerStyle: 'width: 70px',
					style: 'width: 70px',
					sortable: true
				},
				{
					name: 'Notifications',
					align: 'left',
					label: 'Notifications',
					field: null,
					component: shallowRef(UserNotifications),
					headerStyle: 'width: 70px',
					style: 'width: 70px'
				},
				{ name: 'action', label: 'Action', field: 'action' },
			],
		}
	},
	mounted: function() {
		this.possibleLevels = this.$store.sessionUser.possibleLevels;
	},
	watch: {
	},
	methods: {
	},
	computed: {
	},
}
</script>
<style lang="css">



</style>