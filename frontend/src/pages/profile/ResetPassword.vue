<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-4">
			</div>
			<div class="col-12 col-md-4">
				<h5 class="text-primary text-center">Reset Password</h5>

				<q-banner inline-actions rounded class="bg-primary text-white" v-if="!code">
					Reset password code is required
				</q-banner>

				<q-banner inline-actions rounded class="bg-primary text-white" v-if="isSaved" @click="$store.sessionUser.doSignIn()">
					Password has been changed. You can sign in now.
					<template v-slot:action>
						<q-btn flat color="white" label="Sign In" />
					</template>
				</q-banner>

				<q-form class="q-gutter-md q-pt-sm" v-if="code && !isSaved" @submit="save">
					<q-input
						filled
						v-model="code"
						label="Reset Password Code"
						disable
						:error="codeError"
						error-message="Invalid or Expired Reset Code"
					/>

					<q-input
						type="password"
						filled
						v-model="password"
						label="New Password"
						:error="passwordError"
						:error-message="passwordErrorMessage"
					/>

					<q-input
						type="password"
						filled
						v-model="confirmPassword"
						label="Confirm Password"
						:error="confirmError"
						:error-message="confirmErrorMessage"
					/>

					<q-btn type="submit" label="Set New Password" color="primary" unelevated  :loading="isSaving" />

				</q-form>

			</div>
			<div class="col-12 col-md-4">
			</div>
		</div>

	</div>

</template>

<script>


//
export default {
	name: 'Reset Password',
	title: 'Reset Password',
	authRequired: false,
	path: '/reset_password/:code',
	components: {
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			code: null,
			password: '',
			confirmPassword: '',

			codeError: false,

			confirmError: false,
			confirmErrorMessage: '',

			passwordError: false,
			passwordErrorMessage: '',


			isSaving: false,
			isSaved: false,
		}
	},
	methods: {
		async save() {
			this.isSaving = true;

			this.codeError = false;
			this.confirmError = false;
			this.passwordError = false;

			if (this.password != this.confirmPassword) {
				this.confirmError = true;
				this.confirmErrorMessage = 'Password mismatch';
			}

			if (!this.password || this.password.length < 6) {
				this.passwordError = true;
				this.passwordErrorMessage = 'Password is too short';
			}

			if (!this.confirmError && !this.passwordError) {

				const resetResponse = await this.$store.api.post({path: '/auth/reset/new', data: {
					code: this.code,
					password: this.password,
				}});

				if (resetResponse && resetResponse.success) {
					this.isSaved = true;
				} else {
					this.codeError = true;
				}

			}

			this.isSaving = false;
		},
	},
	async mounted() {
		this.code = this.$route.params.code || null;
	},
}
</script>
<style scoped>

</style>

