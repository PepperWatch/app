const settings = require('./settings/settings.js');
const DB = require('./includes/DB.js');
const Server = require('./includes/Server.js');
const path = require('path');

// const t = require('./routes/testEnc.js');
// import { LCDClient, MsgExecuteContract, MnemonicKey } from '@terra-money/terra.js';

const run = async()=>{
	const db = new DB(settings);

	settings.db = await db.init();
	const server = new Server(settings);
	await server.init((fastify)=>{
		// before init
		//
		//
		// fastify.register(require('fastify-compress'));
		fastify.register(require('fastify-static'), {
			root: path.join(__dirname, '../dist'),
			wildcard: true,
			maxAge: "31536000000",
		});
		fastify.setNotFoundHandler(async(request,reply)=>{
			console.log('here');

			console.error(request.url);
			const isInRoot = (request.url.split('/').length === 2 || (request.url.split('/').length === 3 && request.url.split('/')[1] == 'v')); // only one slash in the begining
			if (isInRoot) {
				console.error('isInRoot');
				reply.sendFile('index.html', { cacheControl: false });
			} else {
				reply.code(404).send(new Error('Not found'));
			}
		});

		// fastify.get('/storevideo', {}, async (request, reply) => await (require('./routes/storeVideo.js'))(request, reply, server.db));
		fastify.post('/storevideo', {}, async (request, reply) => await (require('./routes/storeVideo.js'))(request, reply, server.db));
		fastify.post('/storeipfs', {}, async (request, reply) => await (require('./routes/storeIPFS.js'))(request, reply, server.db));
		fastify.post('/byhash', {}, async (request, reply) => await (require('./routes/videoByHash.js'))(request, reply, server.db));

		fastify.post('/testenc', {}, async (request, reply) => await (require('./routes/testEnc.js'))(request, reply, server.db));

		fastify.post('/fill', {}, async (request, reply) => await (require('./routes/fill.js'))(request, reply, server.db));
	});

};

run();