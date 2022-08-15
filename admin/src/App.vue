<template>
  <LayoutDefault />
</template>

<script>
// import ModelFactory from 'shared/models/ModelFactory.js';
import LayoutDefault from './layout/Default';


export default {
	name: 'App',

	components: {
		LayoutDefault
	},
	mounted() {
		// console.error(this.$store);
		// console.error(ModelFactory);

		// const Class = ModelFactory.getModel('Notification');

		// const n = new Class();

		// console.log(n);

		// const Class2 = ModelFactory.getModel('NotificationTemplate');

		// const n2 = new Class2();

		// console.log(n2);

		this.$store.sessionUser.initSession();
	}
}
</script>
