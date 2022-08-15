<template>

	<q-form class="q-gutter-md">
		<q-input
			filled
			v-model="data.name"
			label="Tempalte Name"
			hint="Tempalte Name"
			lazy-rules
			:rules="[ val => val && val.length > 0 || 'Please type something']"
		/>

		<q-input
			filled
			v-model="data.subject"
			label="Subject"
			hint="Subject"
			lazy-rules
			:rules="[ val => val && val.length > 0 || 'Please type something']"
		>
			<template v-slot:append>
				<q-btn round dense flat icon="tag" @click="showTagsDialog = true" />
			</template>
		</q-input>

		<Textarea v-model="data.message" :extraButtons="[{
					tip: 'Show Tags',
					icon: 'tag',
					label: '',
					handler: ()=>{ this.showTagsDialog = true },
				}]" />

		<div>
			<q-checkbox v-model="data.showInUI" color="secondary" label="Show this template notifications in UI" />
		</div>

		<div>

			<q-select
				v-if="data.showInUI"
				filled
				v-model="data.defaultTargetLevel"
				:options="optionsLevels"
				label="Default UI Target User Level"
				hint="If no target specified, send Notifications to users with level of"
				>
				<template v-slot:no-option>
					<q-item>
						<q-item-section class="text-grey">
							Do Not
						</q-item-section>
					</q-item>
				</template>
			</q-select>

		</div>

		<div>
			<q-checkbox v-model="data.canSendAsEmail" color="secondary" label="Is this template available for email sending" />
		</div>

		<div>
			<q-checkbox v-model="data.canSendToSlack" color="secondary" label="Is this template available for posting to Slack" />
		</div>

		<div>

			<q-select
				v-if="data.canSendToSlack"
				filled
				v-model="data.defaultTargetChannel"
				:options="optionsChannels"
				label="Default Slack Target"
				hint="If no target specified, send Notifications to this Slack channel"
				>
				<template v-slot:no-option>
					<q-item>
						<q-item-section class="text-grey">
							Do Not
						</q-item-section>
					</q-item>
				</template>
			</q-select>

		</div>


		<div v-if="data.canSendToSlack || data.showInUI">
			<q-input
				filled
				v-model="data.color"
				label="Notification color"
				hint="Color for UI notifications and highlighting message in Slack"
			>
				<template v-slot:append>
					<q-icon name="colorize" class="cursor-pointer">
						<q-popup-proxy cover transition-show="scale" transition-hide="scale">
							<q-color v-model="data.color"
								format-model="hex"
								default-view="palette"
								no-header-tabs
								no-footer />
						</q-popup-proxy>
					</q-icon>
				</template>
			</q-input>
		</div>

		<q-dialog v-model="showTagsDialog" position="right">
			<q-card style="width: 30vh;">
				<q-card-section class="row items-center q-pb-none">
					<div class="text-h6">Available Tags</div>
					<q-space />
					<q-btn icon="close" flat round dense v-close-popup />
				</q-card-section>

				<q-card-section style="max-height: 50vh">
					<template v-for="tag in availableTags" v-bind:key="tag">
						<div>
							<span @click="copyToClipboard('%'+tag+'%')" class="cursor-pointer">%{{ tag }}%</span>

						</div>
					</template>
				</q-card-section>
			</q-card>
		</q-dialog>

	</q-form>

</template>
<script>

import Textarea from 'shared/components/Helpers/Textarea';
import { copyToClipboard } from 'quasar';
import NotificationTemplateSubject from './cells/NotificationTemplateSubject';
import { shallowRef} from 'vue';

export default {
	props: {
		item: Object
	},
	components: {
		Textarea,
	},
	data() {
		return {
			data: this.item,
			collectionName: 'notification_templates',
			showTagsDialog: false,
			availableTags: [],
			columns: [
				{
					name: 'id',
					label: '#',
					field: '_id',
					align: 'left',
					headerStyle: 'width: 70px',
					style: 'width: 70px',
					sortable: true,
				},
				{ name: 'name', align: 'left', label: 'Name', field: 'name', sortable: true },
				{
					name: 'Subject',
					align: 'left',
					label: 'Subject',
					field: 'subject',
					component: shallowRef(NotificationTemplateSubject),
				},
				{ name: 'action', label: 'Action', field: 'action' },
			],

			optionsLevels: [],
			optionsChannels: [],
		}
	},
	mounted: async function() {
		// this.data = this.item;
		const commonTags = await this.$store.settings.get('messageCommonTags');
		const tags = [];
		for (let key in commonTags) {
			tags.push(key);
		}

		this.availableTags = tags;

		this.optionsLevels = this.$store.sessionUser.possibleLevels;

		try {
			const slackChannels =  await this.$store.settings.get('slackChannels');
			this.optionsChannels = slackChannels.map((c)=>c.id);
		} catch(e) {
			console.error(e);
		}
	},
	watch: {
		"data.showInUI": function() {
			if (!this.data.showInUI) {
				this.data.defaultTargetLevel = null;
			}
		},
		"data.canSendToSlack": function() {
			if (!this.data.canSendToSlack) {
				this.data.defaultTargetChannel = null;
			}
		}
	},
	methods: {
		copyToClipboard(value) {
			copyToClipboard(value);
			this.$q.notify(''+value+' copied to clipboard');
		},
	},
	computed: {
	}
}
</script>
<style lang="css">



</style>