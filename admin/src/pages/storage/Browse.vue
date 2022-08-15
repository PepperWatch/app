<template>

	<div>
		<h5 class="text-primary">Browse Storage</h5>

		<div class="q-pb-md">
			<q-select
				filled
				v-model="selectedBucket"
				use-input
				:hide-selected="true"
				:fill-input="true"
				input-debounce="0"
				label="Select The Bucket"
				:options="bucketsOptions"
				@update:modelValue="bucketSelected"
				>
				<template v-slot:no-option>
					<q-item>
						<q-item-section class="text-grey">
							Select bucket
						</q-item-section>
					</q-item>
				</template>
			</q-select>

		</div>

		<div>
			<StorageBrowser :bucket="bucket" :path="path" @path="onPath" />
		</div>

	</div>

</template>

<script>


import StorageBrowser from '../../components/Services/StorageBrowser';
//
export default {
	name: 'Browse Storage',
	title: 'Browse Storage',
	authRequired: true,
	requiredAuthLevel: 'user',
	path: '/browse/:bucket?/:path?',
	dynamic: true, // lazy loaded
	components: {
		StorageBrowser,
	},
	props: {
	},
	data() {
		return {
			isActive: false,
			buckets: [
			],
			bucketsOptions: [
			],
			selectedBucket: null,
			bucket: null,
			path: null,
			isSaving: false,
		}
	},
	watch: {
	},
	methods: {
		useImage() {
		},
		onPath(path) {
			this.$router.push({params: {path: path}});
			// alert(path)
		},
		async load() {
			try {
				const resp = await this.$store.api.post({
					path: 'api/storage/buckets',
					data: {
					}});

				this.bucketsOptions = [];
				for (let item of resp.items) {
					this.bucketsOptions.push({
						label: item.id,
						value: item.id,
					});
				}
				this.buckets = resp.items;

				if (this.$route.params.bucket) {
					const selected = this.bucketsOptions.find((o)=>(o.value == this.$route.params.bucket));
					if (selected) {
						this.selectedBucket = selected;
						this.bucketSelected();
					}
				}
			} catch(e) {
				console.error(e);
			}
		},
		bucketSelected() {
			const bucketId = this.selectedBucket.value;
			this.bucket = this.buckets.find((item)=>(item.id == bucketId));

			this.$nextTick(()=>{ // don't know why it's needed here, doesn't work on event itself
				this.$router.push({params: {bucket: bucketId}});

			});
		}
	},
	async mounted() {
		if (this.$route.params.path) {
			this.path = this.$route.params.path;
		}

		this.load();
	},
}
</script>
<style scoped>

</style>

