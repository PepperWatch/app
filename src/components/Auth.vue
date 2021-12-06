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
			this.$q.dialog({
				component: SignIn,
				componentProps: {
					text: 'something',
					// ...more..props...
				}
			}).onOk(() => {
				console.log('OK');
			}).onCancel(() => {
				console.log('Cancel');
			}).onDismiss(() => {
				console.log('Called on OK or Cancel');
			});
		},
		logOut: function() {

		},
	},
	mounted: function() {
		this.$store.subscribeAction((action) => {
			if (action.type == 'doSignIn') {
				this.signIn();
			} else if (action.type == 'doLogOut') {
				this.logOut();
			}
		});
	}
}
</script>
