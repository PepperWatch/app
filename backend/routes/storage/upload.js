const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/storage/upload';
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
            const hasAccess = storageBucket.hasAccessToPut(req.user);
            if (hasAccess) {
                const data = await storageBucket.presignedPost(path);

                reply.send({
                    success: true,
                    data: data,
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