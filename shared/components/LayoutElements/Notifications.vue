<template>


	<q-btn flat @click="onClick" v-if="!!unreadCount">
		<q-icon name="notifications" size="sm" />
		<q-badge color="negative" floating v-if="!!unreadCount && unreadCount < 9">{{ unreadCount }}</q-badge>
		<q-badge color="negative" floating v-if="!!unreadCount && unreadCount >= 9">9+</q-badge>
	</q-btn>

</template>
<script>
import { colors } from 'quasar';

const Notifications = {
	name: 'Notifications',
	props: {
	},
	components: {
	},
	data() {
		return {
			unreadCount: 0,
			items: [],
		}
	},
	watch: {
		authenticated: function() {
			if (this.__notificationsLoaded) {
				console.log('cleaning notifications cache');

				this.$q.localStorage.set('notificationsCacheTime', 0);
				this.unreadCount = 0;
				this.items = [];

				this.loadNotifications();
			}
		}
	},
	methods: {
		onClick: function() {
			for (let item of this.items) {
				let style = "";
				if (item.color) {
					style += 'background-color: '+item.color;
					if (colors.luminosity(item.color) > 0.4) {
						style += ' !important; color: #000000 !important;';
					} else {
						style += ' !important; color: #ffffff;';
					}
				}

				this.$q.notify({
					position: 'top-right',
					message: item.subject, // virtual .subject
					attrs: {
						// for the notification itself:
						style: style
					},
				});
			}

			this.markAsRead();
		},
		loadNotifications: async function(forceNoCache = false) {
			if (!this.$store.sessionUser.me) {
				return false;
			}

			const cacheNotificationsFor = 60000;
			const notificationsCacheTime = this.$q.localStorage.getItem('notificationsCacheTime');

			if (notificationsCacheTime && !forceNoCache) {
				if (Math.abs(notificationsCacheTime.getTime() - (new Date()).getTime()) < cacheNotificationsFor) {
					this.items = this.$q.localStorage.getItem('notificationsCache');
					this.unreadCount = this.items.length;

					this.__notificationsLoaded = true;

					return true;
				}
			}

			const readNotificationsAt = this.$q.localStorage.getItem('readNotificationsAt');

			this.collection = await this.$store.api.collection('notifications');
			const resp = await this.collection.list({
				mine: true,
				populate: 'template', // important, so we can utilize .subject virtual
				sort: '-createdAt',
			});

			this.items = resp.items.map((item)=>{
				return {
					subject: (''+item.subject), // virtual generated
					createdAt: item.createdAt,
					color: (item.template?.color ? item.template.color : null),
				};
			});
			let unreadCount = 0;

			const notificationsToDisplay = this.items.filter((item)=>{
				if (unreadCount < 10 && (!readNotificationsAt || new Date(item.createdAt) > readNotificationsAt)) {
					unreadCount++;
					return true;
				}
				return false;
			});

			this.$q.localStorage.set('notificationsCache', notificationsToDisplay);
			this.$q.localStorage.set('notificationsCacheTime', (new Date()));

			this.items = notificationsToDisplay;
			this.unreadCount = unreadCount;

			this.__notificationsLoaded = true;
		},
		markAsRead() {
			this.unreadCount = 0;
			this.items = [];
			this.$q.localStorage.set('readNotificationsAt', (new Date()));
			this.$q.localStorage.set('notificationsCache', 0);
			this.$q.localStorage.set('notificationsCacheTime', 0);
		}
	},
	computed: {
		authenticated() {
			return (!!this.$store.sessionUser.me);
		}
	},
	mounted: function() {
		setTimeout(()=>{
			this.loadNotifications();
		}, 500);
	},
};


export default Notifications;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>