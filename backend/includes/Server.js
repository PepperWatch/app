const Fastify = require('fastify');

const fastifyServerAuth = require('./FastifyServerAuth.js');
const fastifyCookie = require('@fastify/cookie');
const fastifyFormbody = require('@fastify/formbody');
const fastifyMongooseAPI = require('fastify-mongoose-api');
const fastifyCors = require('@fastify/cors');

class Server {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this._port = params.server?.port || 8080;

        this.db = params.db || null;

        if (!this.db) {
            throw new Error('db param required for the server');
        }

        this._server = null;
	}

    log(str) {
        if (this._logger) {
            this._logger.debug(str);
        } else {
            console.log(str);
        }
    }

    async beforeInit(fastify) {
        fastify.register(fastifyCookie);
        fastify.register(fastifyFormbody);
        fastify.register(fastifyCors, {
            exposedHeaders: 'set-cookie',
            credentials: true,
        });
        fastify.register(fastifyServerAuth, {
                getUserByAuthCode: async (authCode)=>{
                    return await this.db.User.byAuthCode(authCode);
                },
            });

        fastify.register(fastifyMongooseAPI, {
                models: this.db.connection.models,
                checkAuth: (request)=>{
                    request.requireAuth();
                },
                prefix: '/api/',
                setDefaults: true,
                exposeVersionKey: false,
                exposeModelName: true,
                methods: ['list', 'get', 'post', 'patch', 'put', 'delete', 'options']
            });
    }

    async init(beforeInit) {
        this.log('Creating server instance...');
        this._server = Fastify();

        this.beforeInit(this._server);

        if (beforeInit) {
            await beforeInit(this);
        }

        await this._server.ready();
        await this._server.listen({ port: this._port, host: '0.0.0.0' });

        this.log('Server listening at port #'+this._port);
    }
}

module.exports = Server;