<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Common Message Tags</h5>

				<q-form class="q-gutter-md q-pt-sm">
					<q-input
						filled
						v-model="settings.siteName"
						label="Site Name - %siteName%"
						hint="Site Name"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<q-input
						filled
						v-model="settings.siteURL"
						label="Site URL - %siteURL%"
						hint="Site URL"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<div>
						<template v-for="item in settings.extra" v-bind:key="item.id">
							<div class="row q-gutter-md">
								<div class="col">
									<q-input
										filled
										v-model="item.name"
										label="Tag Name"
										hint="Tag Name"
										lazy-rules
										:rules="[ val => val && val.length > 0 || 'Please type something']"
									/>
								</div>
								<div class="col">
									<q-input
										filled
										v-model="item.value"
										label="Tag Value"
										hint="Tag Value"
										lazy-rules
										:rules="[ val => val && val.length > 0 || 'Please type something']"
									/>
								</div>
							</div>
						</template>


					</div>

					<div>
						<q-btn size="sm" color="secondary" @click="onAddTag" icon="add" label="Add Tag" />
					</div>

					<q-btn label="Save" color="primary" unelevated  @click="save"  :disable="!hasUnsaved" :loading="isSaving" />

				</q-form>

			</div>
			<div class="col-12 col-md-6">

			</div>
		</div>


	</div>

</template>

<script>


//
export default {
	name: 'Common Message Tags',
	title: 'Common Message Tags',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/email_tags',
	dynamic: true, // lazy loaded
	components: {
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			settings: {
				siteName: '',
				siteURL: '',
				extra: [],
			},
			hasUnsaved: false,
			isSaving: false,
		}
	},
	watch: {
		settings: {
			deep: true,
			handler() {
				this.hasUnsaved = true;
			}
		},
	},
	methods: {
		onAddTag() {
			this.settings.extra.push({
				id: this.settings.extra.length,
				name: '',
				value: '',
			});
		},
		async save() {
			this.isSaving = true;

			const settings = {...this.settings};
			const settingsExtra = {...settings.extra};

			const commonTags = {};
			commonTags.siteName  = this.settings.siteName;
			commonTags.siteURL = this.settings.siteURL;

			for (let key in settingsExtra) {
				const item = settingsExtra[key];
				if (item.name) {
					commonTags[item.name] = item.value;
				}
			}

			this.$store.settings.set('messageCommonTags', commonTags);

			await this.$store.settings.persist();

			this.$q.notify({
				message: 'Saved. Try to check how email/notifications messages look with new tags.',
				color: 'positive'
			});

			this.hasUnsaved = false;
			this.isSaving = false;
		},
		async load() {
			const commonTags = await this.$store.settings.get('messageCommonTags');
			this.settings.siteName = commonTags.siteName || '';
			this.settings.siteURL = commonTags.siteURL || '';

			for (let key in commonTags) {
				if (key != 'siteName' && key != 'siteURL') {
					this.settings.extra.push({
						id: this.settings.extra.length,
						name: key,
						value: commonTags[key],
					});
				}
			}

			this.$nextTick(()=>{
				this.hasUnsaved = false;
			});
			// const settings = {...this.settings};
			// for (let key in settings) {
			// 	this.settings[key] = await this.$store.settings.get(key);
			// }
		}
	},
	async mounted() {
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

