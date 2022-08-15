

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._path = '/auth/me';
	}

    init() {
        this._fastify._server.get(this._path, async (request, reply) => await this.handle(request, reply));
    }

    async handle(req, reply) {
        req.requireAuth();

        reply.send({
            success: true,
            me: req.user ? ( req.user.apiValues ? req.user.apiValues(req) : req.user ) : null
        });
    }
}

module.exports = Handler;