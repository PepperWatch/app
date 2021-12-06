import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import './styles/common.css';

import App from './App.vue'
import routes from './pages/';
import store from './store/'


import { Quasar } from 'quasar';
import settings from './settings';


const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

const app = createApp(App).use(Quasar, settings.quasar);
app.use(store);
app.use(router);
app.mount('#app');


try {
	document.querySelector('.preloader').classList.add('ready');
} catch(e) {
	console.error(e);
}