<template>

    <div>
        <h6  class="text-primary">Telegram Test</h6>

        <Telegram />
        <Telegram />
        <Telegram />
        <Telegram />
        <Telegram />
        <Telegram />
    </div>

</template>

<script>
import Telegram from 'shared/components/Auth/Telegram';

export default {
	name: 'Telegram Test',
    path: '/telegramtest',
	props: {
	},
    components: {
        Telegram,
    },
	data() {
		return {
            isLoading: false,
		}
	},
    watch: {
    },
	methods: {
	},
    computed: {
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

