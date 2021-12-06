<template>

  <div>
    <h2>Abo2ut</h2>

    <router-link to="/">Home</router-link>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>
    <p>Hi there!</p>

    <router-link to="/">Home</router-link>
  </div>

</template>

<script>
// import Ajax from '../classes/ajax';

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
  },
}
</script>
<style scoped>

</style>

