<template>

    <div>
        <h6  class="text-primary">Your Telegram Storage</h6>

        <Telegram />

        <Drive />
<!--
        <div>
            <h3 v-if="authenticated"> Folders </h3>

            <div v-for="folder in folders" v-bind:key="folder.name">
                {{folder.name}}
            </div>
        </div> -->
    </div>

</template>

<script>
import Telegram from 'shared/components/Auth/Telegram';
import Drive from 'shared/components/Services/Telegram/Drive';
// import Drive from 'shared/classes/drive/telegram/Drive.js';

export default {
	name: 'Your Telegram Storage',
    path: '/telegram',
	props: {
	},
    components: {
        Telegram,
        Drive,
    },
	data() {
		return {
            isLoading: false,
            // folders: [],
		}
	},
    watch: {
        authenticated() {
            if (this.authenticated) {
                // this.load();
            }
        }
    },
	methods: {
        // async load() {
        //     this.drive = new Drive();
        //     this.drive.setProvider(this.$store.telegram.provider);

        //     this.drive.addEventListener('folder', (e) => {
        //         this.folders.push(e.detail.folder);
        //     // this.$emit('wait', e.detail.what);
        //     });
        //     // this.folders = this.drive._folders;
        // }
	},
    computed: {
        authenticated() {
            return (!!this.$store.telegram.username);
        }
    },
    mounted() {
    },
}
</script>

<style scoped="scoped">
</style>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
    h6 {
        font-size: 16px;
        font-weight: bold;
        margin: 0 0 16px 0;
    }

    a.text-link {
        color: var(--q-primary);
        cursor: pointer;
        font-weight: bold;
    }
</style>

