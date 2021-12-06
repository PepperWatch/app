import { defineAsyncComponent } from 'vue';

// Async component with options
const component = defineAsyncComponent({
  loader: () => import('./MetamaskSync.vue'),
  delay: 200,
  timeout: 3000,
});

export default component;
