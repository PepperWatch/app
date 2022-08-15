export default {
	data() {
		return {
			cacheFor: (60*1000),
			isLoading: true,
			hasError: false,
			calculated: {

			},
		};
	},
	components: {
	},
	// created: function() {
	// 	this.hello();
	// },
	mounted: function() {
		const cacheName = 'widget_'+this.$options.name;
		const cachedAt = this.$q.localStorage.getItem(cacheName+'_time');

		if (cachedAt) {
			if (Math.abs(cachedAt.getTime() - (new Date()).getTime()) < this.cacheFor) {
				this.calculated = this.$q.localStorage.getItem(cacheName);
				this.isLoading = false;
				// console.error(cacheName+' from cache')
				// console.error(this.calculated);

				return true;
			}
		}

		this.initialize()
			.then(()=>{
				this.$q.localStorage.set(cacheName, this.calculated);
				this.$q.localStorage.set(cacheName+'_time', (new Date()));

				this.isLoading = false;
			})
			.catch(()=>{
				this.isLoading = false;
				this.hasError = true;
			});
	},
	methods: {
		// hello: function () {
		// 	console.log('hello from mixin!');
		// }
	}
};