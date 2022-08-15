

class Handler {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
        this._db = params.db || null;
        this._path = '/api/email/test';
	}

    init() {
        this._fastify._server.post(this._path, async (request, reply) => await this.handle(request, reply));
    }

    async handle(req, reply) {
        if (!req.user || !req.user.hasLevelOf('superadmin')) {
            throw new Error('Only superadmin can test email sending');
        }

        const email = req.body.email;
        const mailer = await this._db.NotificationTemplate.getMailer();

        const res = await mailer.send({
            to: email,
            template: 'test',
        });

        let dataOk = [];
        let dataErr = [];
        if (res && res.messageId) {
            dataOk.push('Message ID: '+res.messageId);
            dataOk.push('SMTP Response: '+res.response);
        } else {
            dataErr.push('Error: '+res);
        }


        reply.send({
            success: true,
            dataOk,
            dataErr,
        });
    }
}

module.exports = Handler;