<template>

    <q-item :active="true">
        <q-item-section class="q-px-sm DialogCheckboxInput">
			<q-checkbox size="sm" color="secondary" v-model="value" :label="label" :disable="!!disable" :error="!!errorMessage" :error-message="errorMessage" />
		</q-item-section>
	</q-item>

</template>
<style type="text/css">
	.DialogCheckboxInput .q-checkbox__label {
		color: var(--q-secondary);
	}
	.q-dark .DialogCheckboxInput .q-checkbox__label {
		color: var(--q-secondary);
	}
</style>
<script>

export default {
	name: 'DialogCheckboxInput',
	props: ['modelValue', 'errorMessage', 'disable', 'label'],
	emits: ['update:modelValue'],
	data() {
		return {
		}
	},
	methods: {
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

