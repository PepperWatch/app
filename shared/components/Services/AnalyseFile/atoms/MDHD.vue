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
				<td><b>Language</b></td>
				<td>{{languageCode}}&nbsp;</td>
			</tr>
			<tr>
				<td><b>Quality</b></td>
				<td>{{quality}}&nbsp;</td>
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

			languageCode: null,
			languageHuman: null,

			quality: null,
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
				if (creationTime) {
					this.creationDate = new Date(baseDate + creationTime * 1000);
				}

				const modificationTime = (await this.atom.unpackFromOffset(16,4,'>I'))[0];
				if (modificationTime) {
					this.modificationDate = new Date(baseDate + modificationTime * 1000);
				}

				this.timeScale = (await this.atom.unpackFromOffset(20,4,'>I'))[0];
				this.duration = (await this.atom.unpackFromOffset(24,4,'>I'))[0];

				this.durationHuman = Math.ceil(this.duration / this.timeScale);

				this.languageCode = (await this.atom.unpackFromOffset(28,2,'>h'))[0];
				this.quality = (await this.atom.unpackFromOffset(30,2,'>h'))[0];

				if (this.languageCode > 138) {
					// https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap4/qtff4.html#//apple_ref/doc/uid/TP40000939-CH206-27005
					const char1 = this.languageCode >> 10;
					const char2 = (this.languageCode >> 5) % 32;
					const char3 = this.languageCode % 32;
					this.languageCode = String.fromCharCode(char1+0x60)+String.fromCharCode(char2+0x60)+String.fromCharCode(char3+0x60);
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