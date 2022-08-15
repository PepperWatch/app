<template>

	<div>

		<q-table
			class="my-sticky-dynamic"
			title="Sources"
			:rows="rows"
			:columns="columns"
			:loading="loading"
			:filter="search"
			:loading-label="loadingLabel"
			row-key="_id"
			v-model:pagination="pagination"
			:rows-per-page-options="[10,20,50,100,500]"
			@request="onRequest"
			binary-state-sort
			color="primary"
			selection="multiple"
			v-model:selected="selected"
		>

			<template v-slot:body-cell="props">
				<q-td :props="props">
					<template v-if="props.col.component">
						<component v-bind:is="props.col.component" :id="props.key" :row="props.row" :col="props.col" :value="props.value" @cell="cellEvent"></component>
					</template>
					<template v-else>
						{{ props.value }}
					</template>
				</q-td>
			</template>
			<template v-slot:top-selection>
				<div>
					<q-btn-group push>
						<q-btn color="negative" label="Delete"
						icon="delete" @click="showRemove(null);" />
					</q-btn-group>
				</div>
			</template>
			<template v-slot:top-left>
				<div>
					<q-btn-group push>
						<q-btn color="primary" label="Add"
						icon="add" @click="showAdd" v-if="!disableAdd" />
					</q-btn-group>
				</div>
			</template>

			<template v-slot:top-right>
				<div>
					<q-btn-group push>
						<q-btn v-if="hasFiltersSlot" size="sm" :color="filtersButtonColor ? filtersButtonColor : 'primary'" icon="filter_alt" class="q-mr-sm" @click="onShowFilters">
							<q-badge color="secondary" floating v-if="!!activeFiltersCount">{{ activeFiltersCount }}</q-badge>
						</q-btn>
						<q-input outlined dense debounce="300" v-model="search" placeholder="Search">
							<template v-slot:append>
								<q-icon v-if="!search" name="search" />
								<q-icon v-if="search" name="close" @click.stop="search = null" class="cursor-pointer" />
							</template>
						</q-input>
					</q-btn-group>
				</div>
			</template>

			<template v-slot:body-cell-id="props">
				<q-td :props="props">
					<span @click="copyToClipboard(props.value)" class="cursor-pointer">&hellip;{{ (''+props.value).slice(-4) }}</span>
				</q-td>
			</template>
			<template v-slot:body-cell-action="props">
				<q-td :props="props">
					<template v-for="(extraAction, index) in extraActions"  v-bind:key="index">
						<q-btn
						:color="extraAction.color"
						:icon-right="extraAction.icon"
						:title="extraAction.title"
						no-caps
						flat
						dense
						@click="extraActionEvent(extraAction.action, {id: props.row._id, row: props.row})"
						/>
					</template>
					<q-btn
					color="primary"
					icon-right="edit"
					no-caps
					flat
					dense
					@click="showEdit(props.row)"
					v-if="!disableEdit"
					/>
					<q-btn
					color="negative"
					icon-right="delete"
					no-caps
					flat
					dense
					@click="showRemove(props.row._id)"
					/>
				</q-td>
			</template>

		</q-table>
			<!-- @virtual-scroll="onScroll" -->

		<q-dialog v-model="showDialogAdd">
			<q-card style="width: 700px; max-width: 80vw;">
				<q-card-section class="row items-center q-pb-none">
					<div class="text-h6">Add Item</div>
					<q-space />
					<q-btn icon="close" flat round dense v-close-popup />
				</q-card-section>

				<q-card-section style="max-height: 50vh">
					<q-scroll-area style="height: 50vh;">
						<component v-bind:is="form" :item="addItem"></component>
					</q-scroll-area>
				</q-card-section>

				<q-card-actions align="right" class="modalDialogActions">
					<q-chip icon="report" :label="addErrorString" color="negative" v-if="addErrorString" />
					<q-btn label="Cancel" color="secondary" v-close-popup unelevated/>
					<q-btn label="Save" color="positive" unelevated  @click="commitAdd" :loading="isAdding" />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<q-dialog v-model="showDialogEdit">
			<q-card style="width: 700px; max-width: 80vw;">
				<q-card-section class="row items-center q-pb-none">
					<div class="text-h6">Edit Item</div>
					<q-space />
					<q-btn icon="close" flat round dense v-close-popup />
				</q-card-section>

				<q-card-section style="max-height: 50vh">
					<q-scroll-area style="height: 50vh;">
						<component v-bind:is="form" :item="editItem"></component>
					</q-scroll-area>
				</q-card-section>

				<q-card-actions align="right">
					<q-chip icon="report" :label="editErrorString" color="negative" v-if="editErrorString" />
					<q-btn label="Cancel" color="secondary" v-close-popup unelevated @click="cancelEdit"/>
					<q-btn label="Save" color="positive" unelevated  @click="commitEdit" :loading="isEditing" />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<q-dialog v-model="showDialogRemove">
			<q-card  class="text-negative">
				<q-card-section class="row items-center" >
					<q-avatar icon="delete" color="negative"  text-color="primary"  />
					<span class="q-ml-sm" v-if="!selected.length"><strong>Are you sure that you want to remove this item?</strong></span>
					<span class="q-ml-sm" v-if="selected.length"><strong>Are you sure that you want to remove {{selected.length}} item<span v-if="selected.length > 1">s</span>?</strong></span>

				</q-card-section>

				<q-card-actions align="right">
					<q-btn label="Cancel" color="secondary" text-color="dark" v-close-popup unelevated />
					<q-btn label="Yes, Remove" color="negative" text-color="dark"  v-close-popup unelevated @click="commitDelete" />
				</q-card-actions>
			</q-card>
		</q-dialog>

		<DataFilters ref="dataFilters" v-slot="slotProps" @change="filtersChanged" :default="filters">
			<slot name="filters" :filters="slotProps.filters"></slot>
		</DataFilters>

	</div>

</template>

<style lang="css">
	.my-sticky-dynamic {
		/*height: 610px;*/

	}

	.q-btn {
		transition: background-color 1s ease;
	}

	.q-table__top, .q-table__bottom, thead tr:first-child th /* bg color is important for th; just specify one */ {
		background-color: transparent;
	}

	thead tr th {
		position: sticky;
		z-index: 1;
	}

	/* this will be the loading indicator */
	thead tr:last-child th {
		top: 48px;
	}

	/* height of all previous header rows */
	thead tr:first-child th {
		top: 0;
	}

	th:last-child, .q-table tbody td:last-child {
		position: sticky;
		right: 0;
		z-index: 1;
		background: #ffffff55;
		backdrop-filter: blur(2px);
	}

	.body--dark th:last-child, .body--dark .q-table tbody td:last-child {
		background: var(--brand-header-color-dark);
	}

	.modalDialogActions .q-chip {
		max-width: 70%;
	}

	.q-table__control .q-btn-group > .q-btn-item:not(:last-child) {
		border-top-right-radius: inherit;
		border-bottom-right-radius: inherit;
	}
</style>

<script>
import { copyToClipboard } from 'quasar';
import DataFilters from './DataFilters';

export default {
	name: 'DataTable',
	props: {
		form: {
			type: Object,
			required: true,
		},
		defaultSortBy: {
			type: String,
			default: '_id',
		},
		disableAdd: {
			type: Boolean,
			default: false,
		},
		disableEdit: {
			type: Boolean,
			default: false,
		},
		defaultSortDescending: {
			// note that this is column name from Form definition, not the db field name (though it's good idea to keep them same)
			type: Boolean,
			default: false,
		},
		defaultFilters: {
			type: Object,
			default: null,
		},
		listPath: {
			type: String,
			default: '',
		},
		extraActions: {
			type: Array,
			default: ()=>{ return []; },
		},
		extraApiParams: {
			type: Object,
		},
	},
	data() {
		return {
			collectionName: null,
			formComponent: 'Source',
			selected: [],

			search: '',
			filters: null,
			activeFiltersCount: 0,
			filtersButtonColor: null,

			columns: [], // we'll get it from form in beforeMount
			loading: false,
			pagination: {
				sortBy: '_id',
				descending: false,
				page: 1,
				rowsPerPage: 20,
				rowsNumber: 10000
			},
			rows: [],
			collection: null,

			lastOffset: 0,

			showDialogAdd: false,
			isAdding: false,
			addErrorString: null,
			addItem: {},

			showDialogEdit: false,
			editItem: {},
			isEditing: false,
			editErrorString: null,
			editItemBackup: null,

			showDialogRemove: false,
			showDialogRemoveId: null,

			loadingLabel: 'Loading...',
		}
	},
	watch: {
		listPath: function() {
			this.setListPath(this.listPath);
		},
		extraApiParams: {
			deep: true,
			handler() {
				this.onRequest({
					pagination: this.pagination,
				});
			}
		},
	},
	computed: {
		hasFiltersSlot() {
			// has filters slot defined on parent component, so we know if to show filters button
			return !!this.$slots.filters;
		}
	},
	components: {
		DataFilters,
	},
	methods: {
		filtersChanged(filters) {
			this.filters = filters;
			this.onRequest({
				pagination: this.pagination,
			});

			this.recalculateFiltersCount();

			// let activeFiltersCount = 0;
			// if (filters) {
			// 	for (let k in filters) {
			// 		if (filters[k] !== undefined && (!Array.isArray(filters[k]) || filters[k].length)) {
			// 			activeFiltersCount++;
			// 		}
			// 		if (Array.isArray(filters[k]) && !filters[k].length) {
			// 			filters[k] = undefined;
			// 		}
			// 	}
			// }

			// this.activeFiltersCount = activeFiltersCount;
		},
		recalculateFiltersCount() {
			let activeFiltersCount = 0;
			if (this.filters) {
				for (let k in this.filters) {
					if (this.filters[k] !== undefined && (!Array.isArray(this.filters[k]) || this.filters[k].length)) {
						activeFiltersCount++;
					}
					if (Array.isArray(this.filters[k]) && !this.filters[k].length) {
						this.filters[k] = undefined;
					}
				}
			}

			this.activeFiltersCount = activeFiltersCount;
		},
		onShowFilters() {
			this.$refs.dataFilters.show();
		},
		setListPath(path) {
			this.collection.setListPath(path);
			this.onRequest({
				pagination: this.pagination,
			});
		},
		extraActionEvent(eventName, key, params) {
			this.$emit(eventName, key, params);
		},
		cellEvent(eventName, key, params) {
			this.$emit(eventName, key, params);
			// console.error(eventName, key, params);
		},
		appendPopulateToOptions(options) {
			let populate = [];
			for (let column of this.columns) {
				if (column.populate) {
					populate.push(column.field);
				}
			}

			if (populate.length) {
				options.populate = populate;
			}
		},
		showAdd() {
			this.addItem = this.collection.new();
			this.addErrorString = null;

			this.showDialogAdd = true;
		},
		async commitAdd() {
			this.isAdding = true;
			this.addErrorString = null;

			const options = {};
			this.appendPopulateToOptions(options);

			try {
				let savedOnServer = await this.addItem.save(options);

				if (savedOnServer) {
					this.rows.unshift(this.addItem);
					this.showDialogAdd = false;
					this.$q.notify('Item has been added');
				}
			} catch(e) {
				let errorMessage = '';
				if (e.response && e.response.data && e.response.data.message) {
					errorMessage = e.response.data.message;
				} else {
					errorMessage = 'Can not add item';
				}

				this.addErrorString = errorMessage;

				clearTimeout(this.__clearAddErrorStringTimeout);
				this.__clearAddErrorStringTimeout = setTimeout(()=>{
					this.addErrorString = null;
				}, 2000);
			}

			this.isAdding = false;
		},
		showRemove(id) {
			if (id) {
				this.selected = [];
			}

			this.showDialogRemove = true;
			this.showDialogRemoveId = id;
		},
		async commitDelete() {
			this.loading = true;

			let success = false;

			try {

				if (this.selected.length) {
					console.error(this.selected);

					let removed = [];
					success = true;
					for (let item of this.selected) {
						// const item = this.rows[index];

						if (success) {
							// console.log('removeing', item, index);
							success = await item.delete();
							if (success) {
								removed.push(item);
							}
						}
					}

					if (success) {
						for (let removedItem of removed) {
							this.rows.splice(this.rows.findIndex((row)=>{ return row._id == removedItem._id; }), 1);
						}

						if (success) {
							this.$q.notify(''+this.selected.length+ ' item'+(this.selected.length > 1 ? 's have' : ' has')+' been removed');
						}

						this.selected = [];
					}

				} else {
					let item = null;
					let index = null;

					for (let i = 0; i < this.rows.length; i++) {
						if (this.rows[i]._id == this.showDialogRemoveId) {
							item = this.rows[i];
							index = i;
						}
					}

					success = await item.delete();
					this.rows.splice(index, 1);

					if (success) {
						this.$q.notify('Item has been removed');
					}
				}

			} catch(e) {
				this.$q.notify('Something is wrong while removing it. Please check console for details');
				console.error(e);
			}


			if (success) {

				this.onRequest({
					pagination: this.pagination,
				});
			}
			this.loading = false;
		},
		showEdit(row) {
			this.showDialogEdit = true;

			this.editItem = row;
			this.editItemBackup = JSON.parse(JSON.stringify(this.editItem));
		},
		cancelEdit: function() {
			Object.assign(this.editItem, this.editItemBackup);
			this.showDialogEdit = false;
		},
		commitEdit: async function() {
			this.isEditing = true;
			this.editErrorString = null;

			const options = {};
			this.appendPopulateToOptions(options);

			try {
				const success = await this.editItem.save(options);

				// let savedOnServer = await this.collection.edit(this.editItem, options);

				if (success) {
					// Object.assign(this.editItem, savedOnServer);

					console.error('saved', this.editItem);

					this.showDialogEdit = false;
					this.$q.notify('Item has been updated');
				}
			} catch(e) {
				let errorMessage = '';
				if (e.response && e.response.data && e.response.data.message) {
					errorMessage = e.response.data.message;
				} else {
					errorMessage = 'Can not edit item';
				}

				this.editErrorString = errorMessage;

				clearTimeout(this.__clearEditErrorStringTimeout);
				this.__clearEditErrorStringTimeout = setTimeout(()=>{
					this.editErrorString = null;
				}, 2000);
			}

			this.isEditing = false;
		},
		copyToClipboard(value) {
			copyToClipboard(value);
			this.$q.notify(''+value+' copied to clipboard');
		},
		async nextPage() {
			const { page, rowsPerPage, rowsNumber } = this.pagination;
			if (page * rowsPerPage > rowsNumber) { // page is 1... here
				return false;
			}

			return await this.onRequest({
				pagination: Object.assign({}, this.pagination, {page: (page+1)}),
			});
		},
		async prevPage() {
			const { page } = this.pagination;
			if (page <= 1) { // page is 1... here
				return false;
			}

			return await this.onRequest({
				pagination: Object.assign({}, this.pagination, {page: (page-1)}),
			});
		},
		async onRequest (props) {
			const { page, rowsPerPage, sortBy, descending } = props.pagination;
			this.loading = true;

			try {
				const options = {
					offset: (page-1) * rowsPerPage,
					limit: rowsPerPage,
					sort: '_id',
				};
				this.appendPopulateToOptions(options);

				// find field by its name
				for (let column of this.columns) {
					if (column.name == sortBy) {
						const fieldName = column.field;
						options.sort = fieldName;
						if (descending) {
							options.sort = '-'+options.sort;
						}
					}
				}

				if (this.search) {
					options.search = this.search;
				}

				if (this.filters) {
					options.where = this.filters;
				}

				if (this.extraApiParams) {
					Object.assign(options, this.extraApiParams);
				}

				const resp = await this.collection.list(options);

				this.rows.splice(0, this.rows.length, ...resp.items);

				this.pagination.rowsNumber = resp.total;
				this.pagination.page = page;
				this.pagination.rowsPerPage = rowsPerPage;
				this.pagination.sortBy = sortBy;
				this.pagination.descending = descending;

				this.loading = false;
				this.loadingLabel = 'Loading...';
			} catch(e) {
				console.error(e);
				this.loadingLabel = 'Error loading data';
			}

			return true;
		},
	},
	beforeMount: function() {
		this.columns = this.form.data().columns;
		this.collectionName = this.form.data().collectionName;

		this.pagination.sortBy = this.defaultSortBy;
		this.pagination.descending = this.defaultSortDescending;

		if (this.defaultFilters) {
			this.filters = this.defaultFilters;
			this.recalculateFiltersCount();

			if (this.activeFiltersCount) {
				// highlight filters button for a second to let user know we have pre-defined filters
				setTimeout(()=>{
					this.filtersButtonColor = 'positive';
					setTimeout(()=>{
						this.filtersButtonColor = null;
					}, 1000);
				}, 1000);
			}
		}
	},
	mounted: async function() {
		this.collection = await this.$store.api.collection(this.collectionName);
		if (this.listPath) {
			this.collection.setListPath(this.listPath);
		}
		this.onRequest({
			pagination: this.pagination,
		});
	}
}
</script>
