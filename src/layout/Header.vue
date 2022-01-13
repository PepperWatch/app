<template>

  <!-- <q-header reveal elevated  height-hint="161.59"> -->
  <q-header reveal  height-hint="161.59">
    <q-toolbar  class="q-pa-lg q-px-md" >

      <Logo />
      <div class="q-pa-sm gt-xs"></div>

      <!-- <q-btn stretch flat label="Create Sample" to="/sampler" /> -->
      <q-btn stretch flat label="Prepare The Mint" to="/encode" v-if="!maintenance" />
      <q-btn stretch flat label="Decode Container" to="/decode" v-if="!maintenance" />
      <q-btn stretch flat label="Prepared Mints" to="/prepared" v-if="!maintenance" />
      <!-- <q-btn stretch flat label="Minted" to="/minted" v-if="!maintenance" /> -->

      <!-- <q-btn stretch flat label="All Minted" to="/allminted" v-if="!maintenance" /> -->
      <q-btn stretch flat label="Collections" to="/tags" v-if="!maintenance" />

<!--       <Auth />

      <q-space />

      <q-btn stretch flat label="Sign In" v-if="!authenticated" @click="signIn" />
      <q-btn stretch flat label="Join" v-if="!authenticated" />

      <q-spinner-facebook v-if="sessionInitializing"
        size="2em"
        />

      <q-btn dense round flat icon="notifications" class="q-mr-xs"  size="18px"  v-if="authenticated && !sessionInitializing">
        <q-badge color="red" floating>
          2
        </q-badge>
        <q-tooltip>Notifications</q-tooltip>
      </q-btn>

      <q-separator inset spaced v-if="authenticated"/>

      <q-btn dense flat no-wrap  v-if="authenticated">
        <q-avatar rounded size="36px">
          <img src="https://cdn.quasar.dev/img/avatar3.jpg">
        </q-avatar>
        <q-icon name="arrow_drop_down" size="26px" />

        <q-menu auto-close>
          <q-list dense>
            <q-item class="GL__menu-link-signed-in">
              <q-item-section>
                <div>Signed&nbsp;in&nbsp;as&nbsp;<strong>{{ sessionUsername }}</strong></div>
              </q-item-section>
            </q-item>
            <q-separator />

            <q-item clickable class="GL__menu-link" @click="logOut">
              <q-item-section>Sign out</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn> -->

      <q-space />
      <CryptoAuth v-if="!maintenance" />
      <EarningsWidget v-if="!maintenance" />

      <MaintenanceSwitcher />

    </q-toolbar>


  </q-header>

</template>

<script>
import Logo from './Logo';
// import Auth from '../components/Auth';
import CryptoAuth from '../components/CryptoAuth.vue';
import EarningsWidget from '../components/EarningsWidget.vue';
import MaintenanceSwitcher from '../components/Auth/MaintenanceSwitcher.vue';

export default {
  name: 'Header',
  components: {
    Logo,
    // Auth,
    CryptoAuth,
    MaintenanceSwitcher,
    EarningsWidget,
  },
  methods: {
    // onNotification: function() {
    //   console.error(this.$store);

    //   this.$store.dispatch('initSession');
    // },
    onLogo: function() {
      this.$router.push('/');
    },
    signIn: function() {
      this.$store.dispatch('doSignIn');
    },
    logOut: function() {
      this.$store.dispatch('doLogOut');
    }
  },
  computed: {
    maintenance: function() {
      return this.$store.state.maintenance.maintenance;
    },
    sessionUsername() {
      return (this.$store.state.sessionUser.me ? this.$store.state.sessionUser.me.username : null);
    },
    sessionInitializing() {
      return (!!(this.$store?.state?.sessionUser?.isSessionInitializing));
    },
    authenticated() {
      return (!!this.$store.state.sessionUser.me);
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .q-header {
    backdrop-filter: var(--brand-back-filter);
    background-color: var(--brand-header-color);
    color: var(--on-brand-text-color);
  }

  a.logo {
    vertical-align: middle;
    color: var(--on-brand-text-color);
    position: relative;
    display: block;
    height: 50px;
    line-height: 50px;
    text-indent: 58px;
    text-decoration: none;
    overflow: hidden;
    background-image: url('../assets/logo.png');
    background-repeat: no-repeat;
    background-size: contain;
    background-position: left center;
    padding-right: 14px;
  }
</style>