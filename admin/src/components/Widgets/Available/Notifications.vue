<template>

    <q-card class="my-card" flat bordered>
		<q-card-section>
			<div class="text-overline text-primary">Notifications</div>
			<q-scroll-area style="height: 200px;">
			<q-list v-if="!isLoading">
				<template v-for="(item, index) in calculated.items"  v-bind:key="index">
					<q-item dense class="q-pl-none">
						<q-item-section>
						<q-item-label caption>
							<span class="q-item-dot" :style="{ backgroundColor: (item.color ? item.color : undefined) }"></span>
							{{ item.subject }}</q-item-label>
						</q-item-section>

						<q-item-section side top>
						<q-item-label caption><DateToDiff :date="item.createdAt"/></q-item-label>
						</q-item-section>
					</q-item>
				</template>
			</q-list>
			</q-scroll-area>


		</q-card-section>

		<q-card-actions>
			<q-btn flat color="primary" :label="'View '+calculated.moreCount+' More'" to="/notifications"/>
		</q-card-actions>

		<q-inner-loading :showing="isLoading">
			<q-spinner-gears size="50px" color="primary" />
		</q-inner-loading>
    </q-card>

</template>

<style scoped="scoped">
	.q-item-dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		line-height: 20px;
		vertical-align: middle;
		margin-right: 4px;
	}
</style>

<script>
import DateToDiff from 'shared/components/Helpers/DateToDiff';
import WidgetMixin from '../WidgetMixin';

export default {
	name: 'Notifications',
	mixins: [WidgetMixin],
	props: {
	},
	data() {
		return {
			cacheFor: (60*1000),
			calculated: {
				items: [],
				moreCount: 0,
			}
		};
	},
	watch: {
	},
	computed: {
		hasFiltersSlot() {
			// has filters slot defined on parent component, so we know if to show filters button
			return !!this.$slots.filters;
		}
	},
	components: {
		DateToDiff,
	},
	methods: {
		async initialize() {
			this.collection = await this.$store.api.collection('notifications');
			const resp = await this.collection.list({
				mine: true,
				populate: 'template', // important, so we can use virtual .subject
				sort: '-createdAt',
				limit: 20,
			});

			this.calculated.items = resp.items.map((item)=>{
				return {
					subject: item.subject, // virtual generated
					createdAt: item.createdAt,
					color: (item.template?.color ? item.template.color : null),
				};
			});

			this.calculated.moreCount = resp.total - resp.items.length;
		},
	},
	beforeMount: function() {
	},
	mounted: async function() {
	}
}
</script>
