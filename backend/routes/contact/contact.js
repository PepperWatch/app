const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
    constructor(params = {}) {
        super(params);
        this._path = '/api/contact/contact';
    }

    async handle(req, reply) {
        const email = req.body.email;
        const name = req.body.name;
        const body = req.body.body;

        if (!email || !name || !body) {
            return reply.send({success: false});
        }

        const captcha = req.body.captcha;

        let captchaIsGood = false;
        const reCaptcha = this._db.Setting.getReCaptcha(); // cached by Settings
        captchaIsGood = await reCaptcha.check(captcha);


        if (!captchaIsGood) {
            reply.status(422);
            return reply.send({success: false});
        }

        await new Promise((res)=>{ setTimeout(res, 1000); });

        const mailer = await this._db.NotificationTemplate.getMailer();
        const to = await this.db.Setting.get('contactEmail');

        if (!to) {
            return reply.send({success: false});
        }

        let res = null;
        try {
            res = await mailer.send({
                        to: to,
                        template: 'contact',
                        tags: {
                            email,
                            name,
                            body: (body.replace(/([^>])\n/g, '$1<br/>')), // nl2br
                        },
                    });
        } catch(e) {
            return reply.send({success: false});
        }

        if (res && res.messageId) {
            reply.send({success: true});
        } else {
            reply.send({success: false});
        }
    }
}

module.exports = Handler;