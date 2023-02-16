<template>
	<div class="q-pb-md">
        <q-btn v-if="!availableChunks.length" unelevated dense  color="primary" @click.prevent="initialize" label="Find Chunks"
        :loading="initializing" />


		<q-select v-if="availableChunks.length" v-model="selectedChunk" color="primary" label-color="primary"  outlined :options="availableChunks" label="Select Chunk" options-html dark>
			<template v-slot:after>
				<q-btn icon="download" color="primary" unelevated square @click="download"/>
			</template>
		</q-select>
	</div>
</template>
<style type="text/css">
	.optionHeader {
		color: white;
	}
	.optionVideo {
		color: #7D3C98;
	}
	.optionAudio {
		color: green;
	}
	.optionUnknown {
		color: red;
	}
</style>
<script>
export default {
	props: {
		// ...your custom props
		file: Object,
		atom: Object,
		fileAtoms: Array,
	},

	components: {
	},

	emits: [],

	data() {
		return {
			initializing: false,
			info: [],
			selectedChunk: null,
			availableChunks: [],
		}
	},

	methods: {
		async download() {
			if (!this.selectedChunk) {
				return false;
			}

            const chunk = await this.file.getSlice(this.selectedChunk.offset, this.selectedChunk.length);

            const blob = new Blob([chunk], {type: 'binary/octet-stream' });

            let blobUrl = window.URL.createObjectURL(blob);
            let link = document.createElement("a");
            link.href = blobUrl;

            link.download = this.atom.name+'-'+this.selectedChunk.offset+'-'+(this.selectedChunk.offset + this.selectedChunk.length)+'.bin';

            document.body.appendChild(link);
            link.innerHTML = "download";
            link.style.display = 'none';
            link.click();

            link.remove();

            window.URL.revokeObjectURL(blobUrl);
		},
		sizeToHuman(size) {
            const sizeI = Math.floor( Math.log(size) / Math.log(1024) );
            return ( size / Math.pow(1024, sizeI) ).toFixed(0) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][sizeI];
		},
		async initialize() {
			this.initializing = true;

			await new Promise((res)=>{ setTimeout(res, 200); });

			try {
				const chunks = [];
				for (let atom of this.fileAtoms) {
					if (atom.name == 'moov') {
						// there should be track items inside
						const tracks = await atom.findAtoms(null, 'trak');
						for (let track of tracks) {
							const chunksInfo = await track.getChunksInfo();
							const trackType = (track.isVideo() ? 'video' : 'audio');
							for (let chunk of chunksInfo) {
								chunk.type = trackType;
								chunk.label = '<span class="'+(trackType == 'video' ? 'optionVideo' : 'optionAudio')+'">@'+chunk.offset+', '+this.sizeToHuman(chunk.length)+' of '+chunk.type+'</span>';
								chunk.value = chunk.offset;


								chunks.push(chunk);

							}
						}

					}
				}

				chunks.sort((a, b) => a.offset - b.offset);

				const headerChunk = {
					type: 'header',
					label: '<span class="optionHeader">@'+this.atom.start+', 8 B header</span>',
					value: this.atom.start,
					offset: this.atom.start,
					length: 8,
					html: true,
				};

				chunks.unshift(headerChunk);

				// find unknown spaces
				for (let i = 0; i < chunks.length - 1; i++) {
					const chunk = chunks[i];
					const nextChunk = chunks[i+1];

					if (nextChunk && nextChunk.offset > chunk.offset + chunk.length) {
						// there's strange space
						const offset = chunk.offset + chunk.length;
						const length = nextChunk.offset - offset;
						const strangeChunk = {
							type: 'unknown',
							label: '<span class="optionUnknown">@'+offset+', '+this.sizeToHuman(length)+' of unknown</span>',
							value: offset,
							length: length,
							offset: offset,
						};

						chunks.push(strangeChunk);
					}
				}

				chunks.sort((a, b) => a.offset - b.offset);


				// is there empty space at the end
				if (chunks[chunks.length - 1].offset + chunks[chunks.length - 1].length < this.atom.size + this.atom.start) {
					const length = this.atom.size + this.atom.start - (chunks[chunks.length - 1].offset + chunks[chunks.length - 1].length);
					const offset = chunks[chunks.length - 1].offset + chunks[chunks.length - 1].length;

					const strangeChunk = {
						type: 'unknown',
						label: '<span class="optionUnknown">@'+offset+', '+this.sizeToHuman(length)+' of unknown</span>',
						value: offset,
						length: length,
						offset: offset,
					};

					chunks.push(strangeChunk);
				}


				this.availableChunks = chunks;
			} catch(e) {
				console.error(e);
				this.availableChunks = [];
			}

			if (this.availableChunks.length) {
				setTimeout(()=>{
					this.selectedChunk = this.availableChunks[0];
				}, 100);
			}

			this.initializing = false;
		},
	},

	watch: {
	}
}
</script>