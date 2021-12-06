import {
  Dialog, LocalStorage, Notify,
} from 'quasar';

import 'quasar/dist/quasar.css'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

const prodDomains = [
  'pepper.watch',
  'pepperwatch.com',
  'www.pepperwatch.com',
  'www.pepperwatch.com',
  'the-organization-app.herokuapp.com',
];

const mainProdDomain = 'pepperwatch.com';

let isProd = false;
if (prodDomains.indexOf(document.location.hostname) != -1) {
  if (document.location.hostname != mainProdDomain || document.location.protocol != 'https:') {
    window.location = "https://" + mainProdDomain + "/" + window.location.pathname;
  }

  isProd = true;
}

// To be used on app.use(Quasar, { ... })
export default {
  quasar: {
    config: {
      brand: {
      // https://quasar.dev/style/theme-builder
      // Also take a look at ./styles/vars.css
        primary: '#800000',
        secondary: '#26A69A',
        accent: '#9C27B0',

        dark: '#1d1d1d',

        positive: '#21BA45',
        negative: '#C10015',
        info: '#31CCEC',
        warning: '#F2C037'
      }
    },
    plugins: {
      Dialog,
      LocalStorage,
      Notify,
    }
  },
  api: {
    basePath: (isProd ? 'https://pepperwatch.com/' : 'http://localhost:9999/'), // localhost, served by ./backend/
  }
};