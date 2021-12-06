<template>

  <div v-if="maintenance">
    Maintentance Mode
  </div>

  <!-- <q-scroll-area class="scroll-area col" :thumb-style="{ right: '4px', borderRadius: '5px', background: '#027be3', width: '5px', opacity: 0.4 }"> -->
    <div class="page_content_container" v-if="!maintenance">

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in" appear @before-enter="afterEnter">
          <component ref="view" :is="Component" v-if="contentViewEnabled" />
        </transition>
      </router-view>

      <transition name="fade" mode="out-in" appear>
        <div class="cursor-pointer fixed-center" v-if="!contentViewEnabled" @click="signIn">
          <div class="q-pa-xl relative-position">

            <q-inner-loading
              showing
              label="Sign In Required"
              label-class="text-primary"
              color="primary"
              size="50px"
            />

          </div>
        </div>
      </transition>
    </div>
    <!-- </perfect-scrollbar> -->
  <!-- </q-scroll-area> -->

</template>

<script>
// import routes from './routes';

  // <div class="page_content">
export default {
  name: 'RoutedPage',
  data() {
    return {
      title: 'Pepper Watch',
      pageTitle: '',
      currentRoute: window.location.pathname,
      authRequired: false,
    }
  },
  computed: {
    contentViewEnabled: function() {
      if (!this.authRequired || this.$store.state.sessionUser.me) {
        return true;
      } else {
        return false;
      }
    },
    maintenance: function() {
      return this.$store.state.maintenance.maintenance;
    }
  },
  components: {
  },
  watch:{
    '$route' (){
      this.authRequired = false;
    }
  },
  methods: {
    signIn() {
      this.$store.dispatch('doSignIn');
    },
    afterEnter() {
      console.error('this.$store.maintenance.state', this.$store.state.maintenance.maintenance);

      this.$nextTick(function() {
        this.checkForLayout();
        // console.log(this.$refs);
      });
    },
    checkForLayout() {
      try {
        const c = this.$refs.view.$.ctx;
        // console.error(this.$refs.view.$.ctx);

        this.authRequired = c.$options?.authRequired ? true : false;
        this.pageTitle = c.$options?.title ? c.$options.title : null;

        // this.pageTitle = c.title;

        console.log(this.authRequired, 'this.authRequired');

        if (this.authRequired) {
          this.$store.dispatch('requireAuth');
        }

        // update page title
        const title = (this.pageTitle ? ('' + this.pageTitle + ' @ ') : '') + this.title;
        document.title = title;


      } catch(e) {
        console.error(e);
      }
    }
  },
  beforeCreate() {
  }
}
</script>

<style scoped>

.scroll-area {
  /*height: 500px;*/
}

.page_content {
  position: relative;
}

.page_content .ps {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.page_content_container {
    position: relative;
}


.page_transition {
  position: relative;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
/*
.fade-enter-to,
.fade-leave-e {
  opacity: 0;
}*/

.fade-enter-to,
.fade-leave-from {
  opacity: 0.7;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}



</style>