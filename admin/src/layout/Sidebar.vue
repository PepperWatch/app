<template>

	<q-drawer
		v-if="authenticated"
		v-model="visible"
		show-if-above
		mini-to-overlay
		:mini="miniState"
        @mouseover="miniState = false"
        @mouseout="miniState = true"
		:width="300"
		:breakpoint="500"
		bordered
		>
        <q-scroll-area class="fit" delay="500">
			<q-list>
				<template v-for="(menuItem, index) in menuItems"  v-bind:key="index">
					<MenuItem :item="menuItem"/>
				</template>
			</q-list>
		</q-scroll-area>
	</q-drawer>

</template>
<script>
import MenuItem from 'shared/components/LayoutElements/MenuItem';

export default {
	name: 'Sidebar',
	components: {
		MenuItem,
	},
	data() {
		return {
			miniState: true,
			visible: true,
			menuItems: [],
		}
	},
	methods: {
		showMenu() {
			this.visible = !this.visible;
		},
		recalculateDisabled() {
			this.initialize();

			const signedIn = !!this.$store.sessionUser.me;
			const levels = this.$store.sessionUser.getAvailableAccessLevels();

			const walk = (item)=>{
				if (item.routerRoute && item.routerRoute.meta) {
					item.disabled = false;
					if (item.routerRoute.meta.authRequired) {
						if (!signedIn) {
							item.disabled = true;
						} else if (item.routerRoute.meta.requiredAuthLevel && levels.indexOf(item.routerRoute.meta.requiredAuthLevel) == -1) {
							item.disabled = true;
						}
					}
				}

				if (item.subItems) {
					item.subItems.forEach((item)=>walk(item));
				}
			};
			this.menuItems.forEach((item)=>walk(item));
		},
		initialize() {
			if (this.__initialized) {
				return true;
			}

			this.menuItems = this.$q.config.menuItems;

			const routerRoutes = this.$router.getRoutes();

			const walkOnItems = (item, routerRoutes)=>{
				for (let routerRoute of routerRoutes) {
					if (routerRoute.path == item.path) {
						item.routerRoute = routerRoute;
					}
				}

				if (item.subItems) {
					for(const subItem of item.subItems) {
						walkOnItems(subItem, routerRoutes);
					}
				}

			};

			for (let menuItem of this.menuItems) {
				walkOnItems(menuItem, routerRoutes);
			}

			this.__initialized = true;
			return true;
		}
	},
	watch: {
		userLevel: function() {
			if (!this.__initialized) {
				return false;
			}

			this.recalculateDisabled();
		}
	},
	computed: {
		authenticated() {
			return (!!this.$store.sessionUser.me);
		},
		userLevel() {
			return (this.$store.sessionUser.level);
		}
	},
	mounted: function() {
		setTimeout(()=>{
			this.initialize();
			this.recalculateDisabled();
		}, 100);
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
	.menuSubSlider {
		overflow-x: hidden;
	}

	.q-drawer__content a.q-item, .q-drawer__content .q-item {
		color: #666;
	}
	.body--dark .q-drawer__content a.q-item, .body--dark .q-drawer__content .q-item {
		color: #ccc;
	}
	.q-drawer__content .q-item.q-router-link--active, .q-drawer__content .q-item--active {
		color: var(--q-primary);
	}
	.body--dark .q-drawer__content .q-item.q-router-link--active, .body--dark .q-drawer__content .q-item--active {
		color: var(--q-primary);

	}
</style>