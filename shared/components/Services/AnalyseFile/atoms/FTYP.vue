<template>
	<div class="q-pb-md">

		<table class="atomTable">
			<tr>
				<td valign="top"><b>Major Brand</b></td>
				<td valign="top">
					{{majorBrand}}&nbsp;
					<br />{{majorBrandDescription}}&nbsp;
				</td>
			</tr>
			<tr>
				<td valign="top"><b>Minor Version</b></td>
				<td valign="top">{{minorVersion}}&nbsp;</td>
			</tr>
		<template v-for="compatible in compatibles" v-bind:key="compatible.brand">
			<tr>
				<td valign="top"><b>Compatible</b></td>
				<td valign="top">
					{{compatible.brand}}&nbsp;
					<br />{{compatible.description}}&nbsp;
				</td>
			</tr>
		</template>
		</table>
	</div>
</template>
<style type="text/css">
	.atomTable {
		border-spacing: 0 !important;
	}
</style>
<script>
import { atomFTypes } from '../atomFTypes.js';

export default {
	props: {
		// ...your custom props
		file: Object,
		atom: Object,
		fileAtoms: Array,
	},

	components: {
		// DateHuman,
	},

	emits: [],

	data() {
		return {
			initializing: false,

			majorBrand: null,
			majorBrandDescription: null,
			minorVersion: null,

			compatibles: [],
		}
	},

	methods: {
		async initialize() {
			this.initializing = true;

			await new Promise((res)=>{ setTimeout(res, 200); });

			try {
				this.majorBrand = (await this.atom.unpackFromOffset(8,4,'>4s'))[0];
				if (atomFTypes[this.majorBrand]) {
					this.majorBrandDescription = atomFTypes[this.majorBrand];
				}
				this.minorVersion = (await this.atom.unpackFromOffset(12,4,'>I'))[0];

				let offset = 16;
				while (offset < this.atom.size) {
					const compatible = (await this.atom.unpackFromOffset(offset,4,'>4s'))[0];
					offset += 4;
					const description = atomFTypes[compatible] ? atomFTypes[compatible] : '';
					this.compatibles.push({
						brand: compatible,
						description: description,
					});
				}

			} catch(e) {
				console.error(e);
			}

			this.initializing = false;
		},
	},

	mounted() {
		this.initialize();
	},

	watch: {
	}
}
</script>