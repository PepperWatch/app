<template>

	<div :class="classComputed">

		<div class="userWidgets">
			<draggable
				class="container"
				v-model="widgetsMade"
				:disabled="!aligning"
				@end="onMoved"
				group="people"
				item-key="id">

				<template #item="{element}">
					<component v-bind:is="element.widget"></component>
				</template>
			</draggable>
		</div>

		<div class="availableWidgets">
			<h6 class="text-primary">Available Widgets</h6>
			<draggable class="availableWidgetsDraggable" @end="onMoved" element="span" v-model="widgetsAvailable" item-key="id" group="people">
				<template #item="{element}">
					<component v-bind:is="element.widget"></component>
				</template>
			</draggable>
		</div>

	</div>

</template>

<style lang="css">

    .container {
        display: flex;
        flex-flow: column wrap;
        align-content: space-between;
        /* Your container needs a fixed height, and it
        * needs to be taller than your tallest column. */
        height: 2000px;
    }


    .q-card {
        width: 32%;
        margin-bottom: 2%; /* Optional */
    }

    /* Re-order items into 3 rows */
    .q-card:nth-child(3n+1) { order: 1; }
    .q-card:nth-child(3n+2) { order: 2; }
    .q-card:nth-child(3n)   { order: 3; }

    /* Force new columns */
    .container::before,
    .container::after {
        content: "";
        flex-basis: 100%;
        width: 0;
        order: 2;
    }

    @media (max-width: 1024px) {
        .q-card {
            width: 49%;
            margin-bottom: 2%; /* Optional */
        }
        .q-card:nth-child(2n+1) { order: 1; }
        .q-card:nth-child(2n)   { order: 2; }
    }

    @media (max-width: 800px) {
        .q-card {
            width: 100%;
            margin-bottom: 2%; /* Optional */
        }
        .q-card:nth-child(2n+1) { order: 1; }
        .q-card:nth-child(2n)   { order: 1; }
    }

    .aligning .container {
		display: block;
		float: left;
		width: 33%;
    }

    .aligning .q-card {
		width: 99%;
		cursor: move;
    }

    .availableWidgets {
		float: right;
		width: 33%;
		display: block;
		visibility: hidden;
    }

    .aligning .availableWidgets {
		visibility: visible;
    }

    .availableWidgetsDraggable {
		border: 3px dashed #77777777;
		padding: 12px;
		opacity: 0.7;
    }


</style>

<script>
import { shallowRef} from 'vue';

import availableWidgets from './Available/';

import draggable from 'vuedraggable';

export default {
	name: 'WidgetContainer',
	props: {
		widgets: {
			type: Array,
			default: ()=>['Time', 'Last7Days', 'Notifications'],
		},
		aligning: {
			type: Boolean,
			default: false,
		}
	},
	data() {
		return {
			drag: false,
			widgetsMade: [],
			widgetsAvailable: [],
		};
	},
	watch: {
		aligning: function() {
			// if switching aligning on - begin to initialize available widgets
			if (this.__availableInitialized) {
				return true;
			}

			this.$nextTick(()=>{
				this.__availableInitialized = true;

				this.widgetsAvailable = [];
				for (let key in availableWidgets) {
					let alreadyMade = false;
					for (let made of this.widgetsMade) {
						if (made.name == key) {
							alreadyMade = true;
						}
					}

					if (!alreadyMade) {
						this.widgetsAvailable.push({
							widget: shallowRef(availableWidgets[key]),
							name: key,
						});
					}
				}
			});
		}
	},
	computed: {
		classComputed: function() {
			if (this.aligning) {
				return 'aligning';
			}
			return '';
		},
	},
	components: {
		draggable
	},
	methods: {
		onMoved() {
			this.persist();
		},
		persist() {
			const data = [];
			for (let widget of this.widgetsMade) {
				data.push({
					name: widget.name,
				});
			}

			this.$q.localStorage.set('widgets_data', data);
		},
	},
	beforeMount: function() {
		const stored = this.$q.localStorage.getItem('widgets_data');

		let takeDataFrom = this.widgets;
		if (stored) {
			takeDataFrom = stored;
		}

		// const widgetsMadeNames = [];
		this.widgetsMade = takeDataFrom.map((item)=>{
				let componentName = item.name ? item.name : (''+item);
				// widgetsMadeNames.push(componentName);

				return {
					widget: shallowRef(availableWidgets[componentName]),
					name: componentName,
				};
			});

		this.widgetsAvailable = [];
		// for (let key in availableWidgets) {
		// 	if (widgetsMadeNames.indexOf(key) === -1) {
		// 		this.widgetsAvailable.push({
		// 			widget: shallowRef(availableWidgets[key]),
		// 			name: key,
		// 		});
		// 	}
		// }

	},
	mounted: async function() {
	}
}
</script>
