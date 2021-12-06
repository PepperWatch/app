<template>

  <div>

    <div class="video_container">
<q-video
          :ratio="16/9"
          src="https://www.youtube.com/embed/92-T5ZBGZcA"
        />
    </div>

            <h5 class="text-primary">PepperWatch - Pay Per View NFT</h5>

            <h6 class="text-primary">What is PepperWatch?</h6>

            <p>Platform to create, mint and manage pay per view video NFTs</p>

            <h6 class="text-primary">Are you talking about unlockable content that lives off-chain?</h6>

            <p>No, actually. It's unlockable, but everything is on-chain. Both public and private versions are stored on the same ipfs file. Downloadable and may be distributed over any transport. Blockchain cryptography algorithms used to extract private media so it may be watched once purchased.</p>

            <h6 class="text-primary">What? How?</h6>

            <p>PepperWatch uses a sort of steganography to encode the private part of the video inside the public one. Playable in any media player, it has private media encoded inside.</p>

            <h6 class="text-primary">Is it easy to prepare video files for minting?</h6>

            <p>We have a UI for this. <router-link to="/encode">Upload the video file</router-link> you want to mint, and it will create public and private versions for you in the browser. Will take a few minutes.</p>

            <h6 class="text-primary">Is it free to test?</h6>

            <p>Yep! Absolutely. Check it out. <a href="https://chrome.google.com/webstore/detail/terra-station/aiifbnbfobpmeekipheeijimdpnlpgpp?hl=en" target="_blank">Install Terra Station</a> browser extension. Create a wallet. <a href="https://faucet.terra.money/" target="_blank">Get some test Luna</a> for free. And <router-link to="/v/Qmek5dVVVxD4oYFJwtfb4YKqcHsEkMF3sfD6wAf5asK3mA">purchase a video</router-link> or <router-link to="/encode">create your own NFT</router-link>.</p>

            <h6 class="text-primary">What is the economy behind?</h6>

            <p>We are still working on it. Currently it's:</p>

            <p>NFT owner can set any price she/he thinks is appropriate for a view.</p>

            <p>
                NFT owner receives 80%<br />
                NFT creator receives 10%<br />
                PepperWatch receives 10%<br />
            </p>

            <p>So you keep 90% of your NFT earnings if you never sell or transfer it.</p>

            <h6 class="text-primary">Is PepperWatch production ready and stable?</h6>

            <p>We are currently in alpha. Working with Terra testnet blockchain. Very close to deploying it to mainnet. Subscribe on twitter and telegram to never miss the launch.</p>





  </div>

</template>

<script>
// import Uploader from '../components/Uploader';
// import MediaDownsample from '../classes/MediaDownsample';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        // Uploader,
    },
	data() {
		return {
		}
	},
    watch: {
    },
	methods: {
        file() {
            // console.error(userFile.file);
            // const md = new MediaDownsample({blob: userFile.file});
            // md.do();

            // console.error(md);
        }
	},
    mounted() {
        setTimeout(()=>{
            // this.$refs.uploader.sample();
        }, 500);
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    h6 {
        font-size: 16px;
        font-weight: bold;
    }

    h5 {
        margin-bottom: 16px;
    }

    .video_container {
        float: right;
        width: 600px;
        margin: 0 0 20px 20px;
    }
</style>

