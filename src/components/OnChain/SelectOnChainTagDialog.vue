<template>
	<!-- notice dialogRef here -->
	<q-dialog ref="dialogRef" @hide="onDialogHide">
		<q-card class="q-dialog-plugin">

			<div class="q-pa-md" v-if="!blockchainProvider">
				Please connect to blockchain first
			</div>

			<div class="q-pa-md" v-if="blockchainProvider">

				<q-select
					v-model="selected"
					filled
					use-input
					input-debounce="0"
					label="Select The Collection"
					:options="options"
					style="width: 100%"
				>
				<template v-slot:no-option>
				<q-item>
				<q-item-section class="text-grey">
				No results
				</q-item-section>
				</q-item>
				</template>
				</q-select>

			</div>

			<!-- buttons example -->
			<q-card-actions align="right" v-if="blockchainProvider">
				<q-btn color="primary" label="OK" @click="selectedAndReturn" />
				<q-btn color="primary" label="Cancel" @click="onCancelClick" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script>
import { useDialogPluginComponent } from 'quasar'

export default {
	props: {
		blockchainProvider: Object,
		// ...your custom props
	},

	emits: [
		// REQUIRED; need to specify some events that your
		// component will emit through useDialogPluginComponent()
		...useDialogPluginComponent.emits
	],

	data() {
		return {
			selected: null,
			options: [
				{
				label: 'Rock',
				value: 'rock'
				}],
		}
	},

	methods: {
		async loadTags() {
			if (!this.blockchainProvider) {
				return;
			}

			this.options = [];

			const data = await this.blockchainProvider.getAllTags({});
			if (data.tags) {
				for (let tag of data.tags) {
					this.options.push({
					label: tag,
					value: tag,
					});
				}
			}
		},

		selectedAndReturn() {
			// const { onDialogOK } = useDialogPluginComponent()
			this.onDialogOK(this.selected.label);
		}
	},

	mounted() {
		this.loadTags();
	},

	setup () {
		// REQUIRED; must be called inside of setup()
		const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()
		// dialogRef      - Vue ref to be applied to QDialog
		// onDialogHide   - Function to be used as handler for @hide on QDialog
		// onDialogOK     - Function to call to settle dialog with "ok" outcome
		//                    example: onDialogOK() - no payload
		//                    example: onDialogOK({ /*.../* }) - with payload
		// onDialogCancel - Function to call to settle dialog with "cancel" outcome
		//

		return {
			// This is REQUIRED;
			// Need to inject these (from useDialogPluginComponent() call)
			// into the vue scope for the vue html template
			dialogRef,
			onDialogHide,
			onDialogOK,

			// other methods that we used in our vue html template;
			// these are part of our example (so not required)
			onOKClick () {
				// on OK, it is REQUIRED to
				// call onDialogOK (with optional payload)
				onDialogOK()
				// or with payload: onDialogOK({ ... })
				// ...and it will also hide the dialog automatically
			},

			// we can passthrough onDialogCancel directly
			onCancelClick: onDialogCancel
		}
	}
}
</script>