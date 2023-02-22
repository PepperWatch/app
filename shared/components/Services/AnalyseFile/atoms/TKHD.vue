<template>
	<div class="q-pb-md">

		<table class="atomTable">
			<tr>
				<td><b>MVHD Version</b></td>
				<td>{{version}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Creation Time</b></td>
				<td><DateHuman :value="creationDate" v-if="creationDate" />&nbsp;</td>
			</tr>
			<tr>
				<td><b>Modification Time</b></td>
				<td><DateHuman :value="modificationDate" v-if="modificationDate" />&nbsp;</td>
			</tr>
			<tr>
				<td><b>Track ID</b></td>
				<td>{{trackId}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Duration</b></td>
				<td>{{durationHuman}}<span v-if="durationHuman && timeScale != 1"> seconds</span>&nbsp;</td>
			</tr>
			<tr>
				<td><b>Layer</b></td>
				<td>{{layer}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Alternate Group</b></td>
				<td>{{alternateGroup}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Volume</b></td>
				<td>{{volume}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Width</b></td>
				<td>{{width}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Height</b></td>
				<td>{{height}}&nbsp;</td>
			</tr>
		</table>
	</div>
</template>
<style type="text/css">
	.atomTable {
		border-spacing: 0 !important;
	}
</style>
<script>
import DateHuman from 'shared/components/Helpers/DateHuman';


export default {
	props: {
		// ...your custom props
		file: Object,
		atom: Object,
		fileAtoms: Array,
	},

	components: {
		DateHuman,
	},

	emits: [],

	data() {
		return {
			initializing: false,

			version: null,

			creationDate: null,
			modificationDate: null,

			trackId: null,

			timeScale: null,
			duration: null,
			durationHuman: null,

			layer: null,
			alternateGroup: null,

			volume: null,

			width: null,
			height: null,
		}
	},

	methods: {
		async initialize() {
			this.initializing = true;

			await new Promise((res)=>{ setTimeout(res, 200); });

			try {

				this.timeScale = 1;

				try {
					for (let atom of this.fileAtoms) {
						if (atom.name == 'moov') {
							// there should be track items inside
							const mvhds = await atom.findAtoms(null, 'mvhd');
							if (mvhds.length) {
								this.timeScale = (await mvhds[0].unpackFromOffset(20,4,'>I'))[0];
							}
						}
					}
				} catch(e) {
					console.error(e);
				}

				const baseDate = Math.floor((new Date(1904, 0, 1, 0, 0, 0)).getTime());

				this.version = (await this.atom.unpackFromOffset(8,1,'>B'))[0];

				// 3 bytes - Three bytes of space for future movie header flags.

				const creationTime = (await this.atom.unpackFromOffset(12,4,'>I'))[0];
				if (creationTime) {
					this.creationDate = new Date(baseDate + creationTime * 1000);
				}

				const modificationTime = (await this.atom.unpackFromOffset(16,4,'>I'))[0];
				if (modificationTime) {
					this.modificationDate = new Date(baseDate + modificationTime * 1000);
				}

				this.trackId = (await this.atom.unpackFromOffset(20,4,'>I'))[0];

				// 4 bytes - reserved

				const duration = (await this.atom.unpackFromOffset(28,4,'>I'))[0];
				this.durationHuman = Math.ceil(duration / this.timeScale);

				// 8 bytes - reserved
				this.layer = (await this.atom.unpackFromOffset(40,2,'>h'))[0];
				this.alternateGroup =  (await this.atom.unpackFromOffset(42,2,'>h'))[0];
				this.volume = (await this.atom.unpackFromOffset(44,2,'>h'))[0];

				if (this.volume) {
					this.volume = (1 << 8) / this.volume;
				}

				// 2 bytes - reserved
				// 36 bytes - Matrix structure
				this.width = (await this.atom.unpackFromOffset(84,4,'>I'))[0] >> 16;
				this.height = (await this.atom.unpackFromOffset(88,4,'>I'))[0] >> 16;

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