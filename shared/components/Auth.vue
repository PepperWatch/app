<template>

	<span></span>

</template>

<style>
</style>

<script>
import SignIn from './Auth/SignIn.vue';

export default {
	name: 'Auth',
	methods: {
		signIn: function() {
			if (this.__showingSignInDialog) {
				return;
			}

			this.__showingSignInDialog = true;

			this.$q.dialog({
				component: SignIn,
				componentProps: {
					what: 'signin',
					// ...more..props...
				}
			}).onOk(() => {
				console.log('OK');
			}).onCancel(() => {
				this.$store.sessionUser.signInHidden();
			}).onDismiss(() => {
				this.__showingSignInDialog = false;
			});
		},
		register: function() {
			if (this.__showingSignInDialog) {
				return;
			}

			this.__showingSignInDialog = true;

			this.$q.dialog({
				component: SignIn,
				componentProps: {
					what: 'registration',
					// ...more..props...
				}
			}).onOk(() => {
				console.log('OK');
			}).onCancel(() => {
				this.$store.sessionUser.signInHidden();
			}).onDismiss(() => {
				this.__showingSignInDialog = false;
			});
		},
		logOut: function() {

		},
		resetPassword: function() {
			if (this.__showingSignInDialog) {
				return;
			}

			this.__showingSignInDialog = true;

			this.$q.dialog({
				component: SignIn,
				componentProps: {
					what: 'reset',
					// ...more..props...
				}
			}).onOk(() => {
				console.log('OK');
			}).onCancel(() => {
				this.$store.sessionUser.signInHidden();
			}).onDismiss(() => {
				this.__showingSignInDialog = false;
			});
		},
	},
	mounted: function() {
		this.$store.sessionUser.$onAction(({name}) => {
			if (name== 'doSignIn') {
				this.signIn();
			} else if (name == 'doLogOut') {
				this.logOut();
			} else if (name == 'doResetPassword') {
				this.resetPassword();
			} else if (name == 'doRegister') {
				this.register();
			}
		});


		// setTimeout(()=>{
		// 	this.signIn();
		// }, 500);
	}
}
</script>
