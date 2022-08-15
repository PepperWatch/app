const ReCaptcha = require('../../includes/ReCaptcha.js');
const crypto = require('crypto');

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._path = '/auth/logout';

        this._reCaptcha = new ReCaptcha(params);
	}

    init() {
        this._fastify._server.post(this._path, async (request, reply) => await this.handle(request, reply));
    }

    async handle(req, reply) {
        let ret = {
            success: true
        };

        /// @todo: remove authCode from server storage

        reply.setCookie('authCode', '', {path: '/'});
        reply.send(ret);
    }
}

module.exports = Handler;