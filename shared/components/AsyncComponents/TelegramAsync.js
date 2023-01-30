import { defineAsyncComponent } from 'vue';

// Async component with options
const component = defineAsyncComponent({
  loader: () => import('./TelegramSync.vue'),
  delay: 200,
  timeout: 15000,
});

export default component;
