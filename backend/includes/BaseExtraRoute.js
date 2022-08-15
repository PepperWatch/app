
class BaseExtraRoute {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._method = 'post';
        this._path = null;
	}

    get db() {
        return this._db;
    }

    init() {
        if (!this._path) {
            throw new Error('You should extend _path property');
        }

        this._fastify._server[this._method](this._path, async (request, reply) => await this.handle(request, reply));
    }
}

module.exports = BaseExtraRoute;