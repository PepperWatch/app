<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Recaptcha Settings</h5>


				<q-form class="q-gutter-md q-pt-sm">

					<q-input
						filled
						v-model="settings.recaptchaSiteKey"
						label="Recaptcha v3 Site Key"
					/>

					<q-input
						filled
						v-model="settings.recaptchaSecretKey"
						label="Recaptcha v3 Secret Key"
					/>

					<q-field
						label="Minimum ReCaptcha v3 score to pass" stack-label
						:hint="`1.0 is very likely a good interaction, 0.0 is very likely a bot`">
						<template v-slot:control>
								<q-slider
									v-model="settings.recaptchaMinimumScore"
									color="secondary"
									markers
									snap
									:min="0"
									:max="1"
									:step="0.01"
									label
								/>
						</template>
					</q-field>

					<q-btn label="Save" color="primary" unelevated  @click="save" :loading="isSaving"  :disable="!hasUnsaved" />

				</q-form>

			</div>
			<div class="col">
					<h5 class="text-primary">Test Captcha</h5>

					<q-form class="q-gutter-md q-pt-sm">

						<q-btn label="Test" color="primary" unelevated  @click="test" :loading="isTesting" />

						<div class="q-pt-sm">
							<span v-html="testResults"></span>
						</div>

					</q-form>

			</div>
		</div>

		<ReCaptcha ref="captcha" />
	</div>

</template>

<script>

import ReCaptcha from 'shared/components/Services/ReCaptcha';

export default {
	name: 'Recaptcha Settings',
	title: 'Recaptcha Settings',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/settings_recaptcha',
	dynamic: true, // lazy loaded
	components: {
		ReCaptcha,
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			settings: {
				recaptchaSiteKey: '',
				recaptchaSecretKey: '',
				recaptchaMinimumScore: '',
			},
			hasUnsaved: false,
			isSaving: false,

			group: null,
			options: [
			],

			isTesting: false,
			testResults: '',
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
		async test() {
			this.isTesting = true;

			try {
				const captchaToken = await this.$refs.captcha.token('test');

				const resp = await this.$store.api.post({
					path: 'api/settings/testcaptcha',
					data: {
						captcha: captchaToken,
					}});

				if (resp && resp.results) {
					this.testResults = JSON.stringify(resp.results, null, 2);
				} else {
					this.testResults = 'error';
				}
			} catch(e) {
				this.testResults = 'error: '+e;
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

				this.$q.notify({
					message: 'Saved. Do not forget to check how signing in and restoring password work with new settings.',
					color: 'positive'
				});

			} catch(e) {

				this.$q.notify({
					message: (e.response?.data?.message ? e.response.data.message : (''+e)),
					color: 'negative'
				});
			}

			this.hasUnsaved = false;
			this.isSaving = false;
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

