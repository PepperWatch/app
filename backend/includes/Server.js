const Fastify = require('fastify');

const fastifyServerAuth = require('./FastifyServerAuth.js');
const fastifyCookie = require('fastify-cookie');
const fastifyFormbody = require('fastify-formbody');
const fastifyMongooseAPI = require('fastify-mongoose-api');
const fastifyCors = require('fastify-cors');

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

    get server() {
        return this._server;
    }

    log(str) {
        if (this._logger) {
            this._logger.debug(str);
        } else {
            console.log(str);
        }
    }

    routeHandler(func) {
        return (request, response)=>{
            return func(request, response, this.db);
        };
    }

    async beforeInit(fastify) {
        fastify.register(fastifyCookie);
        fastify.register(fastifyFormbody);
        fastify.register(fastifyCors, {
            exposedHeaders: 'set-cookie',
            credentials: true,
        });
        fastify.register(fastifyServerAuth, {
                getUserByUsername: async (username)=>{
                    return await this.db.User.byUsername(username);
                },
                storeAuthCode: async (user, authCode)=>{
                    return await user.storeAuthCode(authCode);
                },
                getUserByAuthCode: async (authCode)=>{
                    return await this.db.User.byAuthCode(authCode);
                }
            });

        fastify.register(fastifyMongooseAPI, {
                models: this.db.connection.models,
                checkAuth: (request)=>{
                    if (request.raw.url.indexOf('user') != -1) {
                        /// just a quick way to disable /user/ and /user_authes/ routes on API
                        throw new Error('Cmon!');
                    }
                    // request.requireAuth();
                },
                prefix: '/api/',
                setDefaults: true,
                methods: ['list', 'get', 'post', 'patch', 'put', 'delete', 'options']
            });
    }

    async init(beforeInit) {
        this.log('Creating server instance...');
        this._server = Fastify();

        this.beforeInit(this._server);

        if (typeof(beforeInit) === 'function') {
            beforeInit(this._server);
        }

        await this._server.ready();
        await this._server.listen(this._port, '0.0.0.0');

        this.log('Server listening at port #'+this._port);
    }
}

module.exports = Server;