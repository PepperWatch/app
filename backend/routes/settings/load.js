const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/settings/load';
	}

    async handle(req, reply) {
        let userLevels = ['guest'];
        if (req.user) {
            userLevels = req.user.getAvailableAccessLevels();
        }

        let settings = await this._db.Setting.find({levelToRead: {$in: userLevels}});
        let data = {

        };

        for (let setting of settings) {
            data[setting.name] = setting.value;
        }

        reply.send({
            success: true,
            settings: data,
        });
    }
}

module.exports = Handler;