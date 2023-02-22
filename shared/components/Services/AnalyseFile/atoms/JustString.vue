<template>
	<div class="q-pb-md">

		<table class="atomTable">
			<tr>
				<td valign="top"><b>Content</b></td>
				<td valign="top">
					{{content}}&nbsp;
				</td>
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

			content: null,
		}
	},

	methods: {
		async initialize() {
			this.initializing = true;

			await new Promise((res)=>{ setTimeout(res, 200); });

			try {

				let lengthToRead = this.atom.size - 8;
				if (lengthToRead > 256) {
					lengthToRead = 256;
				}

				this.content = (await this.atom.unpackFromOffset(8,lengthToRead,'>'+lengthToRead+'s'))[0];
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