<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Sign In With Google Settings</h5>


				<q-form class="q-gutter-md q-pt-sm">

					<q-input
						filled
						v-model="settings.signInWithGoogleClientId"
						label="Google oAuth Client ID"
					/>

					<q-input
						filled
						v-model="settings.signInWithGoogleClientSecret"
						label="Google oAuth Client Secret"
					/>

					<q-btn label="Save" color="primary" unelevated  @click="save" :loading="isSaving"  :disable="!hasUnsaved" />

				</q-form>

			</div>
			<div class="col">

				<h5 class="text-primary">&nbsp;</h5>

				<div class="q-pt-sm q-pb-md text-overline">You can get OAuth 2.0 Client ID from Google <a href="https://console.cloud.google.com/apis/credentials" target="_blank">here</a>.</div>

			</div>
		</div>

		<ReCaptcha ref="captcha" />
	</div>

</template>

<script>


export default {
	name: 'Sign In With Google Settings',
	title: 'Sign In With Google Settings',
	authRequired: true,
	requiredAuthLevel: 'superadmin',
	path: '/settings_signgoogle',
	dynamic: true, // lazy loaded
	components: {
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			settings: {
				signInWithGoogleClientId: '',
				signInWithGoogleClientSecret: '',
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
		async save() {
			this.isSaving = true;

			try {
				const settings = {...this.settings};
				for (let key in settings) {
					this.$store.settings.set(key, this.settings[key]);
				}

				await this.$store.settings.persist();

				this.$q.notify({
					message: 'Saved. Do not forget to check how signing in work with new settings.',
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

