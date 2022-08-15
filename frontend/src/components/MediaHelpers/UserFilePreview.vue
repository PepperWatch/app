<template>

    <q-card class="my-card">
        <q-img :src="previewImage">
            <div class="absolute-bottom text-subtitle2 text-center">
                {{ label }} ({{userFile.humanSize}})
            </div>
        </q-img>
    </q-card>

</template>
<script>
// import UserFile from '../classes/UserFile.js';

export default {
	name: 'UserFilePreview',
	props: {
		label: String,
		userFile: Object, // UserFile
	},
	data() {
		return {
			humanSize: '',
			previewImage: 'none',
		}
	},
	mounted: function() {
		this.userFile.prepare()
			.then(()=>{
				this.humanSize = this.userFile.humanSize;
				this.previewImage = this.userFile.thumbURL;
			});
	},
	watch: {
		'userFile.thumbURL': function (){ //newVal, oldVal
			// console.log('bgImage22', this.userFile.thumbURL);
		},
	},
	methods: {
	},
	computed: {
		// previewImage() {
		// 	console.log('bgImage', this.userFile.thumbURL);
		// 	return (this.userFile ? this.userFile.thumbURL : null);
		// 	// if (this.file) {
		// 	// 	return this.file.thumbURL;
		// 	// }
		// 	// return null;
		// },
		// bgImage() {
		// 	if (this.file && this.file.thumbURL) {
		// 		return 'linear-gradient(to bottom,rgba(0, 0, 0, 0.4),rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.2),rgba(0, 0, 0, 0.4)),url('+this.file.thumbURL+')';
		// 	} else {
		// 		return 'none';// + this.file.thumbURL;
		// 	}
		// },
	}
}
</script>
<style>

	.my-card {
		width: 100%;
		max-width: 250px;
	}

</style>
