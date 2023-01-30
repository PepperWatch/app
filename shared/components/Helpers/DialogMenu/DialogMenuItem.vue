<template>

    <q-item :clickable="!active" @click="onClick" :disable="disable" :active="active">
        <q-item-section avatar class="q-pl-md">
            <q-icon color="primary" :name="icon" v-if="!loading" />
            <q-spinner-dots color="primary" size="40px" v-if="loading" />
        </q-item-section>

    <q-item-section>
    <q-item-label>{{title}} </q-item-label>
    <q-item-label caption v-if="description">{{description}}</q-item-label>
    </q-item-section>
    </q-item>

</template>
<style type="text/css">
</style>
<script>

export default {
    name: 'DialogMenuItem',
    props: {
        title: String,
        icon: {
            type: String,
            default: 'done',
        },
        description: {
            type: String,
            default: '',
        },
        loading: {
            type: Boolean,
            default: false,
        },
        disable: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['click'],
    data() {
        return {
        }
    },
    watch: {
    },
    methods: {
        onClick() {
            if (!this.disable) {
                this.$emit('click');
            }
        }
    },
    mounted() {
    },
    computed: {
    },
}
</script>

