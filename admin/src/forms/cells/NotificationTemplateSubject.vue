<template>

	<span>
		<q-chip @click="test" clickable class="cursor-pointer" :style="{ backgroundColor: backgroundColor, color: textColor }">{{row.subject}}</q-chip>

	</span>

</template>
<script>
import { colors } from 'quasar';

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
		test() {
			let style = "";
			if (this.row.color) {
				style += 'background-color: '+this.row.color;
				if (colors.luminosity(this.row.color) > 0.4) {
					style += ' !important; color: #000000 !important;';
				} else {
					style += ' !important; color: #ffffff;';
				}
			}

			console.error('displaying with style', style);

			this.$q.notify({
				attrs: {
					// for the notification itself:
					style: style
				},
				position: 'top-right',
				message: this.row.subject, // virtual .subject
				style: style,
			});
		}
	},
	computed: {
		backgroundColor: function() {
			if (this.row.color) {
				return this.row.color;
			} else {
				return '#999999';
			}
		},
		textColor: function() {
			if (!this.row.color) {
				return '#ffffff';
			}

			if (colors.luminosity(this.row.color) > 0.4) {
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