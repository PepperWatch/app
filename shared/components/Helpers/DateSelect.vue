<template>

		<q-popup-proxy @before-show="updateProxy" cover transition-show="scale" transition-hide="scale">
			<q-date v-model="proxyDate" :range="range">
				<div class="row items-center justify-end q-gutter-sm">
					<q-btn label="Cancel" color="primary" flat v-close-popup />
					<q-btn label="OK" color="primary" flat @click="okDate" v-close-popup />
				</div>
			</q-date>
		</q-popup-proxy>

</template>

<style lang="css">
</style>

<script>

export default {
	name: 'DateSelect',
	props: {
		modelValue: {
			type: [String, Object],
		},
		range: {
			type: Boolean,
			default: false,
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			proxyDate: null,
		}
	},
	watch: {
		// modelValue: function() {
		// 	const minEventDiffTime = 100;
		// 	if (!this.__modelUpdatedByChildAt || ((new Date()).getTime() - this.__modelUpdatedByChildAt) > minEventDiffTime) {
		// 		this.updateProxy();
		// 	}
		// },
	},
	computed: {
	},
	components: {
	},
	methods: {
		updateProxy () {
			if (this.modelValue) {
				this.proxyDate = this.dateToStr(this.modelValue);
			}

			const unwatchModelValue = this.$watch('modelValue', ()=>{
				unwatchModelValue();
				this.updateProxy();
			});
		},
		okDate () {
			// this.model = this.strToDate(this.proxyDate);
			// this.__modelUpdatedByChildAt = (new Date()).getTime();
			this.$emit('update:modelValue', this.strToDate(this.proxyDate));
		},
		dateToStr(value) {
			if (value.from && value.to) {
				return {
					from: this.dateToStr(value.from),
					to: this.dateToStr(value.to),
				}
			}

			if (!value.getFullYear) {
				return null;
			}

			return `${value.getFullYear()}/${('0'+(value.getMonth()+1)).slice(-2)}/${('0'+value.getDate()).slice(-2)}`;
		},
		strToDate(value) {
			if (value.from && value.to) {
				return {
					from: this.strToDate(value.from),
					to: this.strToDate(value.to),
				}
			}

			let timezone = undefined;
			if (this.$store?.sessionUser?.profileSettings?.timezone) {
				timezone = this.$store?.sessionUser?.profileSettings?.timezone;
			}

			if (timezone) {
				const options = {
					timeZone: timezone,
					timeZoneName: 'shortOffset'
				};
				const offset = (new Intl.DateTimeFormat('en-US', options)).format(new Date()).split('GMT')[1];
				let offsetedString = `${value} 00:00:00 GMT${offset}`;

				return new Date(offsetedString);
			}

			return new Date(value);
		},
	},
	beforeMount: function() {
	},
	mounted: async function() {

	},
}
</script>
