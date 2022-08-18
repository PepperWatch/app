import {
	Dialog, LocalStorage, Notify,
} from 'quasar';

import 'quasar/dist/quasar.css'
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'

import menuItems from './menu';

// To be used on app.use(Quasar, { ... })
export default {
	quasar: {
		config: {
			dark: false,
			basePath: (process.env.BUILD_PREFIXED ? ('/'+process.env.BUILD_PREFIXED) : ''),
			brand: {
				title: 'The.Portal Admin Panel',
				// https://quasar.dev/style/theme-builder
				// Also take a look at ./styles/vars.css
				primary: '#4099ff',
				secondary: '#5BACA2',
				accent: '#9C27B0',
				dark: '#1d1d1d',

				positive: '#21BA45',
				negative: '#f44336',
				info: '#31CCEC',
				warning: '#F2C037'
			},
			menuItems: menuItems,
			registrationDisabled: true, // default - false
			signInWithGoogleDisabled: true, // default - false
			chainType: 'mainnet-beta', // default one, use can switch to devnet
		},
		plugins: {
			Dialog,
			LocalStorage,
			Notify,
		}
	},
};