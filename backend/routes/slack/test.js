const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
    constructor(params = {}) {
        super(params);
        this._path = '/api/slack/test';
    }

    async handle(req, reply) {
        if (!req.user || !req.user.hasLevelOf('superadmin')) {
            throw new Error('Only superadmin can test email sending');
        }

        const template = req.body.template;
        const channel = req.body.channel;

        const slack = await this._db.Setting.getSlack();

        let res = null;

        const tags = {
            username: req.user.username,
        };

        try {
            res = await slack.send({
                template: template,
                channel: channel,
                tags: tags,
            });
        } catch(e) {
            res = ''+e;
        }

        let dataOk = [];
        let dataErr = [];
        if (res && res.ts) {
            dataOk.push('Message ID: '+res.ts);
            dataOk.push('Response: '+res);
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