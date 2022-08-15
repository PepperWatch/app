<template>

	<span>
		<template v-for="level in row.levels" v-bind:key="level">
			<q-btn size="sm" color="secondary" :label="`${level}`"  @click="onClick(level)" />
			<span>&nbsp;</span>
		</template>
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
		}
	},
	watch: {
	},
	methods: {
		onClick(level) {
			this.$emit('cell', 'level', {level});
		}
	},
	computed: {
	},
	mounted: function() {
	},
}
</script>
<style lang="css">



</style>