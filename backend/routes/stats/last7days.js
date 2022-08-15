const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/stats/last7days';
	}

    async handle(req, reply) {
        if (!req.user || !req.user.hasLevelOf('admin')) {
            throw new Error('Only admin can view this stats');
        }

        // get count of parsed items in last 7 days
        let curDate = new Date();
        let stats = [];

        for (let i = 0; i < 7; i++) {
            const fromDate = new Date(curDate.getTime());
            const toDate = new Date(curDate.getTime());
            fromDate.setDate(fromDate.getDate() - (i+1));
            toDate.setDate(toDate.getDate() - (i));

            const count = await this._db.Notification.countDocuments({
                createdAt: {
                    $gte: fromDate,
                    $lt: toDate,
                },
            });

            stats.push({
                count: count,
                date: fromDate,
            });
        }

        return reply.send({
            success: true,
            stats: stats,
        });
    }
}

module.exports = Handler;