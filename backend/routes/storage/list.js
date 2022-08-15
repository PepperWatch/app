const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/storage/list';
	}

    async handle(req, reply) {
        const bucket = req.body.bucket;
        const path = req.body.path || '';

        const storage = await this.db.Setting.getStorage();
        const storageBucket = await storage.getBucket(bucket);

        if (!storageBucket) {
            reply.send({
                success: false,
            });
        } else {
            const hasAccess = storageBucket.hasAccessToList(req.user);
            if (hasAccess) {
                const items = await storageBucket.list(path);

                reply.send({
                    success: true,
                    items: items,
                });
            } else {
                reply.send({
                    success: false,
                });
            }
        }
    }
}

module.exports = Handler;