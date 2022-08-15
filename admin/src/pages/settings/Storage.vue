<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Storage Settings</h5>

				<q-list bordered class="rounded-borders">
					<q-item-label header>Buckets <q-btn label="Add" size="sm" color="primary" unelevated  @click="add" /></q-item-label>

					<template v-for="item in buckets" v-bind:key="item.id">
						<q-item>
							<q-item-section top class="col-8">
								<q-item-label class="q-mt-sm">{{ item.id }}</q-item-label>
							</q-item-section>

							<q-item-section top>
							</q-item-section>

							<q-item-section top side>
								<div class="text-grey-8 q-gutter-xs">
									<q-btn class="gt-xs" size="12px" flat dense round icon="search" @click="onClick(item)"/>
									<q-btn class="gt-xs" size="12px" flat dense round icon="edit" @click="edit(item.id)"/>
									<q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="remove(item.id)" :disable="item.id == 'default'" />
								</div>
							</q-item-section>
						</q-item>
					</template>
				</q-list>

				<div class="q-pt-md ">
					<q-btn label="Save" color="primary" unelevated  @click="save" :loading="isSaving" :disable="!hasUnsaved" />
				</div>

				<q-dialog v-model="showDialogRemove">
					<q-card  class="text-negative">
						<q-card-section class="row items-center" >
							<q-avatar icon="delete" color="negative"  text-color="primary"  />
							<span><strong>&nbsp;Are you sure that you want to remove this bucket?</strong></span>
						</q-card-section>

						<q-card-actions align="right">
							<q-btn label="Cancel" color="secondary" text-color="dark" v-close-popup unelevated />
							<q-btn label="Yes, Remove" color="negative" text-color="dark"  v-close-popup unelevated @click="commitRemove" />
						</q-card-actions>
					</q-card>
				</q-dialog>

			</div>
			<div class="col-12 col-md-6">
				<div v-if="selectedBucket">
					<h5 class="text-primary">Bucket Settings</h5>

					<q-form class="q-gutter-md q-pt-sm">

						<q-banner rounded class="bg-secondary text-white" v-if="selectedBucket.id == 'default'">
							Default is the bucket you use for uploading public files (WYSIWYG editor etc). Usually it's S3 bucket with public URLs.
						</q-banner>

						<q-input
							filled
							v-model="selectedBucket.id"
							:disable="selectedBucket.id == 'default'"
							label="Bucket Id"
						/>

						<q-input
							filled
							v-model="selectedBucket.name"
							label="Bucket Name"
						/>

						<q-input
							filled
							v-model="selectedBucket.region"
							label="region"
						/>

						<q-input
							filled
							v-model="selectedBucket.accessKey"
							label="accessKey"
						/>

						<q-input
							filled
							v-model="selectedBucket.secretKey"
							label="secretKey"
						/>

						<q-input
							filled
							v-model="selectedBucket.endPoint"
							label="endPoint"
						/>

						<div>
							<q-checkbox v-model="selectedBucket.isPublic" color="secondary" label="Is Public - Visible By Public URLs Outside"/>
						</div>

						<q-input
							filled
							v-model="selectedBucket.domain"
							label="domain"
						/>


						<q-field
							label="LIST - Access Level" stack-label
							:hint="`User access level`">

							<q-option-group v-model="selectedBucket.levelToList" :options="possibleLevels.map((s)=>({label: s, value: s}))" color="secondary" inline />
						</q-field>

						<q-field
							label="GET - Access Level" stack-label
							:hint="`User access level to download item from the bucket`">

							<q-option-group v-model="selectedBucket.levelToGet" :options="possibleLevels.map((s)=>({label: s, value: s}))" color="secondary" inline />
						</q-field>

						<q-field
							label="PUT - Access Level" stack-label
							:hint="`User access level to put item into the bucket`">

							<q-option-group v-model="selectedBucket.levelToPut" :options="possibleLevels.map((s)=>({label: s, value: s}))" color="secondary" inline />
						</q-field>

					</q-form>

				</div>
			</div>

		</div>

	</div>

</template>

<script>


export default {
	name: 'Storage Settings',
	title: 'Storage Settings',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/settings_storage',
	dynamic: true, // lazy loaded
	components: {
	},
	props: {
	},
	data() {
		return {
			possibleLevels: [], // get from sessionUser store
			isActive: false,
			selectedBucket: null,
			showDialogRemove: false,
			showDialogRemoveId: null,
			buckets: [
			],
			hasUnsaved: false,
			isSaving: false,
		}
	},
	watch: {
		selectedBucket: {
			deep: true,
			handler() {
				this.hasUnsaved = true;
			}
		},
	},
	methods: {
		onClick(item) {
			this.$router.push({path: '/browse/'+item.id});
		},
		remove(id) {
			this.showDialogRemove = true;
			this.showDialogRemoveId = id;

			this.hasUnsaved = true;
		},
		commitRemove() {
			this.buckets = this.buckets.filter((item)=>(item.id != this.showDialogRemoveId));

			this.hasUnsaved = true;
		},
		add() {
			let id = 'untitled';
			let suffix = 1;
			while (this.buckets.find((item)=>(item.id == id))) {
				id = 'untitled-'+suffix;
				suffix++;
			}

			this.buckets.push({
				name: '',
				id: id,
			});

			this.hasUnsaved = true;
		},
		edit(id) {
			const wasUnsaved = this.hasUnsaved;
			this.selectedBucket = this.buckets.find((item)=>(item.id == id));

			this.$nextTick(()=>{
				if (!wasUnsaved) {
					// catch the change by watcher just because editing different item, but without change in it
					this.hasUnsaved = false;
				}
			});
		},
		async save() {
			this.isSaving = true;

			const data = [];
			for (let bucket of this.buckets) {
				if (bucket.id && bucket.name) {
					data.push({...bucket});
				}
			}

			this.$store.settings.set('storage', data);
			await this.$store.settings.persist();

			this.hasUnsaved = false;
			this.isSaving = false;
		},
		async load() {
			const loaded =  await this.$store.settings.get('storage');
			this.buckets = loaded;

			if (!this.buckets) {
				this.buckets = [];
			}
		}
	},
	async mounted() {
		this.possibleLevels = this.$store.sessionUser.possibleLevels;
		this.load();
	},
	beforeRouteLeave (to, from, next) {
		if (!this.hasUnsaved) {
			return next();
		}

		this.$q.dialog({
			title: 'Confirm',
			message: 'Do you really want to leave? you have unsaved changes!',
			cancel: true,
			}).onOk(() => {
				next();
			}).onCancel(() => {
				next(false);
			}).onDismiss(() => {
				next(false);
			});
	},
}
</script>
<style scoped>

</style>

