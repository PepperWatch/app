<template>


      <q-chip size="20px" class="non-selectable cursor-pointer text-capitalize" square clickable @click="onClick">
        <q-avatar size="60px">
        </q-avatar>
        <span class="gt-xs">Pepper.watch</span>
      </q-chip>

</template>

<script>

export default {
  name: 'Logo',
  components: {
  },
  methods: {
    onClick: function() {
      this.$router.push('/');
    },
  },
  computed: {
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .q-chip {
    background-color: transparent;
    color: var(--on-brand-text-color);
    text-transform: lowercase;
  }
  .q-avatar {
    background-image: url('../assets/logo.png');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: left center;
    /*border: 3px solid var(--brand-border-color);*/
    border-radius: 50%;
  }

  .q-chip .q-avatar {
    border-radius: 50%;
  }
</style>