

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._path = '/auth/reset';
	}

    init() {
        this._fastify._server.post(this._path, async (request, reply) => await this.handle(request, reply));
    }

    async handle(req, reply) {
        await new Promise((res)=>setTimeout(res, 3000));
        const captcha = req.body.captcha;

        let captchaIsGood = false;

        const reCaptcha = this._db.Setting.getReCaptcha(); // cached by Settings
        captchaIsGood = await reCaptcha.check(captcha);
        if (!captchaIsGood) {
            reply.status(422);
            return reply.send({success: false});
        }

        const username = req.body.username;
        let found = await this._db.User.findOne({username: username});
        if (!found) {
            found = await this._db.User.findOne({email: username});
        }

        if (!found) {
            reply.send({
                success: true,
            });
        } else {
            let code = await found.resetPassword();

            const notification = await this._db.Notification.notify({
                user: found,
                templateName: 'reset_password',
                tags: {
                    code: code,
                },
                // doNotSave: true, // skip saving into database
            });


            reply.send({
                success: !!notification.sent,
            });
        }

    }
}

module.exports = Handler;