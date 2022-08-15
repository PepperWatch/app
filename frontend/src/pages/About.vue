<template>

	<div>
	<h5 class="text-primary">About</h5>

	<router-link to="/">Home</router-link><br>
	<router-link to="/">Home</router-link><br>
	<router-link to="/">Home</router-link><br>
	</div>

</template>

<script>

export default {
	name: 'About',
	title: 'About Us',
	authRequired: true,
	path: '/about',

	props: {
	},
	data() {
		return {
			isActive: false,
		}
	},
	methods: {
	},
	mounted() {
	}
}
</script>
<style scoped>

</style>

