<template>

	<div>
	</div>

</template>

<style lang="css">
</style>

<script>

export default {
	name: 'ReCaptcha',
	props: {
	},
	data() {
		return {
		}
	},
	watch: {
	},
	computed: {
	},
	components: {
	},
	methods: {
		async appendScript(recaptchaSiteKey) {
			await new Promise((res)=>{
				if (window.grecaptcha) {
					window.grecaptcha.ready(res);
				} else {
					const jsScript = document.createElement('script');
					jsScript.id = 'recaptcha_script_tag';
					jsScript.addEventListener('load', () => {
						window.grecaptcha.ready(res);
					});
					jsScript.src = "https://www.google.com/recaptcha/api.js?render="+recaptchaSiteKey;
					document.body.appendChild(jsScript);
				}
			});
		},
		async initialize() {
			const recaptchaSiteKey = await this.$store.settings.get('recaptchaSiteKey');
			if (recaptchaSiteKey) {
				await this.appendScript(recaptchaSiteKey);
			}
		},
		async token(action) {
			await this.initialize();
			const recaptchaSiteKey = await this.$store.settings.get('recaptchaSiteKey');
			if (!recaptchaSiteKey) {
				return null;
			} else {
				this.showBadge();

				return await new Promise((res)=>{
					window.grecaptcha.execute(recaptchaSiteKey, {action: action}).then(function(token) {
						res(token);
					});
				});
			}
		},
		showBadge() {
			const element = document.querySelector('.grecaptcha-badge');
			if (element) {
				element.style.visibility = 'visible';
				setTimeout(()=>{
					element.style.visibility = 'hidden';
				}, 2000);
			}
		}
	},
	beforeMount: function() {
	},
	mounted: async function() {
	},
}
</script>
