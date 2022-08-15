<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Slack Settings</h5>

				<q-list bordered class="rounded-borders">
					<q-item-label header>Channels <q-btn label="Add" size="sm" color="primary" unelevated  @click="add" /></q-item-label>

					<template v-for="item in channels" v-bind:key="item.id">
						<q-item>
							<q-item-section top class="col-8">
								<q-item-label class="q-mt-sm">{{ item.id }}</q-item-label>
							</q-item-section>

							<q-item-section top>
							</q-item-section>

							<q-item-section top side>
								<div class="text-grey-8 q-gutter-xs">
									<q-btn class="gt-xs" size="12px" flat dense round icon="edit" @click="edit(item.id)"/>
									<q-btn class="gt-xs" size="12px" flat dense round icon="delete" @click="remove(item.id)" />
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
							<span><strong>&nbsp;Are you sure that you want to remove this channel?</strong></span>
						</q-card-section>

						<q-card-actions align="right">
							<q-btn label="Cancel" color="secondary" text-color="dark" v-close-popup unelevated />
							<q-btn label="Yes, Remove" color="negative" text-color="dark"  v-close-popup unelevated @click="commitRemove" />
						</q-card-actions>
					</q-card>
				</q-dialog>

			</div>
			<div class="col-12 col-md-6">
				<div v-if="selectedChannel">
					<h5 class="text-primary">Channel Settings</h5>

					<q-form class="q-gutter-md q-pt-sm">

						<q-input
							filled
							v-model="selectedChannel.id"
							label="Channel Id"
							hint="Unique id to use in our code"
						/>

						<q-input
							filled
							v-model="selectedChannel.slackId"
							label="Slack Id"
							hint="Something like C01DDJVHG22, open slack channel in browser and get it from the URL"
						/>

						<q-input
							filled
							v-model="selectedChannel.token"
							label="Slack Bot Auth Token"
							hint="A token usually begins with xoxb or xoxp. Don't forget to add an app to the channel (click on name -> Integrations -> Add App)"
						/>

					</q-form>

					<h5 class="text-primary q-pt-lg q-mb-none">Send Test Message</h5>

					<q-form class="q-gutter-md q-pt-sm">

						<DataSelect collectionName="notification_templates" nameProperty="name" v-model="selectedTestTemplate" label="Template"/>

						<q-btn label="Send Test Message" color="primary" unelevated  @click="test" :loading="isTesting" />

						<div class="q-pt-sm">
							<span v-html="testResults"></span>
						</div>

					</q-form>

				</div>
			</div>

		</div>

	</div>

</template>

<script>


import DataSelect from 'shared/components/Helpers/DataSelect.vue';

export default {
	name: 'Slack Settings',
	title: 'Slack Settings',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/settings_slack',
	components: {
		DataSelect,
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			selectedChannel: null,
			showDialogRemove: false,
			showDialogRemoveId: null,
			channels: [
			],
			hasUnsaved: false,
			isSaving: false,

			selectedTestTemplate: null,
			isTesting: false,
			testResults: '',
		}
	},
	watch: {
		selectedChannel: {
			deep: true,
			handler() {
				this.hasUnsaved = true;
			}
		},
	},
	methods: {
		async test() {
			this.isTesting = true;

			this.testResults = '';
			try {
				const resp = await this.$store.api.post({
					path: 'api/slack/test',
					data: {
						channel: this.selectedChannel.id,
						template: this.selectedTestTemplate,
					}});

				if (resp && resp.dataOk && resp.dataOk.length) {
					this.testResults = resp.dataOk.join('<br>');
				}

				if (resp && resp.dataErr && resp.dataErr.length) {
					this.testResults = resp.dataErr.join('<br>');
				}
			} catch(e) {

				this.$q.notify({
					message: (e.response?.data?.message ? e.response.data.message : (''+e)),
					color: 'negative'
				});
			}

			this.isTesting = false;
		},
		onClick() {
		},
		remove(id) {
			this.showDialogRemove = true;
			this.showDialogRemoveId = id;

			this.hasUnsaved = true;
		},
		commitRemove() {
			this.channels = this.channels.filter((item)=>(item.id != this.showDialogRemoveId));

			this.hasUnsaved = true;
		},
		add() {
			let id = 'untitled';
			let suffix = 1;
			while (this.channels.find((item)=>(item.id == id))) {
				id = 'untitled-'+suffix;
				suffix++;
			}

			const toAdd = {
				name: '',
				id: id,
			};

			this.channels.push(toAdd);
			this.selectedChannel = toAdd;

			this.hasUnsaved = true;
		},
		edit(id) {
			const wasUnsaved = this.hasUnsaved;
			this.selectedChannel = this.channels.find((item)=>(item.id == id));

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
			for (let channel of this.channels) {
				if (channel.id && channel.slackId) {
					data.push({...channel});
				}
			}

			this.$store.settings.set('slackChannels', data);
			await this.$store.settings.persist();

			this.hasUnsaved = false;
			this.isSaving = false;
		},
		async load() {
			const loaded =  await this.$store.settings.get('slackChannels');
			this.channels = loaded;

			if (!this.channels) {
				this.channels = [];
			}
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

