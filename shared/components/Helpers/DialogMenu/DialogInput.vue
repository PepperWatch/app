<template>

    <q-item :active="true">
        <q-item-section class="q-pa-md">
			<q-input :label="label" v-model="value" :disable="!!disable" filled type="text" :error="!!errorMessage" :error-message="errorMessage" @keyup="onKeyUp" :mask="mask" :autofocus="autofocus" />
		</q-item-section>
	</q-item>

</template>
<style type="text/css">
</style>
<script>

export default {
	name: 'DialogInput',
	props: ['modelValue', 'errorMessage', 'disable', 'label', 'mask', 'autofocus'],
	emits: ['update:modelValue', 'enter'],
	data() {
		return {
			content: '',
		}
	},
	methods: {
		onKeyUp(e) {
			if (e && e.keyCode == 13) {
				this.$emit('enter');
			}
		},
	},
	computed: {
		value: {
			get() {
				return this.modelValue;
			},
			set(value) {
				this.$emit('update:modelValue', value)
			},
		},
	},
}
</script>

