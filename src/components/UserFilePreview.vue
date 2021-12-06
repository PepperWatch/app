<template>

	<div v-if="file">
						<div class="row no-wrap items-center">
							<q-img
								style="width: 200px"
								:ratio="1"
								class="rounded-borders"
								:src="previewImage"
								v-if="previewImage"
								/>
							<div class="text-h4 q-ml-md text-primary">{{ file.humanSize }}</div>
						</div>

						<!--
		<q-markup-table flat bordered>
			<thead class="bg-teal-3">
				<tr>
					<th colspan="5">
						<div class="row no-wrap items-center">
							<q-img
							style="width: 70px"
							:ratio="1"
							class="rounded-borders"
							:src="previewImage"
							v-if="previewImage"
							/>
							<div class="text-h4 q-ml-md text-white">Treats</div>
						</div>
					</th>
				</tr>
				<tr>
					<th class="text-left">Size</th>
					<th class="text-right">Calories</th>
					<th class="text-right">Fat (g)</th>
					<th class="text-right">Carbs (g)</th>
					<th class="text-right">Protein (g)</th>
				</tr>
			</thead>
			<tbody class="bg-grey-3">
				<tr>
					<td class="text-left">Frozen Yogurt</td>
					<td class="text-right">159</td>
					<td class="text-right">6</td>
					<td class="text-right">24</td>
					<td class="text-right">4</td>
				</tr>
			</tbody>
		</q-markup-table> -->
	</div>

</template>
<script>
// import UserFile from '../classes/UserFile.js';

export default {
	name: 'UserFilePreview',
	props: {
		file: Object, // UserFile
	},
	data() {
		return {
		}
	},
	mounted: function() {
		this.file.prepare();
	},
	watch: {
		'file.thumbURL': function (){ //newVal, oldVal
			console.log('bgImage22', this.file.thumbURL);
		},
	},
	methods: {
	},
	computed: {
		previewImage() {
			console.log('bgImage', this.file.thumbURL);
			return (this.file ? this.file.thumbURL : null);
			// if (this.file) {
			// 	return this.file.thumbURL;
			// }
			// return null;
		},
		bgImage() {
			if (this.file && this.file.thumbURL) {
				return 'linear-gradient(to bottom,rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.4)),url('+this.file.thumbURL+')';
			} else {
				return 'none';// + this.file.thumbURL;
			}
		},
	}
}
</script>
<style>
	.videoPreview {
		width: 300px;
		height: 200px;
		background-size: cover;
		background-position: center center;
		background-repeat: no-repeat;
	}

</style>
