<template>

    <q-item :clickable="!active" @click="onClick" :disable="disable" :active="active">
        <q-item-section avatar class="q-pl-md">
            <Icon forWhat="metamask" v-if="!loading && icon == 'metamask'"/>
            <q-icon color="primary" :name="icon" v-if="!loading && icon != 'metamask'" style="width: 24px; height: 24px;" />
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
import Icon from 'shared/components/Icon';

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
    components: {
        Icon,
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

