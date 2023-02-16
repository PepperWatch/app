<template>
	<!-- notice dialogRef here -->
	<q-dialog v-model="showing" @hide="onHide">
		<q-card style="width: 80vw; max-width: 80vw; overflow-x: hidden; min-height: 100px;" class="non-selectable position-relative">
			<q-linear-progress :value="0.6" color="primary" />

            <q-list bordered separator v-if="atoms.length">
                <AnalyseFileDialogAtom v-for="atom in atoms"
                    v-bind:key="atom.start" :atom="atom" :file="tgFile" :fileAtoms="atoms" ref="childsRefs"
                    />
            </q-list>

			<q-inner-loading :showing="!isInitialized">
			<q-spinner-gears size="50px" color="primary" />
			</q-inner-loading>
		</q-card>
	</q-dialog>
</template>
<style type="text/css">
</style>
<script>
import TelegramFile from 'shared/classes/drive/telegram/TelegramFile.js';
import AnalyseFileDialogAtom from './AnalyseFileDialogAtom.vue';

export default {
	props: {
		// ...your custom props
		file: Object,
	},

	components: {
		AnalyseFileDialogAtom,
	},

	emits: ['hide'],

	data() {
		return {
			showing: false,
			tgFile: null,

			isInitialized: false,
			atoms: [],
		}
	},

	methods: {
		async initialize() {
			try {
				await new Promise((res)=>{ setTimeout(res, 200); });
				this.atoms = await this.tgFile.analyse();
				// https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html
			} catch(e) {
				this.atoms = [];
			}
			this.isInitialized = true;
		},
		onHide() {
			this.$emit('hide');
		},
        openAll() {
            // this.$refs.childsRefs.forEach((ref)=>{
            //     ref.openAll();
            // });
        },
	},

	watch: {
		async file() {
			if (this.file) {
				const tgFile = new TelegramFile({
					file: this.file,
					id: (''+Math.random()),
				});

				this.tgFile = tgFile;
				this.initialize(); // no await
				this.showing = true;

				setTimeout(()=>{
					this.openAll();
				}, 1550);
			} else {
				this.showing = false;
				this.isInitialized = false;
				this.atoms = [];
			}
		},
	}
}
</script>