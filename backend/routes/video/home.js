const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/home';
	}

    async handle(req, reply) {
        const videos = await this.db.Video.find();
        const ret = [];
        for (let video of videos) {
            ret.push(video.apiValues());
        }

        reply.send({
            items: ret,
            total: ret.length,
            success: true,
        });
    }
}

module.exports = Handler;