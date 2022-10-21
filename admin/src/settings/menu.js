const items = [
	{
		title: 'Notifications / Emails',
		icon: 'notifications',
		name: 'Notifications',
		path: '/notifications',
	},
	{
		title: 'NFTs',
		path: '/videos',
		icon: 'smart_display',
	},
	{
		title: 'Users',
		path: '/users',
		icon: 'manage_accounts',
	},
	{
		title: 'Settings',
		icon: 'settings',
		subItems: [
				{
					title: 'Your Settings',
					path: '/profile',
					icon: 'persone'
				},
				{
					title: 'Recaptcha',
					path: '/settings_recaptcha',
					icon: 'smart_toy'
				},
				{
					title: 'Login With Google',
					path: '/settings_signgoogle',
					icon: 'sensor_occupied'
				},
				{
					title: 'Email Settings',
					path: '/email_settings',
					icon: 'email'
				},
				{
					title: 'Notification Templates',
					path: '/notification_templates',
					icon: 'edit_notifications'
				},
				{
					title: 'Slack Settings',
					path: '/settings_slack',
					icon: 'tag'
				},
				{
					title: 'Common Template Tags',
					path: '/email_tags',
					icon: 'style'
				},
				{
					title: 'Storage',
					path: '/settings_storage',
					icon: 'save'
				},
				{
					title: 'Telegram',
					path: '/settings_telegram',
					icon: 'save'
				}
		]
	},
];

export default items;