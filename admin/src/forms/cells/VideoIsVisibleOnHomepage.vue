<template>

	<span v-if="row.mintedAddress">
		<q-toggle v-model="localValue" />
	</span>

</template>
<script>

export default {
	props: {
		row: Object,
		col: Object,
		value: String,
		id: String,
	},
	data() {
		return {
			isLoading: false,
			localValue: false,
		}
	},
	watch: {
	},
	methods: {
		// async onClick() {
		// 	this.isLoading = true;
		// 	await this.row.getNotificationsCount();
		// 	this.isLoading = false;
		// 	// this.$emit('cell', 'level', {level});
		// },
		// onGoTo() {
		// 	// this.$emit('cell', 'notifications', {row: this.row, id: this.row._id});
		// },
	},
	computed: {
	},
	mounted: function() {
		this.localValue = !!this.value;
		this.$watch('localValue', ()=>{
			this.row.setIsVisibleOnHomepage(!!this.localValue);
		});
		// this.value = !!
	},
}
</script>
<style lang="css">



</style>