<template>

	<div>

		<div class="row q-col-gutter-md">
			<div class="col-12 col-md-4">
			</div>
			<div class="col-12 col-md-4">
				<h5 class="text-primary text-center">Confirm Email</h5>

				<q-banner inline-actions rounded class="bg-primary text-white text-center" v-if="isConfirming">
					<p>Checking the code</p>
					<q-spinner-gears size="50px" color="white" />
				</q-banner>

				<q-banner inline-actions rounded class="bg-primary text-white" v-if="!isConfirming && !isConfirmed">
					Invalid confirmation code
				</q-banner>

				<q-banner inline-actions rounded class="bg-primary text-white" v-if="isConfirmed" @click="$store.sessionUser.doSignIn()">
					Email has been confirmed. You can sign in now.
					<template v-slot:action>
						<q-btn flat color="white" label="Sign In" />
					</template>
				</q-banner>

			</div>
			<div class="col-12 col-md-4">
			</div>
		</div>

	</div>

</template>

<script>


//
export default {
	name: 'Confirm Email',
	title: 'Confirm Email',
	authRequired: false,
	path: '/confirm_email/:code',
	components: {
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			code: null,

			isConfirming: true,
			isConfirmed: false,
		}
	},
	methods: {
		async checkTheCode() {
			this.isConfirming = true;

			try {
				const confirmResponse = await this.$store.api.post({path: '/auth/confirm', data: {
					code: this.code,
				}});

				if (confirmResponse && confirmResponse.success) {
					this.isConfirmed = true;
				}
			} catch(e) {
				this.isConfirmed = false;
			}

			this.isConfirming = false;
		}
	},
	async mounted() {
		this.code = this.$route.params.code || null;
		this.checkTheCode();
	},
}
</script>
<style scoped>

</style>

