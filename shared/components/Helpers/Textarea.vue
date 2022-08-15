<template>
		<!-- :toolbar="[
			['bold', 'italic', 'strike', 'underline'],
			['upload', 'save']
		]" -->
    <q-editor
		v-model="model"
		ref="editor"
		:definitions="definitions"
		:toolbar="toolbar"
		max-height="500px"
		hint="you!"
		content-class="textareaContainer"
		@update:modelValue="onUpdate"
		/>

	<div class="textareaLabel">
			<div>{{ hint }}</div>
	</div>

	<q-dialog ref="imageDialog" v-model="showImageDialog">
		<q-card class="imageDialog" style="width: 90%">
			<q-card-section class="q-pa-sm">
				<StorageBrowser bucket="default" mode="useImage" @use="onImageSelected" />
			</q-card-section>
		</q-card>
	</q-dialog>


</template>

<style lang="css">
	.textareaContainer img {
		max-width: 100%;
	}

	.textareaLabel {
		color: rgba(0, 0, 0, 0.54);
		padding: 8px 12px 0;
		font-size: 12px;
		margin-top: 0px !important;
	}

	.body--dark .textareaLabel {
		color: rgba(255, 255, 255, 0.7);
	}
</style>

<script>


import StorageBrowser from 'components/Services/StorageBrowser';
		// popup-content-class="bg-dark"
export default {
	name: 'DataSelect',
	props: {
		label: {
			type: String,
		},
		hint: {
			type: String,
		},
		dark: {
			type: Boolean,
		},
		modelValue: {
			type: [String, Object],
		},
		extraButtons: {
			type: Array,
		},
	},
	emits: ['update:modelValue'],
	data() {
		return {
			model: '',
			showImageDialog: false,
		}
	},
	watch: {
		// modelValue: function() {
		// 	const minEventDiffTime = 100;
		// 	if (!this.__modelUpdatedByChildAt || ((new Date()).getTime() - this.__modelUpdatedByChildAt) > minEventDiffTime) {
		// 		console.error('updated outside');
		// 		this.fillInitial();
		// 	}
		// },
	},
	computed: {
		toolbar: function() {
			const buttons = [
				['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
				['token', 'hr', 'link', 'upload'],
				['quote', 'unordered', 'ordered', 'outdent', 'indent'],
			];

			const definitions = this.definitions;
			const extraButtonsRow = [];
			for (let key in definitions) {
				if (key != 'upload') { // upload is default one, we already have button for it
					extraButtonsRow.push(key);
				}
			}

			if (extraButtonsRow.length) {
				buttons.push(extraButtonsRow);
			}

			buttons.push(['fullscreen', 'viewsource']);

			return buttons;
		},
		definitions: function() {
			const defs = {
				upload: {
					tip: 'Insert Image',
					icon: 'photo',
					label: '',
					handler: this.onImage,
				}
			};

			if (this.extraButtons && this.extraButtons.length) {
				for (let extraButtonDefinition of this.extraButtons) {
					let key = 'extra_'+extraButtonDefinition.icon;
					defs[key] = extraButtonDefinition;
				}
			}

			return defs;
		},
	},
	components: {
		StorageBrowser,
	},
	methods: {
		onUpdate(data) {
			// this.__modelUpdatedByChildAt = (new Date()).getTime();
			this.$emit('update:modelValue', data);
		},
		onImage() {
			this.showImageDialog = true;
		},
		onImageSelected(item) {
			if (item.url) {
                this.$refs.editor.runCmd('insertImage', item.url); //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
			}
			this.showImageDialog = false;
		},
		uploadIt() {
            // const post = this.model
            // create an input file element to open file dialog
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.png, .jpg' // file extensions allowed
            let file
            input.onchange = () => {
                const files = Array.from(input.files)
                file = files[0]

               // lets load the file as dataUrl
                const reader = new FileReader()
                let dataUrl = ''
                reader.onloadend = ()=>{
                    dataUrl = reader.result

                    // console.log(dataUrl);

                    // append result to the body of your post
                    this.$refs.editor.runCmd('insertImage', dataUrl); //https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
                    // this.model += '<div><img src="' + dataUrl + '" /></div>'
                }
                reader.readAsDataURL(file)
            }
            input.click()
		},
		fillInitial() {
			if (this.modelValue) {
				this.model = this.modelValue;
			} else {
				this.model = '';
			}

			const unwatchModelValue = this.$watch('modelValue', ()=>{
				unwatchModelValue();
				this.fillInitial();
			});
		}
	},
	mounted: async function() {
		setTimeout(()=>{
			this.fillInitial();
		}, 200);
	},
}
</script>
