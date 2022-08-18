<template>

	<q-form class="q-gutter-md">
	</q-form>

</template>
<script>
import DateHuman from 'shared/components/Helpers/DateHuman';
import VideoPreview from './cells/VideoPreview';
import VideoIsVisibleOnHomepage from './cells/VideoIsVisibleOnHomepage';
import VideoCollectionVerified from './cells/VideoCollectionVerified';


// import NotificationSubject from './cells/NotificationSubject';
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
			collectionName: 'videos',
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
					name: 'Preview',
					component: shallowRef(VideoPreview),
					align: 'left',
					label: 'Preview',
					field: 'publicThumbIpfsHash',
					sortable: true
				},
				{
					name: 'Date/Time',
					component: shallowRef(DateHuman),
					align: 'left',
					label: 'Date/Time',
					field: 'createdAt',
					sortable: true
				},
				{
					name: 'Chain Type',
					align: 'left',
					label: 'Chain Type',
					field: 'chainType',
					sortable: true
				},
				{
					name: 'Address',
					align: 'left',
					label: 'Address',
					field: 'mintedAddress',
					sortable: true
				},
				{
					name: 'Verified',
					align: 'left',
					label: 'Verified',
					field: 'isCollectionVerified',
					component: shallowRef(VideoCollectionVerified),
					sortable: true
				},
				{
					name: 'Price',
					align: 'left',
					label: 'Price',
					field: 'price',
					sortable: true
				},
				{
					name: 'Show On Homepage',
					component: shallowRef(VideoIsVisibleOnHomepage),
					align: 'left',
					label: 'Show On Homepage',
					field: 'isVisibleOnHomepage',
					sortable: true
				},

				// isVisibleOnHomepage
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