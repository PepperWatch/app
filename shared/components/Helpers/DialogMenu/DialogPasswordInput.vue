<template>

    <q-item :active="true">
        <q-item-section class="q-px-md q-pt-md">
			<q-input v-model="value" :label="label" :disable="!!disable" filled :type="isPwd ? 'password' : 'text'" :error="!!errorMessage" :error-message="errorMessage" @keyup="onKeyUp" :autofocus="autofocus" hide-bottom-space
							>
				<template v-slot:append>
				<q-icon
				:name="isPwd ? 'visibility_off' : 'visibility'"
				class="cursor-pointer"
				@click="isPwd = !isPwd"
				/>
				</template>
			</q-input>
		</q-item-section>
	</q-item>

</template>
<style type="text/css">
</style>
<script>

export default {
	name: 'DialogPasswordInput',
	props: ['modelValue', 'errorMessage', 'disable', 'label', 'autofocus'],
	emits: ['update:modelValue', 'enter'],
	data() {
		return {
			isPwd: true,
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

