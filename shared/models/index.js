const files = require.context('.', true, /\.js$/)
const modules = {}

files.keys().forEach((key) => {
	if (key === './index.js') {
		return;
	}
	modules[key.replace(/(\.\/|\.js)/g, '')] = files(key);
});

const models = {};
for (let key in modules) {
	models[key] = modules[key];
}

export default models;