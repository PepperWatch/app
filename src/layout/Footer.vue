<template>

  <!-- <q-footer reveal elevated> -->
  <q-footer reveal>
    <q-toolbar>
      <q-toolbar-title>


        <div class="fit row no-wrap justify-center items-start content-start">

          <q-btn flat type="a" href="https://twitter.com/pepper_watch" label="Twitter" />
          <q-btn flat type="a" href="https://t.me/s/pepperwatch" label="Telegram" />

        </div>

      </q-toolbar-title>
    </q-toolbar>
  </q-footer>

</template>

<script>

export default {
  name: 'Footer',
  components: {
  },
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .q-footer {
    backdrop-filter: var(--brand-back-filter);
    background-color: var(--brand-footer-color);
  }

  .q-footer a {
    color: var(--on-brand-text-color);
  }
</style>