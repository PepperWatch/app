const crypto = require('crypto');

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._path = '/auth/auth';
	}

    init() {
        this._fastify._server.post(this._path, async (request, reply) => await this.handle(request, reply));
    }

    async handle(req, reply) {
        let ret = {
            success: false,
            authCode: null
        };

        let username = req.body.username;
        let password = req.body.password;
        let captcha = req.body.captcha;

        let hashIsGood = false;
        let captchaIsGood = false;

        const reCaptcha = this._db.Setting.getReCaptcha(); // cached by Settings
        captchaIsGood = await reCaptcha.check(captcha);

        if (!captchaIsGood) {
            reply.status(422);
            return reply.send(ret);
        } else {
            let foundUser = null;
            if (captchaIsGood) {
                foundUser = await this._db.User.byUsername(username);
                if (foundUser) {
                    hashIsGood = await foundUser.isValidPassword(password);
                }
            }

            if (hashIsGood) {
                ret.success = true;
                let authCode = (''+crypto.randomBytes(256).toString('hex'));
                ret.authCode = authCode;

                ret.me = foundUser.apiValues ? foundUser.apiValues() : foundUser;
                ret.me.level = foundUser.level; // force level in api response (as it may be hidden by apiValues)

                await foundUser.storeAuthCode(authCode);

                reply.setCookie('authCode', authCode, {path: '/', maxAge: 7*24*60*60, sameSite: 'none'});

                await this._db.Notification.notify({
                    user: foundUser,
                    templateName: 'signed_in',
                    tags: {
                        username: foundUser.username,
                    },
                    // doNotSave: true, // skip saving into database
                });

                await this._db.Notification.notify({
                    // level: 'admin',  send to default settings (can set from NotificationTemplate -> Edit)
                    templateName: 'signed_in',
                    tags: {
                        username: foundUser.username,
                    },
                    silent: true, // do not throw error ( like if no template defined )
                });
            }

            if (!ret.success) {
                reply.status(401);
                reply.send(ret);
            } else {
                reply.send(ret);
            }
        }

    }
}

module.exports = Handler;