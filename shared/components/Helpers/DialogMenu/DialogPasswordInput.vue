<template>

    <q-item :active="true">
        <q-item-section class="q-pa-md">
			<q-input v-model="value" :disable="!!disable" filled :type="isPwd ? 'password' : 'text'" :error="!!errorMessage" :error-message="errorMessage">
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
	props: ['modelValue', 'errorMessage', 'disable'],
	emits: ['update:modelValue'],
	data() {
		return {
			isPwd: true,
			content: '',
		}
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

