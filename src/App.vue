<template>
  <LayoutDefault />
</template>

<script>
import LayoutDefault from './layout/Default';


export default {
	name: 'App',

	components: {
		LayoutDefault
	},
	mounted() {
		this.$store.dispatch('initSession');
	}
}
</script>
