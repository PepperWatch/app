<template>

	<q-page-sticky position="bottom-right" :offset="[8, 8]">
		<q-fab
			icon="info"
			direction="left"
			color="primary"
			square
			outline
			flat
			v-model="isOpened"
			persistent
			@hide="onHide"
			@show="onShow"
		>
			<q-fab-action  square padding="4px" type="a" to="/contact" color="primary" label="contact us"></q-fab-action>
			<q-fab-action  square padding="4px" @click="onTwitter" type="a" target="_blank" href="https://twitter.com/pepper_watch" color="primary" label="twitter">
				<template v-slot:icon>
					<Icon forWhat="twitter" />
				</template>
			</q-fab-action>
			<q-fab-action  square padding="4px" @click="onGithub" type="a" target="_blank" href="https://github.com/PepperWatch/app" color="primary" label="github">
				<template v-slot:icon>
					<Icon forWhat="github" />
				</template>
			</q-fab-action>
		</q-fab>
	</q-page-sticky>

</template>
<style scoped>
</style>
<script>
import Icon from 'shared/components/Icon';

export default {
	name: 'Footer',
	components: {
		Icon,
	},
	data() {
		return {
			isOpened: false,
		}
	},
	methods: {
		onGithub: function() {
			window.open('https://github.com/PepperWatch/app', '_blank');
		},
		onTwitter: function() {
			window.open('https://twitter.com/pepper_watch', '_blank');
		},
		onHide: function() {
			this.$q.localStorage.set('footerFabHidden', true);
		},
		onShow: function() {
			this.$q.localStorage.set('footerFabHidden', false);
		},
	},
	mounted() {
		const shouldBeHidden = this.$q.localStorage.getItem('footerFabHidden');

		if (!shouldBeHidden) {
			setTimeout(()=>{
				this.isOpened = true;
			}, 500);
		}
	},
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

	.q-footer {
		backdrop-filter: var(--brand-back-filter);
		background: var(--brand-header-color);
		color: var(--on-brand-text-color);
	}

	.body--dark .q-footer {
		backdrop-filter: var(--brand-back-filter);
		background-color: var(--brand-header-color-dark);
		color: var(--on-brand-text-color-dark);
	}

	.q-btn {
		backdrop-filter: var(--brand-back-filter) !important;
		background: var(--brand-header-color) !important;
	}

	.body--dark .q-btn {
		backdrop-filter: var(--brand-back-filter) !important;
		background-color: var(--brand-header-color-dark) !important;
	}

</style>