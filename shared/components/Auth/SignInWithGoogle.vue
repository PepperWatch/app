<template>

	<q-btn type="button" :color="hasError ? 'negative' : 'primary'" ripple :disabled="!isInitialized" no-caps unelevated :loading="isLoading" style="width: 100%" @click="onClick">
		<i class="google"></i>Sign In With Google
	</q-btn>

</template>

<style lang="css">
	.google {
		float: left;
		width: 28px;
		height: 28px;
		display: block;
		margin-right: 8px;
		background-color: white;
		background-size: 80%;
		background-position: center center;
		background-repeat: no-repeat;
		border-radius: 2px;
		background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg viewBox='0 0 24 24' width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='matrix(1  0  0  1  27.009001  -39.238998)'%3E%3Cpath fill='%234285F4' d='M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z'/%3E%3Cpath fill='%2334A853' d='M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z'/%3E%3Cpath fill='%23FBBC05' d='M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z'/%3E%3Cpath fill='%23EA4335' d='M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z'/%3E%3C/g%3E%3C/svg%3E");
	}
</style>

<script>

export default {
	name: 'SignInWithGoogle',
	props: {
	},
	data() {
		return {
			isLoading: false,
			isInitialized: false,
			hasError: false,
		}
	},
	watch: {
	},
	computed: {
	},
	components: {
	},
	methods: {
		async handleGoogleResponse(response) {
			console.error('response', response);

			let success = false;
			try {
				success = await this.$store.sessionUser.signInWithJWT(response.credential);
			} catch(e) {
				console.error(e);
			}

			if (success) {
				this.$emit('signedin');
			} else {
				this.hasError = true;

				setTimeout(()=>{
					this.hasError = false;
				}, 1000);
			}

			this.isLoading = false;
		},
		onClick() {
			this.isLoading = true;

			document.cookie = 'g_state=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'; // refresh cool-down period
			window.google.accounts.id.prompt();
		},
		async appendScript(signInWithGoogleClientId) {
			await new Promise((res)=>{
				if (window.google?.accounts?.id) {
					window.handleGoogleCredentialResponseHandler = (response)=>{
						this.handleGoogleResponse(response);
					};

					res();
				} else {
					window.handleGoogleCredentialResponse = function (response) {
						// setting it up for different instances of SingInWithGoogle component
						if (window.handleGoogleCredentialResponseHandler) {
							window.handleGoogleCredentialResponseHandler(response);
						}
					};

					window.handleGoogleCredentialResponseHandler = (response)=>{
						this.handleGoogleResponse(response);
					};

					const jsScript = document.createElement('script');
					jsScript.id = 'signinwithgoogle_script_tag';
					jsScript.addEventListener('load', () => {
						window.google.accounts.id.initialize({
							client_id: signInWithGoogleClientId,
							callback: window.handleGoogleCredentialResponse
						});
						res();
					});
					jsScript.src = "https://accounts.google.com/gsi/client";
					document.body.appendChild(jsScript);
				}
			});
		},
		async initialize() {
			const signInWithGoogleClientId = await this.$store.settings.get('signInWithGoogleClientId');
			if (signInWithGoogleClientId) {
				await this.appendScript(signInWithGoogleClientId);
				this.isInitialized = true;
			}
		},
	},
	beforeMount: function() {
	},
	mounted: async function() {
		this.initialize();
		// setTimeout(()=>{
		// 	this.initialize();
		// }, 500);
	},
}
</script>
