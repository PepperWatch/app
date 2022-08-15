<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-6">
				<h5 class="text-primary">Profile Settings</h5>

				<q-form class="q-gutter-md q-pt-sm">

					<TimezoneSelect v-model="profileSettings.timezone" label="Timezone" hint="Your timezone" />

					<q-btn label="Save" color="primary" unelevated  @click="save"  :disable="!hasUnsaved" :loading="isSaving" />

				</q-form>

			</div>
			<div class="col-12 col-md-6">
				<h5 class="text-primary">&nbsp;</h5>

				<div class="q-pt-lg q-pb-sm text-overline">Current time: <DateHuman :value="previewDate" /></div>


				<div class="q-pt-sm q-pb-md text-overline">Note to Developers: Please use DateHuman component to display dates with respect to user's timezone.
				And DateSelect component to get date and date-range for database filtering etc, where timezone is important.</div>

				<div class="q-pb-sm text-overline">Select date:
					<q-btn icon="event" round color="primary" size="sm">
						<DateSelect v-model="previewSelected" />
					</q-btn>

					<div v-if="previewSelected">
						Selected: {{ previewSelected }}<br>
					</div>
				</div>

				<div class="q-pb-sm text-overline">Select date range:
					<q-btn icon="event" round color="primary" size="sm">
						<DateSelect v-model="previewRange" range />
					</q-btn>

					<div v-if="previewRange.from">
						From: {{ previewRange.from }}<br>
						To: {{ previewRange.to }}<br>
					</div>
				</div>


			</div>
		</div>


	</div>

</template>

<script>

import TimezoneSelect from 'shared/components/Helpers/TimezoneSelect';
import DateSelect from 'shared/components/Helpers/DateSelect';
import DateHuman from 'shared/components/Helpers/DateHuman';

//
export default {
	name: 'Profile',
	title: 'Profile',
	authRequired: true,
	requiredAuthLevel: 'user',
	path: '/profile',
	components: {
		TimezoneSelect,
		DateSelect,
		DateHuman,
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			isSaving: false,
			hasUnsaved: false,

			profileSettings: {
				timezone: null,
			},

			previewDate: null,

			proxyDate: null,
			date: null,

			previewRange: {
				from: null,
				to: null,
			},
			previewSelected: null,

			previewInputModel: null,
			previewInputModelAsString: null,
		}
	},
	watch: {
		profileSettings: {
			deep: true,
			handler() {
				this.hasUnsaved = true;
			}
		},
	},
	methods: {
		async save() {
			this.isSaving = true;

			for (let k in this.profileSettings) {
				this.$store.sessionUser.setProfileSetting(k, this.profileSettings[k]);
			}

			this.$store.sessionUser.persistProfileSettings();

			this.hasUnsaved = false;
			this.isSaving = false;
		},
	},
	async mounted() {
		this.profileSettings = {...this.$store.sessionUser.profileSettings};
		this.previewDate = new Date();

		this.$nextTick(()=>{
			this.hasUnsaved = false;
		});

		this.__timeInterval = setInterval(()=>{
			this.previewDate = new Date();
		}, 1000);
	},
	beforeUnmount() {
		clearInterval(this.__timeInterval);
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

