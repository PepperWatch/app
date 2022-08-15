const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/storage/buckets';
	}

    async handle(req, reply) {
        const data = [];

        const storage = await this.db.Setting.getStorage();
        const buckets = await storage.getBuckets();

        for (let bucket of buckets) {
            if (bucket.hasAccessToList(req.user) || bucket.hasAccessToGet(req.user) || bucket.hasAccessToPut(req.user)) {
                data.push({
                    id: bucket.id,
                    levelToList: bucket.levelToList,
                    levelToGet: bucket.levelToGet,
                    levelToPut: bucket.levelToPut,
                });
            }
        }

        reply.send({
            success: true,
            items: data,
        });
    }
}

module.exports = Handler;