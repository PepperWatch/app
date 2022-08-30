<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Email Settings</h5>

				<q-form class="q-gutter-md q-pt-sm">
					<q-input
						filled
						v-model="settings.smtpHost"
						label="SMTP Host"
						hint="SMTP Host"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<q-input
						filled
						v-model="settings.smtpPort"
						label="SMTP Port"
						hint="SMTP Port"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<div>
						<q-checkbox v-model="settings.smtpSecure" color="secondary" label="TLS Secure" />
					</div>

					<q-input
						filled
						v-model="settings.smtpUsername"
						label="SMTP Username"
						hint="SMTP Username"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<q-input
						filled
						v-model="settings.smtpPassword"
						label="SMTP Password"
						hint="SMTP Password"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<q-input
						filled
						v-model="settings.smtpDefaultFrom"
						label="Default FROM field"
						hint="Default FROM field"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<q-input
						filled
						v-model="settings.contactEmail"
						label="Contact Us Email"
						hint="Contact Us Email"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<Textarea
						v-model="settings.mailDefaultTemplate"
						label="Common Email Template"
						hint="Common Email Template. Include %content% tag in the place you want content to apear"
						:extraButtons="[{
							tip: 'Show Tags',
							icon: 'tag',
							label: '',
							handler: ()=>{ this.showTagsDialog = true },
						}]"
					/>

					<q-dialog v-model="showTagsDialog" position="right">
						<q-card style="width: 30vh;">
							<q-card-section class="row items-center q-pb-none">
								<div class="text-h6">Available Tags</div>
								<q-space />
								<q-btn icon="close" flat round dense v-close-popup />
							</q-card-section>

							<q-card-section style="max-height: 50vh">
								<template v-for="tag in availableTags" v-bind:key="tag">
									<div>
										<span @click="copyToClipboard('%'+tag+'%')" class="cursor-pointer">%{{ tag }}%</span>

									</div>
								</template>
							</q-card-section>
						</q-card>
					</q-dialog>

					<q-btn label="Save" color="primary" unelevated  @click="save" :loading="isSaving" :disable="!hasUnsaved"  />

				</q-form>

			</div>
			<div class="col-12 col-md-6">
					<h5 class="text-primary">Send Test Message</h5>

					<q-form class="q-gutter-md q-pt-sm">

					<q-input
						filled
						v-model="testEmail"
						label="Email Address"
						hint="Email Address"
						lazy-rules
						:rules="[ val => val && val.length > 0 || 'Please type something']"
					/>

					<q-btn label="Send Test Email" color="primary" unelevated  @click="test" :loading="isTesting" />

					<div class="q-pt-sm">
						<span v-html="testResults"></span>
					</div>

					</q-form>

			</div>
		</div>


	</div>

</template>

<script>


import { copyToClipboard } from 'quasar';
import Textarea from 'shared/components/Helpers/Textarea';
//
export default {
	name: 'Email Settings',
	title: 'Email Settings',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/email_settings',
	dynamic: true, // lazy loaded
	components: {
		Textarea,
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			settings: {
				smtpHost: '',
				smtpPort: '',
				smtpSecure: false,
				smtpUsername: '',
				smtpPassword: '',
				smtpDefaultFrom: '',
				contactEmail: '',
				mailDefaultTemplate: '',
			},
			hasUnsaved: false,
			isSaving: false,
			isTesting: false,
			testEmail: '',
			testResults: '',

			showTagsDialog: false,
			availableTags: [],
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
		copyToClipboard(value) {
			copyToClipboard(value);
			this.$q.notify(''+value+' copied to clipboard');
		},
		async test() {
			this.isTesting = true;

			try {
				const resp = await this.$store.api.post({
					path: 'api/email/test',
					data: {
						email: this.testEmail,
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
		async save() {
			this.isSaving = true;

			try {
				const settings = {...this.settings};
				for (let key in settings) {
					this.$store.settings.set(key, this.settings[key]);
				}

				await this.$store.settings.persist();
			} catch(e) {

				this.$q.notify({
					message: (e.response?.data?.message ? e.response.data.message : (''+e)),
					color: 'negative'
				});
			}

			this.hasUnsaved = false;
			this.isSaving = false;

			this.$q.notify({
				message: 'Saved. Do not forget to check how sending email works.',
				color: 'positive'
			});
		},
		async load() {
			const settings = {...this.settings};
			for (let key in settings) {
				const loaded =  await this.$store.settings.get(key);
				if (loaded) {
					this.settings[key] = loaded;
				}
			}

			this.$nextTick(()=>{
				this.hasUnsaved = false;
			});
		}
	},
	async mounted() {
		this.load();

		const commonTags = await this.$store.settings.get('messageCommonTags');
		const tags = [];
		tags.push('content');
		for (let key in commonTags) {
			tags.push(key);
		}

		this.availableTags = tags;
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

