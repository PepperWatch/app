<template>

	<q-form class="q-gutter-md">
	</q-form>

</template>
<script>
import DateHuman from 'shared/components/Helpers/DateHuman';
import NotificationSubject from './cells/NotificationSubject';
import { shallowRef} from 'vue';

export default {
	props: {
		item: Object
	},
	components: {
	},
	data() {
		return {
			data: this.item,
			collectionName: 'notifications',
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
					name: 'Date/Time',
					component: shallowRef(DateHuman),
					align: 'left',
					label: 'Date/Time',
					field: 'createdAt',
					sortable: true
				},
				{ name: 'Target', align: 'left', label: 'Target', field: 'level', sortable: true, format: (val,row) => {
					if (row.email) {
						return row.email;
					} else {
						return row.level;
					}
				} },
				// { name: 'subject', align: 'left', label: 'Subject', field: 'template', populate: true, sortable: true, format: (val,row) => {
				// 	return `<span class="subjectColor" style="background-color: ${row.color}"></span> ${row.subject}`; // virtual .subject  important we have .tempalte populated
				// }  },
				{
					name: 'subject',
					align: 'left',
					label: 'Subject',
					field: 'template',
					populate: true,    /// important we have .template field populated
					sortable: false,
					component: shallowRef(NotificationSubject),
				},
				{ name: 'action', label: 'Action', field: 'action' },
			],
		}
	},
	mounted: function() {
		// this.data = this.item;
	},
	watch: {
	},
	methods: {
	},
	computed: {
	}
}
</script>
<style lang="css">



</style>