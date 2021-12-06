<template>

	<q-img :src="thumbURLComputed" @mouseenter="mouseenter" @click="click" fit="cover" :ratio="16/9">
	<div class="absolute-bottom text-subtitle2 text-center token_address">
		{{ token }}
	</div>
	</q-img>

</template>
<script>

export default {
	name: 'MintedToken',
	props: {
		token: String, // UserFile
	},
	data() {
		return {
			thumbURL: null,
		}
	},
	mounted: function() {
	},
	watch: {
	},
	methods: {
		mouseenter: function() {
			this.loadTheThumb();
		},
		click: function() {
			this.$router.push('/v/'+this.token);
		},
		loadTheThumb: async function() {
			if (this._initPromise) {
				return await this._initPromise;
			}
			this._initPromiseResolver = null;
			this._initPromise = new Promise((res)=>{
				this._initPromiseResolver = res;
			});

			const request = new Request('https://ipfs.infura.io/ipfs/'+this.token);
			const response = await fetch(request);
			const json = await response.json();

			console.error(json);
			const image = json.image;

			this.thumbURL = 'https://ipfs.infura.io/ipfs/'+(image.split('ipfs://').join(''));

			this._initPromiseResolver();
		}
	},
	computed: {
		thumbURLComputed: function() {
			if (this.thumbURL) {
				return this.thumbURL;
			}

			return "data:image/svg+xml,%3C%3Fxml version='1.0' %3F%3E%3Csvg height='443.88' id='svg1825' width='439.488' xmlns='http://www.w3.org/2000/svg' xmlns:cc='http://creativecommons.org/ns%23' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd' xmlns:svg='http://www.w3.org/2000/svg'%3E%3Cdefs id='defs1827'%3E%3Cmarker id='ArrowEnd' markerHeight='3' markerUnits='strokeWidth' markerWidth='4' orient='auto' refX='0' refY='5' viewBox='0 0 10 10'%3E%3Cpath d='M 0 0 L 10 5 L 0 10 z' id='path1830'/%3E%3C/marker%3E%3Cmarker id='ArrowStart' markerHeight='3' markerUnits='strokeWidth' markerWidth='4' orient='auto' refX='10' refY='5' viewBox='0 0 10 10'%3E%3Cpath d='M 10 0 L 0 5 L 10 10 z' id='path1833'/%3E%3C/marker%3E%3C/defs%3E%3Cg id='g1835'%3E%3Cg id='g1837'%3E%3Cpath d='M 219.744 443.88C 341.103 443.88 439.488 344.51 439.488 221.94C 439.488 99.368 341.103 0 219.744 0C 98.387 0 0 99.368 0 221.94C 0 344.51 98.387 443.88 219.744 443.88z' id='path1839' style='stroke:none; fill:%23000000'/%3E%3Cpath d='M 219.744 221.94' id='path1841' style='stroke:none; fill:%23000000'/%3E%3C/g%3E%3Cg id='g1843'%3E%3Cpath d='M 219.744 392.714C 313.128 392.714 388.83 316.255 388.83 221.94C 388.83 127.623 313.128 51.166 219.744 51.166C 126.362 51.166 50.659 127.623 50.659 221.94C 50.659 316.255 126.362 392.714 219.744 392.714z' id='path1845' style='stroke:none; fill:%23ffffff'/%3E%3Cpath d='M 219.744 221.94' id='path1847' style='stroke:none; fill:%23ffffff'/%3E%3C/g%3E%3Cg id='g1849'%3E%3Cpath d='M 196.963 300.274L 246.494 300.172L 246.494 261.69C 246.494 251.252 251.36 241.39 264.38 232.849C 277.399 224.312 313.744 206.988 313.744 161.44C 313.744 115.89 275.577 84.582 243.494 77.94C 211.416 71.298 176.659 75.668 151.994 102.69C 129.907 126.887 125.253 146.027 125.253 188.255L 174.744 188.255L 174.744 178.44C 174.744 155.939 177.347 132.186 209.494 125.69C 227.04 122.144 243.488 127.648 253.244 137.19C 264.404 148.102 264.494 172.69 246.711 184.933L 218.815 203.912C 202.543 214.35 196.963 225.971 196.963 243.051L 196.963 300.274z' id='path1851' style='stroke:none; fill:%23000000'/%3E%3Cg id='g1853'%3E%3Cpath d='M 196.638 370.692L 196.638 319.687L 246.85 319.687L 246.85 370.692L 196.638 370.692z' id='path1855' style='stroke:none; fill:%23000000'/%3E%3Cpath d='M 221.744 345.19' id='path1857' style='stroke:none; fill:%23000000'/%3E%3C/g%3E%3C/g%3E%3C/g%3E%3C/svg%3E";
		}
	}
}
</script>
<style scoped="scoped">
	.token_address {
		font-size: 8px;
	}
</style>
