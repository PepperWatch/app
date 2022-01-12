<template>

    <q-item class="q-card tag-card" tag="a" :clickable="true" :to="'/tag/'+this.tag">
        <q-item-section>
            <q-item-label>{{ addrAsTitle }}</q-item-label>
            <q-item-label caption lines="2">Secondary line text. Lorem ipsum dolor sit amet, consectetur adipiscit elit.</q-item-label>
        </q-item-section>

        <q-item-section side top>
            <q-item-label caption>5 min ago</q-item-label>
            <q-icon name="star" color="yellow" />
        </q-item-section>
    </q-item>

</template>
<script>

export default {
	name: 'OnChainTag',
	props: {
		tag: String, // UserFile
	},
	data() {
		return {
		}
	},
	mounted: function() {
	},
	watch: {
	},
	methods: {
		// mouseenter: function() {
		// },
		// click: function() {
		// 	this.$router.push('/v/'+this.tag);
		// },
	},
	computed: {
		addrAsTitle() {
			let toRep = this.tag;
			const uniq = ''+Math.random();
			toRep = toRep.split('00').join(uniq);
			toRep = toRep.split('0').join(' ');
			toRep = toRep.split(uniq).join('0');

			return toRep;
		}
	}
}
</script>
<style scoped="scoped">
	.token_address {
		font-size: 8px;
	}
</style>
