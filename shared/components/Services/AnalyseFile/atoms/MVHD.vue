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
				<td><b>Time Scale</b></td>
				<td>{{timeScale}}<span v-if="timeScale"> per second</span>&nbsp;</td>
			</tr>
			<tr>
				<td><b>Duration</b></td>
				<td>{{durationHuman}}<span v-if="durationHuman"> seconds</span>&nbsp;</td>
			</tr>
			<tr>
				<td><b>Preffered Rate</b></td>
				<td>{{prefferedRate}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Preffered Volume</b></td>
				<td>{{prefferedVolume}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Preview Time</b></td>
				<td>{{previewTime}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Preview Duration</b></td>
				<td>{{previewDuration}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Poster Time</b></td>
				<td>{{posterTime}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Selection Time</b></td>
				<td>{{selectionTime}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Selection Duration</b></td>
				<td>{{selectionDuration}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Current Time</b></td>
				<td>{{currentTime}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Next Track ID</b></td>
				<td>{{nextTrackId}}&nbsp;</td>
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

			timeScale: null,
			duration: null,
			durationHuman: null,

			prefferedRate: null,
			prefferedVolume: null,

			previewTime: null,
			previewDuration: null,

			posterTime: null,

			selectionTime: null,
			selectionDuration: null,

			currentTime: null,
			nextTrackId: null,
		}
	},

	methods: {
		async initialize() {
			this.initializing = true;

			await new Promise((res)=>{ setTimeout(res, 200); });

			try {
				const baseDate = Math.floor((new Date(1904, 0, 1, 0, 0, 0)).getTime());

				this.version = (await this.atom.unpackFromOffset(8,1,'>B'))[0];

				// 3 bytes - Three bytes of space for future movie header flags.

				const creationTime = (await this.atom.unpackFromOffset(12,4,'>I'))[0];
				this.creationDate = new Date(baseDate + creationTime * 1000);

				const modificationTime = (await this.atom.unpackFromOffset(16,4,'>I'))[0];
				this.modificationDate = new Date(baseDate + modificationTime * 1000);

				this.timeScale = (await this.atom.unpackFromOffset(20,4,'>I'))[0];
				this.duration = (await this.atom.unpackFromOffset(24,4,'>I'))[0];

				this.durationHuman = Math.ceil(this.duration / this.timeScale);

				this.prefferedRate = (1 << 16) / (await this.atom.unpackFromOffset(28,4,'>I'))[0];
				this.prefferedVolume = (1 << 8) / (await this.atom.unpackFromOffset(32,2,'>h'))[0];

				// 10 bytes - reserved
				// 36 bytes - Matrix structure

				this.previewTime = (await this.atom.unpackFromOffset(80,4,'>I'))[0];
				this.previewDuration = (await this.atom.unpackFromOffset(84,4,'>I'))[0];

				this.posterTime = (await this.atom.unpackFromOffset(88,4,'>I'))[0];

				this.selectionTime = (await this.atom.unpackFromOffset(92,4,'>I'))[0];
				this.selectionDuration = (await this.atom.unpackFromOffset(96,4,'>I'))[0];

				this.currentTime = (await this.atom.unpackFromOffset(100,4,'>I'))[0];

				this.nextTrackId = (await this.atom.unpackFromOffset(104,4,'>I'))[0];


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