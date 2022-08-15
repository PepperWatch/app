<template>

  <div>
    <h5 class="text-primary" v-if="authenticated">
        Dashboard
        <q-btn size="sm" round color="primary" :icon="isAligningWidgets ? 'done' : 'control_camera'" @click="toggleRealignWidgets" />
    </h5>

    <q-banner inline-actions rounded class="bg-primary text-white" v-if="!authenticated" @click="$store.sessionUser.doSignIn()">
        Please sign in
        <template v-slot:action>
            <q-btn flat color="white" label="Sign In" />
        </template>
    </q-banner>

    <WidgetContainer v-if="authenticated" :aligning="isAligningWidgets" />

  </div>

</template>

<script>
import WidgetContainer from 'components/Widgets/WidgetContainer';

export default {
	name: 'Home',
    path: '/',
	props: {
	},
    components: {
        WidgetContainer,
        // Uploader,
    },
	data() {
		return {
            widgets: [
                {name: 'CountParsed'},
                {name: 'CountPosted'},
                {name: 'Notifications'},
                {name: 'Last7DaysParsed'},
            ],
            isAligningWidgets: false,
		}
	},
    watch: {
    },
	methods: {
        toggleRealignWidgets() {
            this.isAligningWidgets = !this.isAligningWidgets;
        },
	},
    computed: {
        authenticated() {
            return (!!this.$store.sessionUser.me);
        }
    },
    mounted() {
        // setTimeout(()=>{
        //     this.$store.sessionUser.doSignIn()
        //     // this.$refs.uploader.sample();
        // }, 500);
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

</style>

