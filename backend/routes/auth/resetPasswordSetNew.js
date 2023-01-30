

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._path = '/auth/reset/new';
	}

    init() {
        this._fastify._server.post(this._path, async (request, reply) => await this.handle(request, reply));
    }

    async handle(req, reply) {
        await new Promise((res)=>setTimeout(res, 3000));

        // return reply.send({success: false}); // hard-code disable

        const code = req.body.code;
        const password = req.body.password;

        let found = await this._db.User.findOne({resetPasswordCode: code});
        if (!found) {
            return reply.send({
                success: false,
            });
        }

        const success = await found.setPassword(code, password);

        console.log(success, 'success');

        reply.send({
            success: success,
        });
    }
}

module.exports = Handler;