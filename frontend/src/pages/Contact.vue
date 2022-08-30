<template>

    <div>
        <h6  class="text-primary">Contact Us</h6>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6 q-mb-sm">

                <div v-if="isSent">
                    <q-banner inline-actions class="text-white bg-primary">
                        Your message has been sent. Thank you!
                    </q-banner>
                </div>

                <q-form class="q-gutter-md q-pt-sm" @submit="send" v-if="!isSent">
                    <q-input
                        filled
                        v-model="email"
                        label="Email Address"
                        lazy-rules
                        :rules="[ val => val && val.length > 0 || 'Please type something']"
                    />

                    <q-input
                        filled
                        v-model="name"
                        label="Your name"
                        lazy-rules
                        :rules="[ val => val && val.length > 0 || 'Please type something']"
                    />

                    <q-input
                        filled
                        v-model="body"
                        type="textarea"
                        label="Message"
                        lazy-rules
                        :rules="[ val => val && val.length > 0 || 'Please type something']"
                    />

                    <q-btn type="submit" label="Send" color="primary" unelevated  :loading="isSending"  />
                </q-form>

            </div>
            <div class="col-12 col-md-6">

            </div>
        </div>
    </div>

</template>

<script>

export default {
	name: 'Contact Us',
    path: '/contact',
	props: {
	},
    components: {
    },
	data() {
		return {
            email: '',
            name: '',
            body: '',

            isSending: false,
            isSent: false,
		}
	},
    watch: {
    },
	methods: {
        async send() {
            this.isSending = true;


            const resp = await this.$store.api.post({
                path: 'api/contact/contact',
                data: {
                    email: this.email,
                    name: this.name,
                    body: this.body,
                }});

            if (resp && resp.success) {
                this.isSent = true;
            } else {
                this.$q.notify({
                    message: 'Can not send the message. Please try again later',
                    color: 'negative',
                });
            }

            this.isSending = false;
        }
	},
    computed: {
    },
    mounted() {
    },
}
</script>

<style scoped="scoped">
</style>
