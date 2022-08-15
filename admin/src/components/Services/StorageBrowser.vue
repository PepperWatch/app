<template>

	<div>

		<q-banner rounded class="bg-secondary text-white" v-if="!bucket">
			No bucket selected
		</q-banner>

		<q-banner rounded class="bg-secondary text-white" v-if="bucket && !hasAccessToList">
			You do not have access to list objects in this bucket
		</q-banner>

		<q-list bordered padding class="rounded-borders relative-position non-selectable" @dragenter="dragenter" @dragover="dragover" @dragleave="dragleave" @drop="drop" :class="{ dragOver: isDragging }" v-if="bucket && hasAccessToList">
			<q-item-label header>
				<div class="float-right">
					<q-btn :title="!hasAccessToPut ? 'You do not have rights to upload to this bucket':''" size="sm" color="primary" label="Upload" icon-right="upload" @click="onUpload" v-if="!isLoading" :disable="!hasAccessToPut"/>
				</div>
				Folders
			</q-item-label>

			<div class="scroll-area scroll">

				<q-item clickable v-ripple @click="onBackClick" v-if="currentPath">
					<q-item-section avatar top>
						<q-avatar icon="folder" size="md" color="primary" text-color="white" />
					</q-item-section>
					<q-item-section>
						<q-item-label lines="1">...</q-item-label>
					</q-item-section>
				</q-item>

				<template v-for="item in items" v-bind:key="item.id">
					<q-item clickable v-ripple @click="onClick(item)" :data-id="item.id" v-if="(!item.isThumb && (this.mode != 'useImage' || this.isPreviewable))">
						<q-item-section avatar top>
							<q-avatar v-if="item.preview">
								<img :src="item.preview">
							</q-avatar>
							<q-avatar v-if="!item.preview && !item.name" icon="folder" size="md" color="primary" text-color="white" />
							<q-avatar v-if="!item.preview && item.name" icon="insert_drive_file" size="md" color="primary" text-color="white" />
						</q-item-section>

						<q-item-section>
							<q-item-label lines="1">{{ item.title }}</q-item-label>
							<q-item-label caption><DateHuman v-if="item.lastModified" :value="item.lastModified" /></q-item-label>
						</q-item-section>

						<q-item-section side v-if="item.name">
							<q-icon v-if="!item.isPreviewable" name="download" color="primary" />
							<q-icon v-if="item.isPreviewable" name="zoom_in" color="primary" />
						</q-item-section>
					</q-item>
				</template>

				<q-inner-loading :showing="isLoading">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>

			</div>
		</q-list>

		<q-dialog ref="previewDialog" v-model="showPreviewDialog">
			<q-card class="previewDialog" style="width: 90%">
				<q-card-section class="q-pb-none q-px-sm q-pt-sm">
					<div :class="{ previewDialogImage: true, previewDialogImageUsable: (this.mode == 'useImage') }" align="center" @click="useImage">
						<img :src="previewItemURL" @load="previewItemLoaded">
					</div>

					<q-inner-loading :showing="previewItemLoading">
						<q-spinner-gears size="50px" color="primary" />
					</q-inner-loading>
				</q-card-section>
				<q-card-section class="q-pt-none q-px-sm q-pb-sm">
					<div class="row">
						<div class="col" align="left">
							<q-btn flat round icon="fast_rewind" color="primary" @click="onPreviewPrev" :disable="!previewItemPrev"/>
						</div>
						<div class="col" align="center" v-if="(this.mode == 'useImage')">
							<q-btn flat round icon="check_circle" color="primary" @click="useImage" />
						</div>
						<div class="col" align="right">
							<q-btn flat round icon="fast_forward" color="primary" @click="onPreviewNext" :disable="!previewItemNext"/>
						</div>
					</div>
				</q-card-section>
			</q-card>
		</q-dialog>

	</div>

</template>

<style lang="css">
	.previewDialogImage {
		min-height: 100px;
	}
	.previewDialogImageUsable {
		cursor: pointer;
	}
	.previewDialog img {
		max-width: 100%;
		max-height: 60vh;
	}
	.scroll-area {
		height: 50vh;
	}
	.dragOver {
		border: 2px dashed rgba(0, 0, 0, 0.12) !important;
	}
</style>

<script>
import DateHuman from 'shared/components/Helpers/DateHuman';
import ThumbGenerator from 'classes/ThumbGenerator';

export default {
	name: 'StorageBrowser',
	props: {
		bucket: {
			type: [Object, String],
			default: null,
		},
		path: {
			type: String,
			default: '',
		},
		mode: {
			type: String,
			default: 'browse',
		}
	},
	data() {
		return {
			normalizedBucket: null,

			items: [],
			isLoading: false,
			setPath: '',
			currentPath: '',

			showPreviewDialog: false,
			previewItem: null,
			previewItemLoading: false,
			previewItemURL: null,

			previewItemNext: null,
			previewItemPrev: null,

			isDragging: false,
			dragCounter: 0,
		}
	},
	watch: {
		bucket: function() {
			this.normalizeBucket()
				.then(()=>{
					this.loadList();
				});
		},
		path: function() {
			this.setPath = this.path;
			this.loadList();
		},
	},
	computed: {
		hasAccessToPut() {
			return this.normalizedBucket && this.$store.sessionUser.hasLevelOf(this.normalizedBucket.levelToPut);
		},
		hasAccessToGet() {
			return this.normalizedBucket && this.$store.sessionUser.hasLevelOf(this.normalizedBucket.levelToGet);
		},
		hasAccessToList() {
			return this.normalizedBucket && this.$store.sessionUser.hasLevelOf(this.normalizedBucket.levelToList);
		}
	},
	components: {
		DateHuman,
	},
	methods: {
		async normalizeBucket() {
			if (this.bucket.id) {
				// passed settings object, ok
				this.normalizedBucket = this.bucket;
			} else {
				// if it's string - try to load settings
				//
				// @todo: cache it
				const resp = await this.$store.api.post({
					path: 'api/storage/buckets',
					data: {
					}});
				const found = resp.items.find((i)=>(i.id == this.bucket));

				if (found) {
					this.normalizedBucket = found;
				}
			}
		},
		useImage() {
			this.$emit('use', this.previewItem);
			this.showPreviewDialog = false;
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
						this.uploadFile(file);
					}
				}
			} else {
				// Use DataTransfer interface to access the file(s)
				for (let i = 0; i < ev.dataTransfer.files.length; i++) {
					// console.log('... 2 file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
					this.uploadFile(ev.dataTransfer.files[i]);
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
		async uploadFile(file) {
			if (!this.hasAccessToPut) {
				return false;
			}

			this.isLoading = true;

			let fileName = file.name;
			fileName = fileName.replace(/[^A-Za-z0-9_.]+/g,"_");
			let path = this.currentPath ? (this.currentPath + fileName) : (fileName);

			let suffix = 1;
			let originalFilename = ''+fileName;
			while (this.items.find((item)=>(item.name == path))) {
				fileName = originalFilename.split('.').join('_'+suffix+'.');
				path = this.currentPath ? (this.currentPath + fileName) : (fileName);
				suffix++;
			}

			let thumb = null;
			if (['jpg','jpeg','png'].indexOf(fileName.split('.').pop().toLowerCase()) != -1) {
				const thumbGenerator = new ThumbGenerator();
				thumb = await thumbGenerator.getThumbBlob({
					file: file,
					maxDim: 200,

				});
			}

			const doUpload = async(file, path) => {
				const resp = await this.$store.api.post({
					path: 'api/storage/upload',
					data: {
						bucket: this.normalizedBucket.id,
						path: path,
					}});

				if (resp && resp.data) {
					const formData = new FormData();
					Object.keys(resp.data.formData).forEach((key) => {
						formData.append(key, resp.data.formData[key]);
					});

					formData.append("file", file);

					await fetch(resp.data.postURL, {
						method: 'POST',
						mode: 'no-cors',
						body: formData
					});
				}
			};

			await doUpload(file, path);
			if (thumb) {
				const thumbPathExt = fileName.split('.').pop();
				const thumbPath = path.split('.'+thumbPathExt).join('.thumb.png');
				await doUpload(thumb, thumbPath);
			}

			await this.loadList(true);
		},
		async uploadFilesChanged(event) {
			const fileList = event.target.files;
			for (let file of fileList) {
				await this.uploadFile(file);
			}
		},
		onUpload() {
			const input = document.createElement("input");
			input.setAttribute("type", "file");
			input.multiple = true;
			document.body.appendChild(input);

			input.addEventListener("change", this.uploadFilesChanged, true);
			input.click();
		},
		async download(item) {
			let url = item.url ? item.url : null; // is bucket public?
			if (!url) { // get signed url for private bucket
				const resp = await this.$store.api.post({
					path: 'api/storage/download',
					data: {
						bucket: this.normalizedBucket.id,
						path: item.name,
					}});
				url = resp.url;
			}

			if (url) {
				let fileName = item.name.split('/').pop();
				this.downloadLink = document.createElement("a");
				this.downloadLink.download = fileName;
				this.downloadLink.href = url;

				document.body.appendChild(this.downloadLink);
				this.downloadLink.click();
				document.body.removeChild(this.downloadLink);
				delete this.downloadLink;
			}
		},
		onPreviewPrev() {
			this.showPreview(this.previewItemPrev);
		},
		onPreviewNext() {
			this.showPreview(this.previewItemNext);
		},
		previewItemLoaded() {
			this.previewItemLoading = false;
		},
		async showPreview(item) {
			if (!item) {
				return false;
			}

			this.previewItemLoading = true;
			this.showPreviewDialog = true;
			this.previewItem = item;

			this.previewItemPrev = null;
			this.previewItemNext = null;
			let foundCurrent = false;

			this.items.forEach((allItem)=>{
				if (allItem.name) { // not folder
					if (allItem.name == item.name) {
						foundCurrent = true;
					} else if (this.isPreviewable(allItem) && !allItem.isThumb) {
						if (!foundCurrent) {
							this.previewItemPrev = allItem;
						} else if (!this.previewItemNext) {
							this.previewItemNext = allItem;
						}
					}
				}
			});

			let url = item.url;

			if (!url) {
				const resp = await this.$store.api.post({
					path: 'api/storage/download',
					data: {
						bucket: this.normalizedBucket.id,
						path: item.name,
					}});
				url = resp.url;
			}
			if (url) {
				this.previewItemURL = url;
			}
		},
		isPreviewable(item) {
			if (item.name && ['jpg','jpeg','png'].indexOf(item.name.split('.').pop().toLowerCase()) != -1) {
				return true;
			}
			return false;
		},
		onClick(item) {
			if (item.prefix) {
				this.setPath = item.prefix;
				this.loadList();
			} else if (this.isPreviewable(item)) {
				this.showPreview(item);
			} else if (item.name) {
				// download
				this.download(item);
			}
		},
		onBackClick() {
			if (this.currentPath) {
				const splet = this.currentPath.split('/').filter((part)=>(part));
				splet.pop();
				if (!splet.length) {
					this.setPath = '';
				} else {
					// splet = splet.filter((part)=>(part)); // remove empty
					this.setPath = splet.join('/') + '/';
				}

				this.loadList();
			}
		},
		async loadList(flushCache = false) {
			this.isLoading = true;

			if (!this.hasAccessToList) {
				this.isLoading = false;
				return false;
			}

			try {
				// console.error(this.setPath, 'this.setPath')

				this.$emit('path', this.setPath);

				if (this.__cached && this.__cached[this.setPath] && !flushCache) {
					this.items = this.__cached[this.setPath];
					this.currentPath = this.setPath;
				} else {

					const resp = await this.$store.api.post({
						path: 'api/storage/list',
						data: {
							bucket: this.normalizedBucket.id,
							path: this.setPath,
						}});


					const items = resp.items;
					items.forEach((item)=>{
						item.id = item.name || item.prefix;
						item.title = item.prefix || (item.name.split('/').pop());
						item.lastModified = (item.lastModified ? new Date(item.lastModified) : null);

						if (item.name) {
							if (item.name.endsWith('.thumb.png')) {
								item.isThumb = true;
								const startsWith = item.name.split('.thumb.png').join('.');
								items.forEach((recItem)=>{
									if (recItem.name && recItem.name.startsWith(startsWith)) {
										recItem.thumb = item;
										if (item.url) {
											recItem.preview = item.url;
										}
									}
								});
							}
						}

						if (this.isPreviewable(item)) {
							item.isPreviewable = true;
						}
					});

					items.sort(function(a, b) {
						return (a.prefix && !b.prefix) ? -1 : (a.prefix && b.prefix ? ((a.prefix < b.prefix) ? -1 : 1) : ((a.lastModified < b.lastModified) ? 1 : -1));
						// return a.name - b.name;
					});

					this.currentPath = this.setPath;
					if (!this.__cached) {
						this.__cached = {};
					}
					this.__cached[this.currentPath] = items;
					this.items = items;
				}


				// console.error(resp);

			} catch(e) {
				console.error(e);
			}

			this.isLoading = false;
		}
	},
	beforeMount: function() {

	},
	mounted: async function() {
		// this.tryToLoadPreview();
		if (this.bucket) {
			this.normalizeBucket()
				.then(()=>{
					this.loadList();
				});
		}
	},
}
</script>
