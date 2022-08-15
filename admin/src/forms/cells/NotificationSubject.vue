<template>

	<span>
		<q-chip :style="{ backgroundColor: backgroundColor, color: textColor }" :ripple="false">{{row.subject}}</q-chip>

	</span>

</template>
<script>
import { colors } from 'quasar';

export default {
	props: {
		row: Object,
		col: Object,
		value: [String, Object],
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
	},
	computed: {
		backgroundColor: function() {
			if (this.row.template.color) {
				return this.row.template.color;
			} else {
				return '#999999';
			}
		},
		textColor: function() {
			if (!this.row.template.color) {
				return '#ffffff';
			}

			if (colors.luminosity(this.row.template.color) > 0.4) {
				return '#000000';
			} else {
				return '#ffffff';
			}
		}
	},
}
</script>
<style lang="css">



</style>