const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/home';
	}

    async handle(req, reply) {
        const data = {
            chainType: (req.body['chainType'] || null),
        };

        const videos = await this.db.Video.find({chainType: data.chainType, isVisibleOnHomepage: true}).sort({ createdAt: 'desc' });
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