<template>

	<div class="uploader text-center relative-position" @click="uploadClick" @dragenter="dragenter" @dragover="dragover" @dragleave="dragleave" @drop="drop" :class="{ dragOver: isDragging }">
		<input type="file" @change="fileToUploadSelected" ref="fileInput" accept=".mp4">

		<div class="q-mt-md q-gutter-md text-center absolute-center">
			<q-icon name="cloud_upload" class="text-primary" style="font-size: 64px;" />
			<h6 class="text-primary">Upload .mp4 file</h6>
			<p class="text-primary">max 100 MB</p>
		</div>
	</div>

</template>
<script>
import UserFile from '../classes/UserFile.js';

export default {
	name: 'Uploader',
	data() {
		return {
			dragCounter: 0,
			isDragging: false,
		}
	},
	methods: {
		sample: function() {
			const userFile = new UserFile({
				url: "//commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
				// url: "/test2.mp4",
				// url: "/test_small.mp4",
			});

			this.$emit('file', userFile);

			userFile.prepare()
				.then(()=>{
					this.$emit('filePrepared', userFile);
				});
		},
		uploadUserFile: function(file) {
			const maxSize = 100 * 1024 * 1024;
			if (file.size > maxSize) {

				this.$q.notify({
					type: 'negative',
					position: 'top-right',
					message: 'Maximum file size is 100 MB',
				});

				return;
			}

			const userFile = new UserFile({
				file: file,
			});

			this.$emit('file', userFile);

			userFile.prepare()
				.then(()=>{
					this.$emit('filePrepared', userFile);
				});
		},
		fileToUploadSelected: function(ev) {
			let files = ev.target.files;
			if (!files[0]) {
				return;
			}

			for (let file of files) {
				this.uploadUserFile(file);
			}
			// this.$emit('files', this.fileListFileSet);

			this.$refs.fileInput.value = null;
		},
		uploadClick: function() {
			this.$refs.fileInput.click();
		},
		drop: function(ev) {
			// Prevent default behavior (Prevent file from being opened)
			ev.preventDefault();

			this.isDragging = false;

			if (ev.dataTransfer.items) {
				// Use DataTransferItemList interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.items.length; i++) {
					// If dropped items aren't files, reject them
					if (ev.dataTransfer.items[i].kind === 'file') {
						const file = ev.dataTransfer.items[i].getAsFile();
						this.uploadUserFile(file);
					}
				}
			} else {
				// Use DataTransfer interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.files.length; i++) {
					// console.log('... 2 file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
					this.uploadUserFile(ev.dataTransfer.files[i]);
				}
			}
			// this.$emit('files', this.fileListFileSet);
		},
		dragenter: function(ev) {
			if (!ev.dataTransfer) {
				return;
			}
			this.isDragging = true;
			ev.stopPropagation();
			ev.preventDefault();
			this.dragCounter++;
			ev.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		},
		dragover: function(ev) {
			if (!ev.dataTransfer) {
				return;
			}
			this.isDragging = true;
			ev.stopPropagation();
			ev.preventDefault();
			ev.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		},
		dragleave: function(ev) {
			if (!ev.dataTransfer) {
				return;
			}
			this.dragCounter--;
			if (this.dragCounter === 0) {
				this.isDragging = false;
			}
		},
	},
}
</script>
<style>

	.uploader {
		cursor: pointer;
		display: block;
		height: 200px;
		border: 2px dashed var(--brand-color);
		overflow: hidden;
		position: relative;
	}

	.uploader input {
		display: none;
	}

	.uploader.dragOver {
		border-color: var(--brand-color);
		box-shadow: inset 0px 0px 20px 1px var(--brand-color);
	}

</style>
