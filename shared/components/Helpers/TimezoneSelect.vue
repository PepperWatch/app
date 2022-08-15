<template>

	<q-select
		filled
		v-model="model"
		:label="label"
		:options="options"
		@update:modelValue="onUpdate"
		:hint="hint"
		:popup-content-class="popupContentClass"
		:dark="darkComputed"
        use-input
        input-debounce="0"
        @filter="filterFn"
		>
        <template v-slot:option="scope">
			<q-item v-bind="scope.itemProps">
				<q-item-section>
					<q-item-label>{{ scope.opt.label }}</q-item-label>
					<q-item-label caption>{{ scope.opt.time }}</q-item-label>
				</q-item-section>
			</q-item>
        </template>
		<template v-slot:no-option>
			<q-item>
				<q-item-section class="text-grey">
					No results
				</q-item-section>
			</q-item>
		</template>
	</q-select>

</template>

<style lang="css">
</style>

<script>

		// popup-content-class="bg-dark"
export default {
	name: 'DataSelect',
	props: {
		label: {
			type: String,
		},
		hint: {
			type: String,
		},
		dark: {
			type: Boolean,
		},
		modelValue: {
			type: [String, Object],
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			model: null,
			options: [
			],
			initialOptions: null,
		}
	},
	watch: {
	},
	computed: {
		popupContentClass: function() {
			if (this.$q.dark.mode) {
				return 'bg-dark';
			} else {
				return '';
			}
		},
		darkComputed: function() {
			if (this.dark || this.$q.dark.mode) {
				return true;
			} else {
				return false;
			}
		}

	},
	components: {
	},
	methods: {
		filterFn (val, update) {
			if (val === '') {
				update(() => {
					this.options = this.initialOptions;
				});
				return;
			}

			update(() => {
				const needle = val.toLowerCase();
				this.options = this.initialOptions.filter(v => v.value.toLowerCase().indexOf(needle) > -1)
			})
		},
		defaultTimezones() {
			return [
				'America/Chicago',
				'America/New_York'
			];
		},
		getAvailableTimezones() {
			let zones = [];
			try {
				zones = Intl.supportedValuesOf('timeZone');
			} catch(e) {
				zones = this.defaultTimezones();
			}

			let ret = [];

			const date = new Date();
			for (let zone of zones) {
				let strTime = date.toLocaleString("en-US", {timeZone: zone});
				// let offset = date.toLocaleString("en-US", {timeZone: zone, timeZoneName: 'shortOffset'});

				ret.push({
					value: zone,
					label: `${zone}`,
					time: strTime,
				});
			}

			ret.sort((a,b)=>{
				return (a.time > b.time) ? 1 : -1;
			});

			ret.unshift({
				value: '',
				label: 'Device Default Timezone',
			});

			return ret;
		},
		onUpdate(data) {
			if (Array.isArray(data)) {
				// multiple
				this.$emit('update:modelValue', data.map(item=>item.value));
			} else {
				if (data) {
					this.$emit('update:modelValue', data.value);
				} else {
					this.$emit('update:modelValue', '');
				}
			}

			this.$emit('change', data);
		},
		fillInitial() {
			if (!this.initialOptions) {
				this.initialOptions = this.getAvailableTimezones();
				this.options = [...this.initialOptions];
			}

			if (!this.modelValue) {
				this.model = {value: '', label: 'Device Default Timezone'};
			} else {
				for (let opt of this.options) {
					if (opt.value == this.modelValue) {
						this.model = opt;
					}
				}
			}

			const unwatchModelValue = this.$watch('modelValue', ()=>{
				unwatchModelValue();
				this.fillInitial();
			});
		}
	},
	mounted: async function() {
		// delay to make page initialization smoother
		setTimeout(()=>{
			this.fillInitial();
		}, 200);
	},
}
</script>
