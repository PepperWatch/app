<template>

    <div>
        <q-scroll-observer @scroll="onScroll" />

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4 q-mb-sm">
                <div>
                    <!-- <h1 class="text-primary serif" style="margin-top: 0; margin-bottom: 16px;">Another level of security for your media files</h1> -->

                    <h5 class="text-primary">Another level of security for your media files</h5>

                    <p class="text-primary">
                        Hiding your private media files can help to prevent them from being shared or viewed by unauthorized individuals.
                    </p>
                    <!-- <p class="text-primary">
                        <router-link to="/howitworks" class="text-primary">How It Works?</router-link>
                    </p> -->
                    <p class="text-primary">
                        Steganography is a form of encryption that involves hiding sensitive data within media files such as images, audio, or video. PepperWatch's algorithm encodes your media files within the file in such a way that it can only be decoded with a password, or key. The files are invisible to the viewer without password/key due to use of encryption algorithms, meaning that contents remain secure. Additionally, the data are encrypted to ensure the security of the hidden information.
                    </p>
                    <p class="text-primary">
                        <b>Ready?</b><br />

                        <q-btn unelevated color="primary" size="md" to="/offline">Encode</q-btn>&nbsp;
                        <q-btn unelevated color="primary" size="md" to="/decode">Decode</q-btn>
                        <br />or<br />
                        <q-btn unelevated color="primary" size="md" to="/telegram">Use your Telegram account</q-btn>
                        <br />as a free cloud storage<br />
                    </p>
                    <p class="text-primary q-gutter-sm">
                        <b>don't forget to follow us:</b><br />

                        <q-btn unelevated outline color="white" text-color="primary" size="sm" target="_blank" href="https://github.com/PepperWatch/app"><Icon forWhat="github" />&nbsp;github</q-btn>
                        <q-btn unelevated outline color="white" text-color="primary" size="sm" target="_blank" href="https://twitter.com/pepper_watch"><Icon forWhat="twitter" />&nbsp;twitter</q-btn>
                        <q-btn unelevated outline color="white" text-color="primary" size="sm" to="/contact">contact us</q-btn>
                    </p>
                </div>
            </div>
            <div class="col-12 col-md-8 relative-position video-panes">

                <div class="row q-col-gutter-md">
                    <div class="col-4">

                        <div class="column-inner-1 column-inner-shift" ref="column_1">
                            <template v-for="item in items.c1"  :key="item._id" >
                                <HomeCard :video="item" @loaded="homeCardLoaded" />
                            </template>
                        </div>

                    </div>
                    <div class="col-4">

                        <div class="column-inner-2 " ref="column_2">
                            <template v-for="item in items.c2"  :key="item._id" >
                                <HomeCard :video="item" @loaded="homeCardLoaded" />
                            </template>
                        </div>

                    </div>
                    <div class="col-4">

                        <div class="column-inner-1 column-inner-shift"  ref="column_3">
                            <template v-for="item in items.c3"  :key="item._id" >
                                <HomeCard :video="item" @loaded="homeCardLoaded" />
                            </template>
                        </div>

                    </div>
                </div>

                <q-inner-loading :showing="isLoading">
                    <q-spinner-rings size="50px" color="primary" />
                </q-inner-loading>

            </div>

        </div>
    </div>

</template>

<script>
import HomeCard from '../components/HomeCard';
import Icon from 'shared/components/Icon';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        HomeCard,
        Icon,
    },
	data() {
		return {
            items: {
                c1: [],
                c2: [],
                c3: [],
            },
            itemsCount: 0,
            loadedCount: 0,
            itemsToAdd: [],
            itemsToAddPriority: [],
            isLoading: false,
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
        homeCardLoaded() {
            this.loadedCount++;

            setTimeout(()=>{
                this.addWaitingItem();

                if (this.loadedCount == 3) {
                    this.addWaitingItem();
                }
            }, 50);
        },
        addWaitingItem() {
            if (!this.itemsToAdd.length && !this.itemsToAddPriority.length) {
                return;
            }

            let lowestHeightIsOnId = 1;
            let lowestHeight = Infinity;

            for (let i = 1; i <= 3; i++) {
                let height = this.$refs['column_'+i].offsetHeight;
                if (height < lowestHeight) {
                    lowestHeight = height;
                    lowestHeightIsOnId = i;
                }
            }

            console.log('lowestHeight', lowestHeightIsOnId, lowestHeight);

            let waitingItem = null;
            if (this.itemsToAddPriority.length && Math.random() > 0.5) {
                waitingItem = this.itemsToAddPriority.shift();
            } else if (this.itemsToAdd.length) {
                waitingItem = this.itemsToAdd.shift();
            } else {
                waitingItem = this.itemsToAddPriority.shift();
            }

            this.itemsCount++;

            this.items['c'+lowestHeightIsOnId].push(waitingItem);
        },
        async loadItems() {
            return;

            // this.isLoading = true;

            // this.items = {
            //     c1: [],
            //     c2: [],
            //     c3: [],
            // };

            // const chainType = this.$store.solana.selectedChainType;
            // const resp = await this.$store.api.post({
            //     path: 'api/home',
            //     data: {
            //         chainType: chainType,
            //     }});

            // // random order
            // const array = resp.items;
            // array.sort(() => Math.random() - 0.5);


            // this.itemsToAdd = array.filter((item)=>{ return !item.isPriorityOnHomepage; });
            // this.itemsToAddPriority = array.filter((item)=>{ return item.isPriorityOnHomepage; });

            // // let i = 1;
            // // for (let item of resp.items) {
            // //     this.items['c'+i].push(item);

            // //     i++;
            // //     if (!this.items['c'+i]) {
            // //         i = 1;
            // //     }
            // // }
            // this.addWaitingItem();

            // this.isLoading = false;

            // this.items = resp.items;
            // const resp = await this.collection.list();
            // console.error(resp.items);
        },
	},
    computed: {
        chainType: function() {
            return false;
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

<style scoped="scoped">
    .q-inner-loading--dark {
        background: transparent;
    }
    .q-inner-loading {
        background: transparent;
    }
    .video-panes {
        min-height: 20vh;
    }
</style>

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

    .serif {
        font-family: Helvetica,Arial,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif,BlinkMacSystemFont,"Segoe UI",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    }

</style>

