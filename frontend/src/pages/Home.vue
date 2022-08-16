<template>

    <div>
        <q-scroll-observer @scroll="onScroll" />

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
                <h1 class="text-primary" style="margin-top: 0;     margin-bottom: 16px;">NFT as TV</h1>

                <h5 class="text-primary">an experiment on the Solana blockchain</h5>

                <p class="text-primary">
                    Play with our <router-link to="/encode" class="text-primary">browser-based video editor</router-link>, encode your video files and mint them as NFTs to the blockchain. PepperWatch uses a sort of steganography to encode the private part of the video inside the public one. Playable in any media player, it has private media encoded inside.
                </p>
                <p class="text-primary">
                    NFT owners can set any price for an encoded part of NFT, so anybody can purchase a unique key and watch NFT's private media.
                </p>
                <p class="text-primary">
                    <b>What is the economy behind it?</b><br />

                    We are still working on it. Currently, it's:<br />

                    <ul class="text-primary">
                        <li>NFT owner receives 80%</li>
                        <li>NFT creator receives 10%</li>
                        <li>PepperWatch receives 10%</li>
                    </ul>
                </p>
                <p class="text-primary">
                    <a href="https://github.com/PepperWatch/app" target="_blank" class="text-primary">github</a>
                    &nbsp;&nbsp;&nbsp;
                    <a href="https://twitter.com/pepper_watch" target="_blank" class="text-primary">twitter</a>
                </p>
            </div>
            <div class="col-12 col-md-8">

                <div class="row q-col-gutter-md">
                    <div class="col-4">

                        <div class="column-inner-1 column-inner-shift">
                            <template v-for="item in items.c1"  :key="item._id" >
                                <HomeCard :video="item" />
                            </template>
                        </div>

                    </div>
                    <div class="col-4">

                        <div class="column-inner-2 ">
                            <template v-for="item in items.c2"  :key="item._id" >
                                <HomeCard :video="item" />
                            </template>
                        </div>

                    </div>
                    <div class="col-4">

                        <div class="column-inner-1 column-inner-shift">
                            <template v-for="item in items.c3"  :key="item._id" >
                                <HomeCard :video="item" />
                            </template>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </div>

</template>

<script>
import HomeCard from '../components/HomeCard';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        HomeCard,
    },
	data() {
		return {
            items: {
                c1: [],
                c2: [],
                c3: [],
            },
		}
	},
    watch: {
    },
	methods: {
        onScroll(info) {
            const top = info.position.top;
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            const pc = (top / (document.body.scrollHeight-vh));
            const shift = 1 - (10 * pc);

            document.querySelectorAll('.column-inner-shift').forEach((elem)=>{
                elem.style.transform = 'translate3d(0px, '+shift+'vw, 0px)';
            });
        },
        async loadItems() {
            this.items = {
                c1: [],
                c2: [],
                c3: [],
            };

            const chainType = this.$store.solana.selectedChainType;
            const resp = await this.$store.api.post({
                path: 'api/home',
                data: {
                    chainType: chainType,
                }});

            let i = 1;
            for (let item of resp.items) {
                this.items['c'+i].push(item);

                i++;
                if (!this.items['c'+i]) {
                    i = 1;
                }
            }

            // this.items = resp.items;
            // const resp = await this.collection.list();
            // console.error(resp.items);
        },
	},
    computed: {
        chainType: function() {
            return this.$store.solana.selectedChainType;
        },
    },
    mounted() {
        this.loadItems();

        this.$watch('chainType', ()=>{
            this.loadItems();
        });

        // this.scrollHandlerDebounced = debounce((info)=>{
        //     const top = info.position.top;
        //     const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        //     const pc = (top / (document.body.scrollHeight-vh));
        //     const shift = -5 + (10 * pc);

        //     document.querySelectorAll('.column-inner-shift').forEach((elem)=>{
        //         elem.style.transform = 'translate3d(0px, '+shift+'vw, 0px)';
        //     });
        // }, 50);
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    h5 {
        margin: 0 0 16px 0;
    }

    .home-card {
        width: 100%;
        margin-bottom: 16px;
        position: relative;
        border-radius: 0 !important;
        cursor: pointer;
    }

    .column-inner-shift {
        transform: translate3d(0px, 1vw, 0px);
    }

    .column-inner-2 {
        /*transform: translate3d(0px, 5vw, 0px);*/
    }

</style>

