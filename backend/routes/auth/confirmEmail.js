const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/auth/confirm';
	}

    async handle(req, reply) {
        await new Promise((res)=>setTimeout(res, 3000));
        const code = req.body.code;

        if (!code) {
            return reply.send({
                success: false,
            });
        }

        let found = await this._db.User.findOne({confirmEmailCode: code});
        if (!found) {
            return reply.send({
                success: false,
            });
        } else {

            found.confirmEmailCode = null;
            await found.save();

            return reply.send({
                success: true,
            });
        }
    }
}

module.exports = Handler;