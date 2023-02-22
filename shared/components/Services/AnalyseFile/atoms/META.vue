<template>
	<div class="q-pb-md">

		<table class="atomTable">
<!-- 			<tr>
				<td><b>MVHD Version</b></td>
				<td>{{version}}&nbsp;</td>
			</tr> -->
		<template v-for="meta in metas" v-bind:key="meta.name">
			<tr>
				<td valign="top"><b>{{meta.name}}</b></td>
				<td valign="top">
					{{meta.value}}&nbsp;
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
// import DateHuman from 'shared/components/Helpers/DateHuman';


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

			version: null,
			metas: [],
		}
	},

	methods: {
		async initialize() {
			this.initializing = true;

			await new Promise((res)=>{ setTimeout(res, 200); });

			try {
				const baseDate = Math.floor((new Date(1904, 0, 1, 0, 0, 0)).getTime());

				this.version = (await this.atom.unpackFromOffset(8,1,'>B'))[0];

				let offset = 8;
				do {
					const size = (await this.atom.unpackFromOffset(offset,4,'>I'))[0];
					const type = (await this.atom.unpackFromOffset(offset + 4,4,'>4s'))[0];
					// const size = (await this.atom.unpackFromOffset(offset,4,'>4s'))[0];
					console.log(size, type, this.atom.header_size, offset);

					if (type == 'ilst') {
						let lOffset = offset + 8;
						do {
							const lSize = (await this.atom.unpackFromOffset(lOffset,4,'>I'))[0];
							const lType = (await this.atom.unpackFromOffset(lOffset + 4,4,'>4s'))[0];
							// const lSizeInner = (await this.atom.unpackFromOffset(lOffset + 8,4,'>I'))[0];
							const lData = (await this.atom.unpackFromOffset(lOffset + 12,4,'>4s'))[0];
							const flags0 = (await this.atom.unpackFromOffset(lOffset + 16,4,'>I'))[0];
							// const flags1 = (await this.atom.unpackFromOffset(lOffset + 20,4,'>I'))[0];

							if (lData === 'data') {
								let data = null;
								if (flags0 == 1) {
									// string
									const lengthToRead = lSize - 24;
									data = (await this.atom.unpackFromOffset(lOffset + 24,lengthToRead,'>'+lengthToRead+'s'))[0];
								}

								this.metas.push({
									name: lType,
									value: data,
								});

								// console.log('f4', lOffset, lSize, lSizeInner, lType, lData, flags0, flags1, data);
								lOffset+=lSize;
							} else {
								lOffset+=1;
							}
						} while(lOffset < size + offset);
					}

					if (!size) {
						offset += 4;
					} else {
						offset += size;
					}
				} while (offset < this.atom.size);

				console.log(baseDate);


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