const path = require('path');

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._settings = params.settings || null;
	}

    init() {
        if (this._settings.statics && this._settings.statics.length) {

            const prefixesFor404 = {};
            let decoratorAlreadyRegistered = false;
            for (let staticSettings of this._settings.statics) {

                this._fastify._server.register(require('@fastify/static'), {
                    root: staticSettings.root,
                    prefix: staticSettings.prefix,
                    index: ['index.html'],
                    list: true,
                    cacheControl: true,
                    dotfiles: 'deny',
                    immutable: true,
                    maxAge: 24*60*60*1000,
                    preCompressed: true,
                    prefixAvoidTrailingSlash: true,
                    decorateReply: !decoratorAlreadyRegistered,
                });

                decoratorAlreadyRegistered = true;
                prefixesFor404[staticSettings.prefix] = staticSettings.root;
            }

            this._fastify._server.setNotFoundHandler(function (request, reply) {
                const url = request.url;
                for (const prefix in prefixesFor404) {
                    if (url.startsWith(prefix)) {

                        return reply.sendFile('index.html', prefixesFor404[prefix]) // serving a file from a different root location
                    }
                }

                reply.code(404).send({ error: 'Not Found', message: 'Four oh for', statusCode: 404 })
            })
        }




    }
}

module.exports = Handler;