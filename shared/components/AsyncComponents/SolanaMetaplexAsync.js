import { defineAsyncComponent } from 'vue';

// Async component with options
const component = defineAsyncComponent({
  loader: () => import('./SolanaMetaplexSync.vue'),
  delay: 5000,
  timeout: 15000,
});

export default component;
