const files = require.context('.', false, /\.vue$/)
const modules = {}

files.keys().forEach((key) => {
     if (key === './index.js') return
     modules[key.replace(/(\.\/|\.vue)/g, '')] = files(key)
});

const routes = [];
for (let key in modules) {
	routes.push({
		path: modules[key].default.path,
		component: modules[key].default,
	});
}

export default routes;