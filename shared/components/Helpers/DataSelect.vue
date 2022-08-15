<template>

	<q-select
		filled
		v-model="model"
		:use-chips="multiple"
		:multiple="multiple"
		use-input
		:hide-selected="!multiple"
		:fill-input="!multiple"
		input-debounce="0"
		:label="label"
		:options="options"
		@filter="filterFn"
		@filter-abort="abortFilterFn"
		@update:modelValue="onUpdate"
		:hint="hint"
		:popup-content-class="popupContentClass"
		:dark="darkComputed"
		>
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
		collectionName: {
			type: String,
			required: true,
		},
		nameProperty: {
			type: String,
			default: 'name',
		},
		dark: {
			type: Boolean,
		},
		modelValue: {
			type: [String, Object],
		},
		multiple: {
			type: Boolean,
			default: false,
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
		// modelValue: function() {
		// 	const minEventDiffTime = 100;
		// 	if (!this.__modelUpdatedByChildAt || ((new Date()).getTime() - this.__modelUpdatedByChildAt) > minEventDiffTime) {
		// 		console.error('updated outside');
		// 		this.fillInitial();
		// 	}
		// },
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
		onUpdate(data) {
			this.__modelUpdatedByChildAt = (new Date()).getTime();

			if (Array.isArray(data)) {
				// multiple
				this.$emit('update:modelValue', data.map(item=>item.value));
			} else {
				this.$emit('update:modelValue', data.value);
			}

			this.$emit('change', data);
		},
		getCachedResult(filterBy) {
			if (!this.__resultsCache) {
				this.__resultsCache = [];
				this.__resultsCachePointers = {};
				return null;
			}

			if (this.__resultsCachePointers[filterBy]) {
				return this.__resultsCachePointers[filterBy];
			}

			return null;
		},
		storeCachedResult(filterBy, options) {
			if (this.getCachedResult(filterBy)) {
				// console.log('has results for', filterBy);
				return false;
			}

			this.__resultsCachePointers[filterBy] = options;
			this.__resultsCache.push(filterBy);

			this.__resultsCache.slice(0,-50).forEach((filterByToRemove)=>{
				// console.log('removing', filterByToRemove)

				delete this.__resultsCachePointers[filterByToRemove];
				this.__resultsCache.shift();
			});
		},
		async loadValues(filterBy = null) {
			if (!filterBy && this.initialOptions) {
				return this.initialOptions;
			}
			const cached = this.getCachedResult(filterBy);
			if (cached) {
				// console.log('has results for', filterBy);
				return cached;
			}

			const options = {
				offset: 0,
				limit: 50,
				sort: '_id',
			};

			if (filterBy) {
				options.match = ''+this.nameProperty+"=(?i)"+filterBy;
			}

			const resp = await this.collection.list(options);
			const ret = [];
			if (resp.items) {
				resp.items.forEach((row)=>{
					ret.push({
						label: row[this.nameProperty],
						value: row._id,
					});
				});

				if (!this.initialOptions) {
					this.initialOptions = ret;
				}
			}

			this.storeCachedResult(filterBy, ret);

			return ret;
		},
		filterFn (val, update, abort) {
			this.loadValues(val)
				.then((options)=>{
					update(()=>{
						this.options = options;
					});
				})
				.catch(()=>{
					abort();
				});
		},
		abortFilterFn () {
		// console.log('delayed filter aborted')
		},
		async fillInitial() {
			console.log('filling initial', this.modelValue);

			if (typeof this.modelValue === 'string') {
				const resp = await this.collection.get({id: this.modelValue});

				if (resp) {
					this.model = {label: resp[this.nameProperty], value: resp._id};
				}
				// console.error(resp);
			} else if (Array.isArray(this.modelValue)) {
				if (this.modelValue.length && this.modelValue[0]._id) {
					// list of documents
					this.model = this.modelValue.map((i)=>{
						return {label: i[this.nameProperty], value: i._id};
					});
				} else if (this.modelValue.length) {
					// list of ids
					const values = [];
					for (let id of this.modelValue) {
						const resp = await this.collection.get({id: id});
						if (resp) {
							values.push({label: resp[this.nameProperty], value: resp._id});
						}
					}
					this.model = values;
				} else {
					this.model = null;
				}
			} else if (this.modelValue && this.modelValue[this.nameProperty]) {
				this.model = {label: this.modelValue[this.nameProperty], value: this.modelValue._id};
			} else {
				this.model = null;
			}

			const unwatchModelValue = this.$watch('modelValue', ()=>{
				unwatchModelValue();
				this.fillInitial();
			});
		}
	},
	beforeMount: function() {
		// console.error(this.modelValue);
	},
	mounted: async function() {
		this.collection = await this.$store.api.collection(this.collectionName);

		setTimeout(()=>{
			this.loadValues();
			this.fillInitial();
		}, 200);
	},
}
</script>
