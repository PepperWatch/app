<template>
	<q-dialog ref="dialog" @hide="onDialogHide"> <!-- persistent -->
		<q-card class="q-dialog-plugin">

			<q-form @submit="onRegisterSubmit" class="q-pa-lg" v-if="registration && !isRegistered">

				<q-input ref="initialRegistrationFocus" v-model="registrationEmail" label="Email" stack-label :disable="isLoading" :error="!!hasErrorRegistration.email" :error-message="hasErrorRegistration.email"/>

				<q-input v-model="registrationUsername" autocomplete="username" label="Username" stack-label :disable="isLoading" :error="!!hasErrorRegistration.username" :error-message="hasErrorRegistration.username"/>

				<q-input autocomplete="new-password" v-model="registrationPassword" type="password" label="Password" stack-label :disable="isLoading" :error="!!hasErrorRegistration.password" :error-message="hasErrorRegistration.password"/>

				<!-- buttons example -->
				<div class="q-pt-md q-pb-sm text-center">
					<q-btn label="Sign Up" type="submit" color="primary" ripple no-caps unelevated :loading="isLoading" style="width: 100%"/>
				</div>

				<div v-if="!signInWithGoogleDisabled">
					<div class="text-center">
						or
					</div>

					<div class="q-pt-sm q-pb-sm row">
						<SignInWithGoogle @signedin="onSignedInByProvider" />
					</div>
				</div>

				<div class="text-center">
					already registered?
				</div>

				<div class="q-pt-sm row">
					<q-btn label="Log In" type="button" @click="backToSignIn" color="primary" ripple no-caps outline style="width: 100%" :disable="isLoading"/>
				</div>

			</q-form>

			<div v-if="registration && isRegistered" class="q-pa-lg">
				Welcome! Check your email and locate the confirmation email. Follow the steps in the email to confirm your email address.

				<!-- buttons example -->
				<div class="q-pt-md">
					<q-btn label="Sign In" type="button" color="primary" outline @click="backToSignIn"/>
				</div>
			</div>


			<q-form @submit="onSubmit" class="q-pa-lg" v-if="!resetingPassword && !registration">

				<q-input ref="initialFocus" autocomplete="username" v-model="username" label="Username" stack-label :disable="isLoading" :error="hasError"/>

				<q-input v-model="password" autocomplete="current-password" type="password" label="Password" stack-label :disable="isLoading" :error="hasError" error-message="Invalid username or password"/>

				<div class="text-right forgotPasswordLink">
					<a href="#" @click="forgotPassword" text-color="primary">Forgot password?</a>
				</div>

				<!-- buttons example -->
				<div class="q-pt-md q-pb-sm text-center">
					<q-btn label="Log In" type="submit" color="primary" ripple no-caps unelevated :loading="isLoading" style="width: 100%"/>
				</div>

				<div v-if="!signInWithGoogleDisabled">
					<div class="text-center">
						or
					</div>

					<div class="q-pt-sm q-pb-sm row">
						<SignInWithGoogle @signedin="onSignedInByProvider" />
					</div>
				</div>

				<div v-if="!registrationDisabled">

					<div class="text-center">
						or
					</div>

					<div class="q-pt-sm row">
						<q-btn label="Sign Up" type="submit" color="primary" ripple no-caps outline style="width: 100%" :disable="isLoading" @click="toRegistration"/>
					</div>

				</div>

			</q-form>

			<q-form @submit="onResetSubmit" class="q-pa-lg" v-if="resetingPassword && !isPasswordReseted && !registration">

				<q-inner-loading :showing="isLoading">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>

				<q-input ref="initialResetFocus" v-model="resetingEmail" label="Email" stack-label :disable="isLoading" :error="hasError"/>

				<!-- buttons example -->
				<div class="q-pt-md q-pb-sm text-center">
					<q-btn label="Reset Password" type="submit" color="primary" ripple no-caps unelevated :loading="isLoading" style="width: 100%"/>
				</div>

				<div class="text-center">
					or
				</div>

				<div class="q-pt-sm row">
					<q-btn label="Back To Log In" type="button" color="primary" ripple no-caps outline style="width: 100%" @click="backToSignIn" :disable="isLoading"/>
				</div>

			</q-form>

			<div v-if="isPasswordReseted" class="q-pa-lg">
				If we found an account associated with that username, we've sent password reset instructions to the primary email address on the account.

				<!-- buttons example -->
				<div class="q-pt-md">
					<q-btn label="Sign In" type="button" color="primary" outline @click="backToSignIn"/>
				</div>
			</div>

			<ReCaptcha ref="captcha" />



		</q-card>
	</q-dialog>
</template>

<style lang="css">
	body .forgotPasswordLink {
		margin-top: -8px;
	}

	body .forgotPasswordLink a {
		color: var(--q-primary);
		text-decoration: none;
		font-weight: bold;
	}

	body .forgotPasswordLink a:hover {
		text-decoration: underline;
	}

</style>
<script>
import ReCaptcha from 'shared/components/Services/ReCaptcha';
import SignInWithGoogle from './SignInWithGoogle';

export default {
	props: {
		what: {
			type: String,
			default: 'signin',
		}
		// ...your custom props
	},
	components: {
		ReCaptcha,
		SignInWithGoogle,
	},
	data() {
		return {
			isLoading: false,
			hasError: false,
			username: '',
			password: '',

			resetingPassword: false,
			resetingEmail: '',
			isPasswordReseted: false,

			registration: false,
			registrationEmail: '',
			registrationUsername: '',
			registrationPassword: '',

			hasErrorRegistration: {

			},
			isRegistered: false,

			registrationDisabled: false,
			signInWithGoogleDisabled: false,
		};
	},

	emits: [
		// REQUIRED
		'ok', 'hide'
	],
	methods: {
		onSignedInByProvider() {
			this.hide();
		},
		// toLogin() {
		// 	this.registration = false;
		// 	this.isRegistered = false;
		// },
		toRegistration() {
			if (this.registrationDisabled) {
				return this.backToSignIn();
			}

			this.registration = true;
			this.isRegistered = false;
			this.resetingPassword = false;
			this.isPasswordReseted = false;

			this.$nextTick(function() {
				this.$refs.initialRegistrationFocus.focus();
			});
		},
		forgotPassword() {
			this.resetingPassword = true;
			this.isPasswordReseted = false;
			this.registration = false;
			this.isRegistered = false;
			// this.$store.sessionUser.doResetPassword();
			//
			this.$nextTick(function() {
				this.$refs.initialResetFocus.focus();
			});
		},
		backToSignIn() {
			this.resetingPassword = false;
			this.isPasswordReseted = false;
			this.registration = false;
			this.isRegistered = false;

			this.$nextTick(function() {
				this.$refs.initialFocus.focus();
			});
		},
		async onRegisterSubmit() {
			this.isLoading = true;
			this.hasError = false;

			const captchaToken = await this.$refs.captcha.token('login');
			let success = false;
			let errorMessage = '';

			try {
				success = await this.$store.sessionUser.register({username: this.registrationUsername, email: this.registrationEmail, password: this.registrationPassword, captcha: captchaToken});
			} catch(e) {
				const status = e.response?.status;

				if (status == 400) {
					// bad data
					this.hasErrorRegistration = e.response?.data?.fields || {};
					this.isLoading = false;

					setTimeout(()=>{
						this.hasErrorRegistration = {};
					}, 2000);

					return;
				} else 	if (status == 422) {
					// captcha
					//
					//
					this.$q.notify({
						message: 'Invalid Captcha',
						color: 'negative'
					});
					this.isLoading = false;
					return;
				} else {
					// something unexpected
					errorMessage = e.response?.data?.message || 'Unexpected error';
					success = false;

					this.$q.notify({
						message: e.response?.data?.message || 'Unexpected error',
						color: 'negative'
					});
					this.isLoading = false;
					return;
				}
			}

			if (!success) {
				this.$q.notify({
					message: errorMessage,
					color: 'negative'
				});
			} else {
				this.isRegistered = true;
			}

			this.isLoading = false;

			return false;
		},
		async onResetSubmit() {
			this.isLoading = true;
			this.hasError = false;

			const captchaToken = await this.$refs.captcha.token('restore');
			let success = false;

			try {
				success = await this.$store.sessionUser.resetPassword({username: this.resetingEmail, captcha: captchaToken});
			} catch(e) {
				const status = e.response?.status;

				if (status == 422) {
					// captcha
					//
					//
					this.$q.notify({
						message: 'Invalid Captcha',
						color: 'negative'
					});
					this.isLoading = false;
					return;
				}
			}

			if (!success) {
				this.hasError = true;
				setTimeout(()=>{
					this.hasError = false;
				}, 1000);
			} else {
				this.isPasswordReseted = true;
				this.resetingEmail = '';
			}


			this.isLoading = false;

			return false;
		},
		async onSubmit() {
			this.isLoading = true;
			this.hasError = false;


			const captchaToken = await this.$refs.captcha.token('login');

			let success = false;
			try {
				success = await this.$store.sessionUser.signIn({username: this.username, password: this.password, captcha: captchaToken});
			} catch(e) {
				const status = e.response?.status;

				if (status == 422) {
					// captcha
					//
					//
					this.$q.notify({
						message: 'Invalid Captcha',
						color: 'negative'
					});
					this.isLoading = false;
					return;
				}
			}

			if (!success) {
				this.hasError = true;

				setTimeout(()=>{
					this.hasError = false;
				}, 1000);
			} else {
				this.hide();
			}


			this.isLoading = false;

			return false;
		},
		// following method is REQUIRED
		// (don't change its name --> "show")
		show () {
			this.registrationDisabled = this.$q.config.registrationDisabled;
			this.signInWithGoogleDisabled = this.$q.config.signInWithGoogleDisabled;

			this.$refs.dialog.show();

			if (this.what == 'registration') {
				this.toRegistration();
			} else if (this.what == 'reset') {
				this.forgotPassword();
			} else {
				this.backToSignIn();
			}

		},

		// following method is REQUIRED
		// (don't change its name --> "hide")
		hide () {
			this.$refs.dialog.hide()
		},

		onDialogHide () {
			// required to be emitted
			// when QDialog emits "hide" event
			this.$emit('hide')
		},

		onOKClick () {
			// on OK, it is REQUIRED to
			// emit "ok" event (with optional payload)
			// before hiding the QDialog
			this.$emit('ok')
			// or with payload: this.$emit('ok', { ... })

			// then hiding dialog
			this.hide()
		},

		onCancelClick () {
			// we just need to hide the dialog
			this.hide()
		}
	}
}
</script>