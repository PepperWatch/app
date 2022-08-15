const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
    constructor(params = {}) {
        super(params);
        this._path = '/api/settings/testcaptcha';
    }

    async handle(req, reply) {
        req.requireAuth();

        let captcha = req.body.captcha;

        const reCaptcha = this._db.Setting.getReCaptcha(); // cached by Settings
        const raw = await reCaptcha.checkRaw(captcha);

        reply.send({
            success: true,
            results: raw,
        });
    }
}

module.exports = Handler;