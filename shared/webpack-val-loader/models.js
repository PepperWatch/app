const DB = require('../../backend/includes/DB.js');
const settings = require('../../backend/settings/settings.js');

module.exports = async function yearsInMs() {

	settings.silent = true; // do not connect to database

	const dbClass = new DB(settings);
	const db = await dbClass.init();
	const models = {};

	// const ret = '';

	for (let key in db.connection.models) {
		const model = db.connection.models[key];

		const fields = [];
		// model.schema.eachPath((pathname, schematype) => {
		model.schema.eachPath((pathname) => {
			const field = {
				name: pathname,
				type: (''+model.schema.path(pathname).instance),
				default: model.schema.path(pathname).default(),
			};
			// console.log(schematype);
			fields.push(field);
		});

		const virtuals = {};
		for (let key in model.schema.virtuals) {
			// console.log(model.schema.virtuals[key]);
			const virtual = {
				name: key,
				// count: model.schema.virtuals.length,
				// getter: (''+model.schema.virtuals[key].getters[0]),
			};

			virtuals[key] = virtual;
		}

		models[key] = {
			name: key,
			fields: fields,
			virtuals: virtuals,
		};

		if (model.collection && model.collection.name) {
			models[key].collectionName = (''+model.collection.name);
		}
		if (model.schema && model.schema.options && model.schema.options.collection) {
			models[key].collectionName = (''+model.schema.options.collection);
		}
	}

	let ret = "const models = "+JSON.stringify(models)+";\n";

	for (let key in db.connection.models) {
		const model = db.connection.models[key];
		for (let virtualKey in model.schema.virtuals) {
			const getter = model.schema.virtuals[virtualKey].getters[0];
			const setter = model.schema.virtuals[virtualKey].setters[0];

			if (getter) {
				ret += `models['${key}'].virtuals['${virtualKey}'].getter = ${getter}\n`;
			}
			if (setter) {
				ret += `models['${key}'].virtuals['${virtualKey}'].setter = ${setter}\n`;
			}
		}
	}

	try {
		await dbClass.close();
	} catch(e) {
		console.log('');
	}

	// NOTE: this return value will replace the module in the bundle
	return {
		cacheable: false,
		code: (ret + "module.exports = models"),
	};
};