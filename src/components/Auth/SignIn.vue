<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">

      <q-form @submit="onSubmit" class="q-pa-lg">

        <q-input ref="initialFocus" v-model="username" label="Username" stack-label :disable="isLoading" :error="hasError"/>
        <q-input v-model="password" type="password" label="Password" stack-label :disable="isLoading" :error="hasError" error-message="Invalid username or password"/>


        <!-- buttons example -->
        <div class="q-pt-md">
          <q-btn label="Sign In" type="submit" color="primary" outline :loading="isLoading"/>
        </div>
      </q-form>

    </q-card>
  </q-dialog>
</template>

<script>
export default {
  props: {
    // ...your custom props
  },
  data() {
    return {
      isLoading: false,
      hasError: false,
      username: '',
      password: '',
    };
  },

  emits: [
    // REQUIRED
    'ok', 'hide'
  ],

  methods: {
    async onSubmit() {
      this.isLoading = true;
      this.hasError = false;

      await new Promise((res)=> { setTimeout(res, 500); });
      const success = await this.$store.dispatch('signIn', {username: this.username, password: this.password});

      if (!success) {
        this.hasError = true;

        setTimeout(()=>{
          this.hasError = false;
        }, 1000);
      } else {
        this.hide();
      }

      this.isLoading = false;

      return false;
    },
    // following method is REQUIRED
    // (don't change its name --> "show")
    show () {
      this.$refs.dialog.show();

      this.$nextTick(function() {
        this.$refs.initialFocus.focus();
      });
    },

    // following method is REQUIRED
    // (don't change its name --> "hide")
    hide () {
      this.$refs.dialog.hide()
    },

    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide the dialog
      this.hide()
    }
  }
}
</script>