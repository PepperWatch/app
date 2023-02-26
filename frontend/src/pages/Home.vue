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
            <div class="col-12 col-md-8 relative-position video-panes rightPane">

                <div class="row q-col-gutter-md">
                    <h5 class="text-primary">PepperWatch Sample</h5>

                    <div style="width: 100%; padding-top: 0;">

    <div class="home-feature-card">
        <span>
            <q-icon name="video_file" color="secondary" />
        </span>

        <div>Media for container. 1.1MB<a href="https://pepperwatch.github.io/v/container.mp4" target="_blank" download="container.mp4"><q-icon name="download" color="secondary" /></a></div>

    </div>
    <div class="home-feature-card">
        <span>
            <q-icon name="note_add" color="secondary" />
        </span>

        <div>Media to cipher. 6.1MB<a href="https://pepperwatch.github.io/v/content.mp4" target="_blank" download="content.mp4"><q-icon name="download" color="secondary" /></a></div>

    </div>
    <div class="home-feature-card">
        <span>
            <q-icon name="enhanced_encryption" color="secondary" />
        </span>

        <div>Encoded MP4. 7.3MB<a href="https://pepperwatch.github.io/v/encoded.mp4" target="_blank" download="encoded.mp4"><q-icon name="download" color="secondary" /></a></div>
    </div>

                    </div>
                    <div style="width: 100%; text-align: center;">
                        Key: <span id="the_key_content">a354a4eec607fcf4cc0091f91742687c88587bed8c6c586824273ecec0e5ce4a</span>

                        <br>
                        Try to <router-link to="/decode">decode it</router-link>
                    </div>

                    <div >
                    <h5 class="text-primary"><q-icon name="health_and_safety" />PepperWatch is a client-side in-browser application</h5>

                    <p class="text-primary">
The PepperWatch app doesn't send anything to servers and doesn't store any of your data or media files. Doesn't even set cookies in your browser. While we try to maximize your privacy, we can't help you restore encoded data in any way. Nobody knows you were here.
                    </p>
                    <p class="text-primary">
Furthermore, PepperWatch is an <a href="https://github.com/PepperWatch/app" target="_blank">open-source</a> application. And you are free to install and run it on your server or the local machine.
                    </p>

<h5 class="text-primary"><q-icon name="vpn_lock" />PepperWatch encodes your media and hides it</h5>

                    <p class="text-primary">

Uses <a href="https://en.wikipedia.org/wiki/Advanced_Encryption_Standard" target="_blank">AES-256</a> encryption to cipher data and store it in hidden parts of MP4 files. Nobody knows it's there and even if they know they can't decrypt it.
                    </p>
                    <p class="text-primary">

We also offer a free browser-based <router-link to="/analyse">MP4 analyzer</router-link>, so you can try to find something hidden in your media files.
                    </p>

<h5 class="text-primary"><q-icon name="sms" />PepperWatch offers Telegram storage UI (totally optional)</h5>

                    <p class="text-primary">

You can <router-link to="/telegram">connect to your Telegram account</router-link> and upload/download your private media to your Telegram account for free. Use it in the same way you use your Telegram messenger. With an additional layer of security and privacy. Even if somebody gets access to your telegram account - they can't decrypt your pepperwatch media files stored there.
                    </p>

                    </div>
                </div>

                <q-inner-loading :showing="isLoading">
                    <q-spinner-rings size="50px" color="primary" />
                </q-inner-loading>

            </div>

        </div>
    </div>

</template>

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
    .home-feature-card {
        width: 33%;
        max-width: 33%;
        overflow: hidden;
        float: left;
        padding: 0 !important;
        margin: 0 !important;
        display: block;
    }
    .home-feature-card img {
        max-width: 100%;
    }
    .home-feature-card span {
        display: block;
        text-align: center;
        font-size: 5rem !important;
    }
    .home-feature-card div {
        text-align: center;
        display: block;
    }
</style>
<script>
// import HomeCard from '../components/HomeCard';
import Icon from 'shared/components/Icon';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        // HomeCard,
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


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    .rightPane .text-primary a {
        color: var(--q-primary) !important;
    }
    .rightPane .text-primary a:hover {
        text-decoration: none;
    }

    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    h5 {
        margin: 0 0 12px 0;
        font-size: 1.2rem !important;
    }

    h5 i {
        margin-right: 8px;
        font-size: 1.5rem !important;
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

