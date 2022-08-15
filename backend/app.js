const settings = require('./settings/settings.js');
const DB = require('./includes/DB.js');
const Server = require('./includes/Server.js');

const extraRoutes = require('./routes');

const run = async()=>{
	const db = new DB(settings);

	settings.db = await db.init();

	// create default settings for classes if needed
	await settings.db.Setting.initialize();

	// make seeds for models if needed
	for (let key in settings.db.connection.models) {
		if (settings.db.connection.models[key].seed) {
			await settings.db.connection.models[key].seed();
		}
	}

	// if we are on Heroku:
	// check if current deploy is updated and create notification if it is
	const deployChecker = settings.db.Setting.getDeployChecker();
	await deployChecker.checkCurrentDeploy();

	// create the server
	// with fastify-mongoose-api instance for all our mongoose models
	const server = new Server(settings);

	// add and initialize extra routes
	const extraRoutesHandlers = await extraRoutes.loadRoutes();
	const handlers = [];
	for (let Handler of extraRoutesHandlers) {
		const handler = new Handler({
			fastify: server,
			db: settings.db,
			settings: settings,
		});
		handlers.push(handler);
	}

	const beforeInit = async()=>{
		for (let handler of handlers) {
			await handler.init();
		}
	};

	await server.init(beforeInit);
};

run();