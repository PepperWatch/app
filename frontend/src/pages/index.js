const files = require.context('.', true, /\.vue$/)
const modules = {}


files.keys().forEach((key) => {
	if (key === './index.js') {
		return;
	}
	modules[key.replace(/(\.\/|\.vue)/g, '')] = files(key);
});

const routes = [];
for (let key in modules) {
	routes.push({
		path: modules[key].default.path,
		component: modules[key].default,
		meta: {
			authRequired: modules[key].default.authRequired,
			requiredAuthLevel: modules[key].default.requiredAuthLevel,
		},
	});
}

export default routes;