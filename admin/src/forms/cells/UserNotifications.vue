<template>

	<span>
		<q-btn size="sm" color="secondary" icon="help_outline" round @click="onClick" :loading="isLoading" v-if="!row.notificationsCount" />
		<span v-if="row.notificationsCount">{{row.notificationsCount}}&nbsp;</span>
		<q-btn size="sm" color="secondary" icon="search" round @click="onGoTo" v-if="row.notificationsCount" />

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
		}
	},
	watch: {
	},
	methods: {
		async onClick() {
			this.isLoading = true;
			await this.row.getNotificationsCount();
			this.isLoading = false;
			// this.$emit('cell', 'level', {level});
		},
		onGoTo() {
			this.$emit('cell', 'notifications', {row: this.row, id: this.row._id});
		},
	},
	computed: {
	},
}
</script>
<style lang="css">



</style>