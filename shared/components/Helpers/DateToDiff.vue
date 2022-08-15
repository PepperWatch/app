<template>

	<span>{{ pretty }}</span>

</template>

<script>
//
export default {
	name: 'DateToDiff',
	props: {
		date: [Object, String, Number],
	},
	data() {
		return {
			pretty: '',
		}
	},
	watch: {
		date: function() {
			this.pretty = this.prettyDate(this.date);
		}
	},
	methods: {
		prettyDate(date) {
			let normalizedDate = null;
			if (date instanceof Date) {
				normalizedDate = date;
				// ok
			} else {
				normalizedDate = new Date(date);
			}
			// alert(date);

			let diff = (((new Date()).getTime() - normalizedDate.getTime()) / 1000);
			let day_diff = Math.floor(diff / 86400);

			if (isNaN(day_diff) || day_diff < 0 || day_diff >= 31) return;

			return day_diff == 0 && (
				diff < 60 && "just now" || diff < 120 && "1 minute ago" || diff < 3600 && Math.floor(diff / 60) + " minutes ago" || diff < 7200 && "1 hour ago" || diff < 86400 && Math.floor(diff / 3600) + " hours ago") || day_diff == 1 && "Yesterday" || day_diff < 7 && day_diff + " days ago" || day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago";
		}
	},
	async mounted() {
		this.pretty = this.prettyDate(this.date);
	},
	computed: {
	},
}
</script>

