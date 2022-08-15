const fp = require('fastify-plugin');

class ServerAuth {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
		this._authRouters = {};

		this._authNonces = [];
		this._maxAuthNoncesToStore = 100;

		const noMethod = () => {
			throw new Error('Method required');
		};

        this._getUserByAuthCode = params.getUserByAuthCode || noMethod;

        this._fastify.decorateRequest('user', null);
		this._fastify.addHook('preHandler', (req, reply, done) => {
			let authCode = req.cookies.authCode || req.headers.authcode || null;

			this._getUserByAuthCode(authCode)
				.then((user)=>{
					if (user) {
						req.user = user;
					}

					done();
				});
		});
        this._fastify.decorateRequest('requireAuth', function () {
            if (!this.user) {
                throw new Error('Auth required');
            }
		});
	}
}

function initPlugin(fastify, options, next) {
	options = options || {};
	options.fastify = fastify;

	const serverAuth = new ServerAuth(options);
    serverAuth;
	// fastify.decorate('mongooseAPI', api);

	next();
}

const plugin = fp(initPlugin, {
	fastify: '^3.0.0 || ^4.0.0',
	name: 'fastify-server-auth',
	dependencies: ['@fastify/formbody', '@fastify/cookie']
});

module.exports = plugin;